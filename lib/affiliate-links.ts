export type AffiliateProvider = "yahoo" | "amazon" | "rakuten" | "service";

export type AffiliateLink = {
  provider: AffiliateProvider;
  label: string;
  href: string;
  enabled: boolean;
  disclosure?: string;
};

// Central configuration for approved affiliate destinations.
// Keep enabled=false until the exact partner URL, media registration and usage terms are verified.
// Never place downloaded Amazon product images here. Amazon product content must use Amazon-provided tools/API under its current terms.
// For Rakuten, use links/HTML and images generated or explicitly permitted by Rakuten and do not alter restricted markup.
export const affiliateLinks = {
  storage: [] as AffiliateLink[],
  packing: [] as AffiliateLink[],
  grading: [] as AffiliateLink[],
  selling: [] as AffiliateLink[],
};

export function activeAffiliateLinks(key: keyof typeof affiliateLinks) {
  return affiliateLinks[key].filter((link) => link.enabled && /^https:\/\//.test(link.href));
}
