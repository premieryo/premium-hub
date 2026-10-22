# 2026-10-04 development continuation

Base: main ef8b701a1900c0e1dd51beb0347501a11192a8b1 (PR #40 included).

## Image acquisition

- `scripts/backfillProductImages.ts` now selects independently of release dates, price flags and the 10-box rolling window.
- Yahoo image searches omit the in-stock filter; price searches still require stock.
- Image selection verifies product identity, new condition, quantity, exact HTTPS provider hosts, referral path and numeric sid/pid, and positive image dimensions. No manufacturer scraping, image downloads or image optimization is added.
- Existing Amazon/other provider assets and explicit imageEnabled=false are preserved.
- Price refresh no longer updates image fields. Images are refreshed through the separate script.
- Default is dry-run. No image cron or database migration is activated by this PR.
- After approval, run with the authorized environment loaded, e.g. `node --env-file=.env.local --import tsx scripts/backfillProductImages.ts` (dry-run), then the same command with `--apply`. Image writes use optimistic concurrency and a follow-up SELECT.
- Assets may still be unavailable when no approved affiliate listing exists. Production ValueCommerce identifiers are configured only for production, so Preview cannot perform affiliate image acquisition with its current environment.

## Price validation

- Match query tokens individually, allowing inserted shop terms and FB-10 / FB10 punctuation variants.
- Exclude multi-box quantities including 10/12/20-box sets, without treating OP-17 as a quantity.
- Require series identity, reject conflicting JANs, foreign-language editions, accessory boxes and incompatible Pokemon variants.
- Reject loose packs, selectable/random items and reservations for released market prices.
- Try the next safe result when the first API result fails validation, retaining the existing relevance order and price-change guard.

## Read-only production audit

Supabase was queried using SELECT only. Retrieved prices are historical snapshots, not asserted to be current market-wide prices.

| Product | Saved price | Source check | Action remaining |
| --- | ---: | --- | --- |
| Black Bolt normal BOX | 1,180 | Source is a storage loader, not cards | Clear erroneous commerce fields after approval, then safely reacquire |
| White Flare normal BOX | 1,180 | Same storage-loader source | Clear erroneous commerce fields after approval, then safely reacquire |
| Storm Emeralda BOX | 11,600 | Shop page matches; shipping is additional | No manual overwrite |
| OP-17 BOX | 12,800 | Shop page matches an unopened BOX | No manual overwrite |
| Dragon Ball ST01 BOX | 13,500 | Source page currently shows 29,800 and out of stock; snapshot freshness needs review | Reacquire valid in-stock candidates; do not overwrite using an out-of-stock price |

Source pages inspected:
- https://store.shopping.yahoo.co.jp/horikku/2buuu1o801.html
- https://store.shopping.yahoo.co.jp/torekanorikyuu/pk-bp-se.html
- https://store.shopping.yahoo.co.jp/akaikumasan/4582770058406.html
- https://store.shopping.yahoo.co.jp/yosabei/4582770011982.html

Full live Yahoo dry-runs were not executed locally: the connector lists YAHOO_CLIENT_ID as sensitive and does not return its decrypted value. Never invoke the production price cron to bypass read-only restrictions. Existing anomalous historical data requires separate approval and verification before repair; no production rows were changed here.

## UI

- CSS-only PresokuBackground is shared by home, today, cross-genre lists, genre frames and the common guide. No remote image dependency, JS animation or pointer interception.
- `/other` combines Beyblade and figure products and lotteries. Home presents one combined category; all original URLs/data remain available.
- Non-card products/rankings bypass booster-only filters, and visible labels/metadata use product wording.
- Existing PR #35 is still open; the new combined hub plus non-card fixes supersede its narrow display-name approach. Do not merge it on top without revising its scope.
