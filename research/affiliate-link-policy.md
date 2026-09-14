# Affiliate link implementation policy

Last reviewed: 2026-09-14

This note records the official-rule checks for PREMIUM HUB. Re-check provider terms before enabling links.

## Common rules
- Keep affiliate disclosure visible.
- Enable only approved/registered media and exact tracked URLs; never invent tracking parameters.
- Do not disguise destinations or ask for clicks merely to support the site.
- Avoid hard-coded price, shipping, fee or campaign claims unless there is a current official source/update process.
- Store approved destinations in `lib/affiliate-links.ts`.

## Yahoo! Shopping
### Direct Yahoo! Shopping Affiliate
Official Yahoo! Shopping affiliate information says a Yahoo! JAPAN ID can be used to start, with 2-factor authentication required. Current published conditions say rates vary by product/category (the public FAQ describes a 2–4% minimum range), and attribution requires affiliate-link click, cart addition within 24 hours, and order completion within 89 days. Rewards are paid as PayPay Money. Always treat current product rate as dynamic.

### ValueCommerce route
ValueCommerce supports Yahoo! Shopping examples through MyLink. MyLink requires advertiser partnership, and the specific program must permit MyLink. Advertiser-specific rules still apply. The Chrome extension's MyLink output is text-link only; other MyLink methods may provide product image/text link code according to the program.

PREMIUM HUB plan: use approved text/deep links first. Do not copy/re-host Yahoo product images unless the exact program terms explicitly permit the chosen method.

## Amazon Associates Japan
- PREMIUM HUB tracking ID confirmed in the Associates account: `premiumsokuho-22`.
- Active Associates account and compliance with the operating agreement are required.
- Creators API remains a later phase until Amazon's current eligibility requirements are satisfied.
- Do not download/re-host or screenshot Amazon product images. Use Amazon-provided image URLs/tools when image integration becomes eligible.
- Amazon program content must link to the relevant Amazon page, not be repurposed to promote another retailer.
- Amazon product-content/API integration must remain isolated from PREMIUM HUB's non-Amazon market-price tracking features and be re-reviewed before launch.

PREMIUM HUB plan: Phase 1 uses Associates-generated text/product links tied to `premiumsokuho-22`. Phase 2 image cards only after the exact current Amazon-provided image/API mechanism is implemented and reviewed.

Initial Phase 1 product slots:
- card sleeves
- top loaders / hard cases
- unopened BOX protection cases
- humidity-control supplies
- OPP bags
- bubble wrap / cushioning
- shipping boxes

Each slot has a Yahoo and Amazon record in `lib/affiliate-links.ts`. Records stay disabled until the exact tracked destination is generated and checked. This allows one approved link to be enabled without exposing unfinished placeholders.

## Rakuten Affiliate — HOLD pending eligibility confirmation
Important: the current Rakuten Affiliate guideline lists sites containing content that promotes resale/tenbai among prohibited affiliate-link placements. PREMIUM HUB contains market/selling guidance, so Rakuten eligibility is not assumed. Do not enable Rakuten links until Rakuten confirms the site's actual content/use case is acceptable or the site is otherwise clearly eligible under current rules.

If eligibility is confirmed:
- register the media/site as required;
- use Rakuten-generated affiliate links and do not alter restricted generated HTML, destination URLs or tag attributes;
- do not use third-party URL shorteners;
- make the Rakuten destination clear;
- do not copy ordinary Rakuten shop-page images;
- use only images/link materials allowed through Rakuten Affiliate and follow its current resizing/cropping/overlay restrictions;
- re-check attribution/rate conditions at launch.

## Grading and buyback services
- Compare PSA and other services editorially even if no affiliate agreement exists.
- Affiliate CTA only after advertiser/ASP approval and confirmation of deep-link/creative rules.
- Never rank a grading or buyback service solely by commission.
- Fee, turnaround, insurance and grading claims need official source + review date.
- Keep factual comparison data separate from advertising status.

## Rollout status
- Yahoo: READY FOR ACCOUNT/LINK VERIFICATION; text/deep-link first.
- Amazon: tracking ID confirmed; READY FOR ASSOCIATES LINK CREATION; text links first, API/images later.
- Rakuten: BLOCKED until site eligibility is confirmed because of the resale-content restriction.
- Grading/buyback: READY FOR advertiser discovery and approval checks.

No unverified affiliate URL or product image is published by this branch.
