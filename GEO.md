# Geo integration references

## User-selected references

- [SDK README](https://github.com/geobrowser/geo-sdk/blob/main/README.md)
- [Testnet GraphQL endpoint and explorer](https://api-testnet.geobrowser.io/graphql)
- [REST API reference (Swagger UI)](https://api-testnet.geobrowser.io/)
- [Machine-readable OpenAPI specification](https://api-testnet.geobrowser.io/openapi)
- [Selected space/entity page](https://www.geobrowser.io/space/784bfddae3f3976118c561bf28195b44/52b22516154345deac2a3d08b10e7cb2)

Configuration names: `GEO_API_ENDPOINT`, `GEO_NETWORK`, `GEO_TARGET_SPACE_ID`, and `GEO_TARGET_ENTITY_ID`. The selected values are in local `.env`; `.env.example` contains blank entries. These four values are public configuration. `PK_SW` is private signing material and is not needed for the reads below.

## Verified 2026-09-11

An unauthenticated POST to the supplied endpoint returned both selected IDs with no GraphQL errors:

```graphql
query {
  space(id: "784bfddae3f3976118c561bf28195b44") {
    id
  }
  entity(id: "52b22516154345deac2a3d08b10e7cb2") {
    id
  }
}
```

The endpoint returned HTTP 200 and `Access-Control-Allow-Origin: *` when given the proposed Pages origin. An OPTIONS preflight returned HTTP 204, allowed POST, and allowed `content-type`. This supports the direct browser architecture; an actual deployed-browser check remains outstanding.

Live schema introspection confirmed `space(id: UUID!)`, `entity(id: UUID!)`, and `entities` with pagination and a `spaceId` filter. The minimal check proves each ID exists, not that the entity belongs to the selected space or what content it holds. The rendered Geo page could not be retrieved with the web reader.

The older sibling projects default to `https://testnet-api.geobrowser.io/graphql`; this project uses the user-supplied, tested `https://api-testnet.geobrowser.io/graphql`. Do not assume the two hosts have identical behavior.

## SDK notes

The user also supplied the REST reference. On 2026-09-11 its HTML returned HTTP 200 and identified Swagger UI loading `/openapi`. The specification identifies Geo API version 1.0.0 and OpenAPI 3.1.0. It documents entity search, entity snapshots/version history/diffs, profiles, proposal status, and IPFS edit/file uploads. These complement GraphQL reads; listing an operation does not verify its authentication requirements or live behavior. No upload or write endpoint was called. Inspect the relevant operation schema before implementation. Swagger UI does not by itself establish use of the Python FastAPI framework.

The current README describes `Ops` for operations and `createGeoClient` with `GeoTestnetConfig` for configured workflows. It explains that edits go to IPFS and their identifiers are posted onchain before indexing exposes data through the API. Older local SDK examples must be checked against the version chosen for this project. A simple read-only GraphQL client may not need the SDK.

## Still to establish

### External-app identity investigation — September 11, 2026

Read-only inspection of official geobrowser/geogenesis master confirms Geo uses Privy through `@geogenesis/auth` (`apps/web/core/wallet/privy.tsx`), maintains a Privy identity JWT (`apps/web/core/auth/identity-token.ts`), and resolves a wallet to a personal/member space (`apps/web/core/browse/resolve-member-space-from-wallet.ts`). Its documented sign-in deep link opens Geo's own sign-in modal; it does not establish an external-app identity callback (`apps/web/core/auth/sign-in-deep-link.ts`). Source: https://github.com/geobrowser/geogenesis/tree/master/apps/web/core/auth .

Geo Companion cannot read Geo's browser storage/session across origins. No supported external Geo SSO/token handoff has been verified. Before implementing identity, confirm Geo-supported integration and allowed origins, or design a separately consented wallet proof and verified profile mapping (including smart-account ownership). A public profile ID may personalize a read-only view but is not authentication or edit authority. Keep provider identity, wallet address and Geo personal-space ID distinct. No authentication code or credential access was added during this investigation.

- Display name/content and space-specific entity membership.
- A useful scoped query and bounded pagination for the frontend.
- Actual API rate limits and production availability expectations.
- A real IPFS content reference, gateway, and pinning responsibility.
- Browser integration from the deployed frontend.

No wallet key was read, no transaction was signed, and no remote data was changed during these checks.
