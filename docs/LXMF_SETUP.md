# Linux-to-Retichat setup

September 12, 2026: owner selected Retichat and supplied their public LXMF address privately in chat. Linux SSH access verified. Installed Ubuntu `python3.14-venv` and an isolated environment at `/home/thomasfreestone/geocompanion-maintenance/venv`; installed LXMF 1.1.1 and RNS 1.5.4. No system service or timer is enabled.

`scripts/lxmf-smoke.py` is a bounded owner-directed smoke test, not the maintenance scheduler. Copy it to `~/geocompanion-maintenance/lxmf-smoke.py` on linux-cloud. It creates a persistent private identity and protocol state under a caller-selected directory with umask 077. Never copy the identity into Git or the frontend. Public contact: `b6dea259ae5419fa936ab71be075a473` (Geo Companion maintenance).

```sh
timeout 200 ~/geocompanion-maintenance/venv/bin/python \
  ~/geocompanion-maintenance/lxmf-smoke.py \
  --state ~/geocompanion-maintenance/state \
  --recipient PUBLIC_OWNER_LXMF_ADDRESS
```

The initial configuration uses one outbound TCP connection to `rns.noderage.org:4242`, selected from Retichat's published DefaultEndpointManager.swift. Transport routing and shared-instance mode are disabled. No propagation service or relay is enabled. Announce/path traffic is public metadata; the actual test message uses encrypted direct LXMF delivery. A public backbone connection succeeded; this alone does not demonstrate message delivery or a low monthly egress budget.

The test defaults to one message. With --count 3 it queues three numbered messages at 0, 30 and 60 seconds in one running process, followed by up to 90 seconds for final receipts. Path discovery has a 60-second bound; use an outer timeout of 230 seconds for this batch. Base message text is capped at 512 UTF-8 bytes; numbered prefixes add a few bytes. LXMF may perform protocol retries. It reports the public sender address and receipt state, and recognizes only signature-verified replies from the selected owner; it executes no inbound commands and does not log message bodies. It listens for verified replies during the run and exits when all queued messages reach a terminal state or the final deadline expires. The outer timeout supplies an additional process bound.

First test result: recipient path discovered, but the 90-second delivery window ended in state 1 without a delivered receipt; process exited with code 1. The owner then added the Linux contact through Retichat's privacy filter and sent a message. Linux received it and verified its signature against the selected owner address. Phone-to-Linux is confirmed; reverse delivery and locked-phone notifications remain separate acceptance gates.

Next acceptance gates: verify an actual delivered receipt and owner confirmation with Retichat foregrounded, then test locked-phone delivery separately. Retichat's public source registers APNs through a push bridge and uses RFed propagation; direct foreground delivery does not establish this path. Obtain the app's configured propagation-node details from its public settings before selecting a propagation destination. Do not infer the App Store build's private bridge configuration from the open-source build defaults.

Resolved dependencies are pinned in `scripts/lxmf-requirements.txt`. `--listen-only` announces and listens for 180 seconds without sending an application message. `--opportunistic` selects the upstream's encrypted packet delivery method for a short-message compatibility test; default remains direct-link delivery.

Remaining: add protocol-failure and timeout tests before adapting this smoke script into production; persist a private owner allowlist and bounded outbox; verify reboots and independent watchdog delivery; measure traffic including retries. See [maintenance design](MAINTENANCE.md). No reminders, domain renewals, paid upgrades, Geo writes or Cloudflare changes were enabled by this installation.

References: [LXMF sender example](https://github.com/markqvist/LXMF/blob/master/docs/example_sender.py), [Reticulum TCP interface configuration](https://reticulum.network/manual/interfaces.html#tcp-client-interface), [Retichat source](https://github.com/jrl290/Retichat-ios).

## Foreground two-way success — September 12

With the owner keeping Retichat open, one continuous Linux session queued three numbered direct LXMF messages at 0, 30 and 60 seconds. All three reached DELIVERED (state 8). Two signature-verified owner replies were observed during the same run. This establishes two-way foreground delivery; it does not prove locked-phone/APNs delivery or determine the exact cause of earlier failures. The bounded test exited successfully and left no maintenance daemon running. The separate budgeted neighbor transport remains independent.
