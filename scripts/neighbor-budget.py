"""Root-owned daily Reticulum relay supervisor. Reservations survive restarts."""
import datetime as dt
import fcntl
import json
import os
from pathlib import Path
import pwd
import signal
import sqlite3
import subprocess
import time

MONTHLY = 50_000_000
DAILY = 1_600_000
MARGIN = 100_000
ROOT = Path('/var/lib/geocompanion-neighbor')
TABLE = 'geocompanion_neighbor'

def reserve(db, now):
    db.execute('CREATE TABLE IF NOT EXISTS grants (day TEXT PRIMARY KEY, month TEXT NOT NULL, bytes INTEGER NOT NULL)')
    db.commit()
    day, month = now.strftime('%Y-%m-%d'), now.strftime('%Y-%m')
    with db:
        db.execute('BEGIN IMMEDIATE')
        if db.execute('SELECT 1 FROM grants WHERE day=?', (day,)).fetchone():
            return 0
        used = db.execute('SELECT COALESCE(SUM(bytes),0) FROM grants WHERE month=?', (month,)).fetchone()[0]
        # A backwards clock cannot allocate another earlier day's allowance.
        latest = db.execute('SELECT MAX(day) FROM grants').fetchone()[0]
        if latest and day < latest:
            return 0
        amount = min(DAILY, max(0, MONTHLY - used))
        db.execute('INSERT INTO grants VALUES (?,?,?)', (day, month, amount))
    return amount

def firewall(uid, allowance=0):
    exists = subprocess.run(['nft', 'list', 'table', 'inet', TABLE], capture_output=True).returncode == 0
    rules = f'delete table inet {TABLE}\n' if exists else ''
    rules += f'table inet {TABLE} {{\n chain output {{ type filter hook output priority -10; policy accept;\n'
    if allowance:
        rules += f'meta skuid {uid} quota until {allowance} bytes counter accept\n'
    rules += f'meta skuid {uid} counter drop\n }}\n}}\n'
    subprocess.run(['nft', '-c', '-f', '-'], input=rules, text=True, check=True)
    subprocess.run(['nft', '-f', '-'], input=rules, text=True, check=True)

def usage():
    result = subprocess.run(['nft', '-j', 'list', 'table', 'inet', TABLE], capture_output=True, text=True, check=True)
    counters = []
    for item in json.loads(result.stdout)['nftables']:
        if 'rule' in item:
            for expression in item['rule']['expr']:
                if 'counter' in expression:
                    counters.append(expression['counter']['bytes'])
    if len(counters) != 2:
        raise RuntimeError('Quota rules missing or altered')
    return counters

def main():
    if os.geteuid() != 0:
        raise SystemExit('Run through the root-owned service')
    os.umask(0o077)
    ROOT.mkdir(exist_ok=True)
    lock = (ROOT / 'lock').open('w')
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    user = pwd.getpwnam('geo-neighbor')
    firewall(user.pw_uid)
    now = dt.datetime.now(dt.timezone.utc)
    with sqlite3.connect(ROOT / 'budget.sqlite') as db:
        allowance = reserve(db, now)
    if allowance <= MARGIN:
        print('No new allowance; relay stays stopped', flush=True)
        return
    def stop(signum, frame):
        raise SystemExit(0)
    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    child = None
    try:
        firewall(user.pw_uid, allowance - MARGIN)
        child = subprocess.Popen(
            ['/opt/geocompanion-neighbor/venv/bin/rnsd', '--config', str(ROOT / 'rns'), '-q'],
            user=user.pw_uid, group=user.pw_gid, extra_groups=[],
            env={'PATH': '/usr/bin:/bin', 'HOME': str(ROOT / 'rns'), 'PYTHONUNBUFFERED': '1'},
        )
        print(f'Relay started with {allowance} reserved bytes; {allowance-MARGIN} packet-byte quota', flush=True)
        started = time.monotonic()
        while child.poll() is None:
            allowed, dropped = usage()
            status = {'day': now.date().isoformat(), 'reserved_bytes': allowance, 'allowed_packet_bytes': allowed, 'dropped_packet_bytes': dropped, 'checked_at': dt.datetime.now(dt.timezone.utc).isoformat()}
            temporary = ROOT / 'status.tmp'
            temporary.write_text(json.dumps(status))
            temporary.replace(ROOT / 'status.json')
            if dropped or dt.datetime.now(dt.timezone.utc).date() != now.date() or time.monotonic()-started >= 86400:
                break
            time.sleep(15)
    finally:
        firewall(user.pw_uid)
        if child and child.poll() is None:
            child.terminate()
            try:
                child.wait(timeout=10)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()
        print('Relay stopped; remaining daily reservation is forfeited', flush=True)

if __name__ == '__main__':
    main()
