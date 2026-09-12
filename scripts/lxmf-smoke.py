"""Bounded owner-only LXMF delivery test; private state stays on Linux."""
import argparse
import json
import os
from pathlib import Path
import time
import RNS
import LXMF

parser = argparse.ArgumentParser()
parser.add_argument('--state', required=True)
parser.add_argument('--recipient', required=True)
parser.add_argument('--listen-only', action='store_true')
parser.add_argument('--opportunistic', action='store_true')
parser.add_argument('--propagation')
parser.add_argument('--count', type=int, choices=range(1,4), default=1)
parser.add_argument('--message', default='Geo Companion: Linux messaging test. Please reply received.')
args = parser.parse_args()
recipient = bytes.fromhex(args.recipient)
if len(recipient) != 16 or len(args.message.encode()) > 512:
    raise SystemExit('Invalid recipient or oversized test message')
os.umask(0o077)
root = Path(args.state).expanduser()
root.mkdir(parents=True, exist_ok=True)
config = root / 'reticulum'
config.mkdir(exist_ok=True)
if not (config / 'config').exists():
    (config / 'config').write_text('''[reticulum]
enable_transport = no
share_instance = no
[logging]
loglevel = 2
[interfaces]
  [[Retichat backbone]]
    type = TCPClientInterface
    enabled = yes
    target_host = rns.noderage.org
    target_port = 4242
''')
RNS.Reticulum(configdir=str(config))
identity_path = root / 'identity'
identity = RNS.Identity.from_file(str(identity_path)) if identity_path.exists() else RNS.Identity()
if identity is None:
    raise SystemExit('Stored identity could not be loaded')
if not identity_path.exists():
    identity.to_file(str(identity_path))
router = LXMF.LXMRouter(storagepath=str(root / 'lxmf'), enforce_stamps=False)
source = router.register_delivery_identity(identity, display_name='Geo Companion maintenance', stamp_cost=8)
print(json.dumps({'sender': source.hash.hex()}), flush=True)

def received(message):
    if message.source_hash == recipient and message.signature_validated:
        print(json.dumps({'event': 'owner_reply', 'verified': True}), flush=True)

router.register_delivery_callback(received)
time.sleep(5)
router.announce(source.hash)
if args.listen_only:
    time.sleep(180)
    raise SystemExit(0)
path_target = bytes.fromhex(args.propagation) if args.propagation else recipient
if len(path_target) != 16: raise SystemExit('Invalid propagation address')
RNS.Transport.request_path(path_target)
deadline = time.monotonic() + 60
while not RNS.Transport.has_path(path_target) and time.monotonic() < deadline:
    time.sleep(1)
remote = RNS.Identity.recall(recipient)
if remote is None or not RNS.Transport.has_path(path_target):
    raise SystemExit('No recipient path within 60 seconds; keep Retichat open and retry')
destination = RNS.Destination(remote, RNS.Destination.OUT, RNS.Destination.SINGLE, 'lxmf', 'delivery')
method = LXMF.LXMessage.PROPAGATED if args.propagation else (LXMF.LXMessage.OPPORTUNISTIC if args.opportunistic else LXMF.LXMessage.DIRECT)
if args.propagation: router.set_outbound_propagation_node(path_target)
messages = []
started = time.monotonic()
last_states = {}
deadline = started + (args.count-1)*30 + 90
while time.monotonic() < deadline:
    if len(messages) < args.count and time.monotonic()-started >= len(messages)*30:
        number = len(messages)+1
        body = f'Test {number}/{args.count}: {args.message}' if args.count > 1 else args.message
        message = LXMF.LXMessage(destination, source, body, 'Geo Companion', desired_method=method, include_ticket=True)
        router.handle_outbound(message)
        messages.append(message)
        print(json.dumps({'event':'queued', 'number':number, 'elapsed_seconds':round(time.monotonic()-started)}), flush=True)
    for number, message in enumerate(messages, 1):
        if last_states.get(number) != message.state:
            last_states[number] = message.state
            print(json.dumps({'number':number, 'state':message.state, 'delivered':message.state == LXMF.LXMessage.DELIVERED, 'accepted_by_propagation':bool(args.propagation and message.state == LXMF.LXMessage.SENT), 'attempts':message.delivery_attempts}), flush=True)
    if len(messages) == args.count and all(m.state in (LXMF.LXMessage.DELIVERED, LXMF.LXMessage.FAILED, LXMF.LXMessage.REJECTED) for m in messages):
        break
    time.sleep(1)
delivered = sum(m.state == LXMF.LXMessage.DELIVERED for m in messages)
accepted = sum(args.propagation and m.state == LXMF.LXMessage.SENT for m in messages)
print(json.dumps({'delivered_count':delivered, 'accepted_by_propagation_count':accepted, 'queued_count':len(messages)}), flush=True)
raise SystemExit(0 if delivered+accepted == args.count else 1)
