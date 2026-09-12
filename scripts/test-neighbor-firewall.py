"""Run as root on Linux before relay activation; loopback-only quota test."""
import importlib.util
import pwd
import subprocess

spec = importlib.util.spec_from_file_location('budget', '/opt/geocompanion-neighbor/neighbor-budget.py')
budget = importlib.util.module_from_spec(spec)
spec.loader.exec_module(budget)
budget.TABLE = 'geocompanion_neighbor_test'
user = pwd.getpwnam('geo-neighbor')
try:
    budget.firewall(user.pw_uid, 1024)
    probe = "import socket\ns=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)\nfor _ in range(100):\n try: s.sendto(b'x'*100,('127.0.0.1',59999))\n except PermissionError: pass\n"
    subprocess.run(['/usr/bin/python3', '-c', probe], user=user.pw_uid, group=user.pw_gid, extra_groups=[], check=True)
    allowed, dropped = budget.usage()
    assert 0 < allowed <= 1024, (allowed, dropped)
    assert dropped > 0, (allowed, dropped)
    print({'allowed_packet_bytes': allowed, 'dropped_packet_bytes': dropped, 'passed': True})
finally:
    subprocess.run(['nft', 'delete', 'table', 'inet', budget.TABLE], check=True)
