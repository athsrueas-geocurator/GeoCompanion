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
RNS.Transport.request_path(recipient)
deadline = time.monotonic() + 60
while not RNS.Transport.has_path(recipient) and time.monotonic() < deadline:
    time.sleep(1)
remote = RNS.Identity.recall(recipient)
if remote is None or not RNS.Transport.has_path(recipient):
    raise SystemExit('No recipient path within 60 seconds; keep Retichat open and retry')
destination = RNS.Destination(remote, RNS.Destination.OUT, RNS.Destination.SINGLE, 'lxmf', 'delivery')
message = LXMF.LXMessage(destination, source, args.message, 'Geo Companion', desired_method=LXMF.LXMessage.DIRECT, include_ticket=True)
router.handle_outbound(message)
deadline = time.monotonic() + 90
while message.state not in (LXMF.LXMessage.DELIVERED, LXMF.LXMessage.FAILED) and time.monotonic() < deadline:
    time.sleep(1)
delivered = message.state == LXMF.LXMessage.DELIVERED
print(json.dumps({'delivered': delivered, 'state': message.state}), flush=True)
if delivered:
    time.sleep(30)
raise SystemExit(0 if delivered else 1)
