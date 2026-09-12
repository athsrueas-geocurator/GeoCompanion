# Publishing queue

The canonical ordered queue is [geo-publisher/publishing_queue.md](https://github.com/athsrueas-geocurator/geo_publisher/blob/main/publishing_queue.md). Maintain publication status and receipts there; keep frontend implementation tasks in [TODO.md](TODO.md).

The user requested this sequence on 2026-09-11:

1. Finish and verify the active education-data work.
2. Publish a user-supplied editorial/reading-list pilot to [the user's Geo profile](https://www.geobrowser.io/space/d00460c203779d21d96fcfc6102d7a72), make it attractive within Geo, then read it in Geo Companion.
3. Apply the verified recipe to additional personal content as supplied.

Full publisher guidance: [editorial-profile-publishing.md](https://github.com/athsrueas-geocurator/geo_publisher/blob/main/docs/editorial-profile-publishing.md).

4. Indianapolis Homeless Outreach Coordination Directory — a separate dataset with its own namespace, service/schedule model and destination decision. See [research and publishing specification](https://github.com/athsrueas-geocurator/geo_publisher/blob/main/docs/indianapolis-outreach-directory.md). New-space creation requires explicit user approval. Initial discovery does not yet establish a suitable home.

All heavy content belongs on Geo infrastructure or Cloudflare. `linux-cloud` may only have a justified, small coordination role; it must not serve or proxy bulk media, article bodies, datasets or attachments. Editorial publication is Geo-profile based; the prior static editorial publication path is retired.
