# Affiliate link implementation policy

Last reviewed: 2026-09-14

This note is an implementation checklist, not a substitute for each provider's latest terms. Re-check official terms before enabling a new provider or changing image/link handling.

## Common rules

- Show the site's affiliate disclosure clearly.
- Only enable links after the site/media is registered or approved where required.
- Use the exact partner-generated/tracked URL and do not invent tracking parameters.
- Do not disguise the destination or ask users to click merely to support the site.
- Keep price, shipping, fee and campaign claims dynamic or omit them unless the source and update process can keep them current.
- Store approved destinations in `lib/affiliate-links.ts`; content pages should consume that central configuration rather than hard-code partner URLs.

## Yahoo! Shopping / ValueCommerce

Planned use: sleeves, loaders, unopened BOX cases, moisture protection, bubble wrap, boxes and other packing/storage supplies.

Before enabling:

1. Confirm PREMIUM HUB is registered/approved for the Yahoo! Shopping program in the relevant ASP account.
2. Generate the product/search/MyLink destination using the method currently allowed by the program.
3. Confirm whether product images may be stored, resized or cached before using any image. Do not reuse Yahoo! Shopping images based only on their public URL.
4. Add the approved tracked destination to `lib/affiliate-links.ts` and set `enabled: true` only after verification.
5. Re-check the advertiser-specific terms whenever the program or creative type changes.

Current implementation deliberately contains no unverified Yahoo image or tracking URL.

## Amazon Associates Japan

Official rules reviewed indicate that product/page links should be created with Amazon's provided linking tools (such as the Associates toolbar/Mobile Get Link). Amazon program content is governed by the Associates agreement and policies.

Important image rule: do not download Amazon product images and re-host them. Amazon's help states that product images should use Amazon-provided image URLs; captured Amazon product images should not be used. If API/product-content integration is added later, follow the then-current API/content caching and display rules.

Implementation plan:

- Phase 1: approved Amazon text/product links in the central config.
- Phase 2: image cards only after the exact Amazon-provided image/API method and cache lifetime are implemented correctly.
- Keep Amazon destinations clearly identifiable and retain required Associates disclosure wording in the site policy/disclosure area.
- Do not use paid/boosted ads to drive traffic to Amazon affiliate links unless Amazon's current rules explicitly allow the account/use case.

## Rakuten Affiliate

Official Rakuten guidelines require affiliate media registration and use of Rakuten's prescribed affiliate-link method. Generated link HTML must not be altered outside parts explicitly marked editable. Link destinations must not be changed and third-party URL shorteners must not be used.

For generated image affiliate links, use only sizes/methods allowed by Rakuten. Do not copy images from ordinary Rakuten shop pages. Rakuten's current guidance allows certain images obtained from the affiliate link-creation area under stated conditions; image cropping/overlay and other modifications remain restricted.

Implementation plan:

- Phase 1: approved Rakuten text/product links stored centrally.
- Phase 2: if image cards are used, render Rakuten-provided creative/HTML in a provider-specific component without rewriting restricted markup.
- Make it clear to users that the destination is Rakuten Market/a Rakuten shop.

## Grading and buyback services

- Compare services editorially even when no affiliate agreement exists; do not rank solely by commission.
- An affiliate CTA is enabled only after advertiser approval and confirmation that deep links/creative usage are permitted.
- Separate factual comparison fields (fee, turnaround, insurance, grading scale) from advertising status.
- Fee/turnaround claims need a source and review date because they change.
- PSA may remain a comparison option even if it produces no affiliate revenue.

## Data model / rollout

`lib/affiliate-links.ts` is the single switchboard for approved outbound monetization links. Each record has provider, label, URL, enabled state and optional disclosure. Empty arrays/disabled links render nothing, so the site can ship useful editorial pages before partner approval without fake buttons or dead affiliate links.

Next additions after account approval:

- storage: Yahoo / Amazon / Rakuten sleeves, loaders, BOX cases, humidity protection
- packing: Yahoo / Amazon / Rakuten OPP bags, bubble wrap, cardboard boxes, tape
- grading: approved grading-service campaigns
- selling: approved buyback/service campaigns
