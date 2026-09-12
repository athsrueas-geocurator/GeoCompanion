# Budgeted Reticulum neighbor node

Deployed September 12, 2026 on linux-cloud at 15:50:39 UTC. The user explicitly requested contributing 5% of the monthly bandwidth budget. This is a separate transport node, not the private maintenance messenger and not an LXMF propagation/message-storage service.

## Budget

Use the existing conservative planning baseline of 1,000,000,000 bytes/month; 5% is **50,000,000 bytes/month**. This is an operator-selected ceiling, not a verified current account balance or a billing guarantee. Google's [Free Program documentation](https://docs.cloud.google.com/free/docs/free-cloud-features) lists 1 GB of outbound transfer from North America, with eligibility and destination conditions. Other VM traffic, account-wide consumption and installation/SSH traffic are outside this node allowance.

The root supervisor reserves up to **1,600,000 bytes per UTC day** in a durable SQLite ledger before starting any relay process. The kernel allows **1,500,000 outbound packet bytes**; the remaining 100,000 bytes are reserved as margin for accounting differences. Over 31 days this reserves at most 49,600,000 bytes, below the requested monthly ceiling. It does not roll unused daily allocations into a later burst.

Every run checks the ledger. A same-day restart cannot obtain another grant, and moving the clock backwards cannot create an earlier grant. A crash or restart forfeits the unused grant; the node waits until a later eligible day. Missing/corrupt ledger errors prevent startup rather than granting an unlimited budget. Do not delete or restore an older ledger during a month: administrative rollback could invalidate accounting.

`nftables` counts traffic from the dedicated `geo-neighbor` UID in the output hook: protocol messages, acknowledgements, connection setup and retransmissions attributable to its sockets. It drops packets after the quota is exhausted. The supervisor checks every 15 seconds and stops the daemon after a drop, at UTC day rollover, or after 24 elapsed hours. Quota enforcement itself does not wait for that poll. After exit, a deny rule for this UID remains. This is IP packet accounting, not a provider billing meter; link overhead and some kernel-generated traffic can differ. Never describe the 5% allocation as a whole-VM spending cap.

## Isolation and participation

- Dedicated system user `geo-neighbor`, no login, separate identity/state. The owner's Retichat address is not part of this node's configuration.
- Reticulum routing enabled; LXMF propagation disabled because only `rnsd` runs. No public TCP listener, open proxy or automatic peer discovery is configured.
- Two outbound `TCPClientInterface` connections in full mode: Noderage `155.4.245.160:4242` and MichMesh `173.255.213.18:7822`. Addresses were resolved from the endpoints in Retichat's published source on the deployment date. Numeric addresses avoid unaccounted resolver requests; changes require re-verification and configuration updates.
- Announce cap 1% on each interface reduces announcements; it is not a data quota. The firewall supplies the data quota.
- Process group limited to 180 MB memory, 10% of one CPU, and 32 tasks. No access to the maintenance identity, root .env, Geo wallet or Cloudflare token is needed.
- Transport participation may forward encrypted traffic and routing announcements. No claim is made that a third party's message has already traversed this node; two established connections verify reachability, not useful transit volume.

This small node is intermittent by design. Paths must be rediscovered when its budget is exhausted. With only 50 MB/month it is unsuitable as someone's dependable primary backbone or long-term message store. Assess whether the measured contribution justifies upkeep before expanding it.

## Files and operation

Source files: `scripts/neighbor-budget.py`, `scripts/neighbor-reticulum.conf`, `scripts/geocompanion-neighbor.service`, `scripts/geocompanion-neighbor.timer`, and pinned `scripts/lxmf-requirements.txt`.

On Linux: root-owned code and environment under `/opt/geocompanion-neighbor/`; root-owned `budget.sqlite` and `status.json` under `/var/lib/geocompanion-neighbor/`; private relay state in its `rns/` subdirectory owned by `geo-neighbor`. Parent mode 0711 permits traversal without listing; private files use 0600. The service runs the quota supervisor as root, which launches `rnsd` with the unprivileged UID and empty supplementary groups. Only this node's nftables table is replaced; other host firewall rules are not flushed.

The enabled system timer runs daily at **00:01 UTC**, with missed-run catch-up. On reboot, the ledger prevents a second same-day allowance. Inspect:

```sh
sudo systemctl status geocompanion-neighbor.service geocompanion-neighbor.timer
sudo cat /var/lib/geocompanion-neighbor/status.json
sudo nft list table inet geocompanion_neighbor
sudo journalctl -u geocompanion-neighbor.service -n 20
```

Disable both scheduled and current participation:

```sh
sudo systemctl disable --now geocompanion-neighbor.timer
sudo systemctl stop geocompanion-neighbor.service
```

Do not restart repeatedly expecting extra capacity. Configuration changes must preserve the ledger and verified UID-specific rules. Keep local status private; no Cloudflare status publication or owner alert has been wired yet. The private messenger's reverse-delivery problem remains tracked in [LXMF setup](LXMF_SETUP.md).

## Verification and remaining limits

Three Python budget tests passed: repeated/backwards dates, whole-month limit/rollover and remaining allowance. A real loopback-only firewall probe allowed exactly 1,024 packet bytes and dropped 11,776; its temporary table was removed afterward. systemd unit verification passed (unrelated existing XFS unit deprecation warnings were reported). Both backbone TCP sessions established; initial service memory was about 29 MB and early kernel outbound count was 7,038 bytes. Startup status contains a checked-at timestamp; it is a snapshot, not a guarantee the service is still running.

Not yet observed: actual month rollover, full-day traffic, forced reboot recovery, useful third-party transit, external billing reconciliation or alert delivery on budget exhaustion. Kernel quota and durable pre-reservation cover the cap without requiring those observations, but long-term reliability still needs operational validation. Code tests should be run on Linux because the supervisor uses Linux user and file-lock facilities.

Protocol references: [Reticulum transport](https://reticulum.network/manual/understanding.html), [interface configuration](https://reticulum.network/manual/interfaces.html), [nftables quotas](https://wiki.nftables.org/wiki-nftables/index.php/Quotas).
