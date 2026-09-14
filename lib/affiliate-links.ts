export type AffiliateProvider = "yahoo" | "amazon" | "rakuten" | "service";
export type AffiliateCategory = "storage" | "packing" | "grading" | "selling";

export type AffiliateLink = {
  id: string;
  category: AffiliateCategory;
  provider: AffiliateProvider;
  label: string;
  href: string;
  enabled: boolean;
  destinationName?: string;
  disclosure?: string;
  reviewedAt?: string;
};

// Central switchboard for approved monetization links.
// enabled=false until the exact media/account approval, tracked URL and provider rules are verified.
// Amazon: start with approved text links; do not download/re-host Amazon product images.
// Rakuten: HOLD. Current Rakuten rules prohibit affiliate placement on sites containing content
// that promotes resale/tenbai. Do not enable until PREMIUM HUB eligibility is confirmed.
export const affiliateLinks: AffiliateLink[] = [
  { id: "storage-yahoo", category: "storage", provider: "yahoo", label: "Yahoo!ショッピングで保管用品を見る", href: "", enabled: false, destinationName: "Yahoo!ショッピング" },
  { id: "storage-amazon", category: "storage", provider: "amazon", label: "Amazonで保管用品を見る", href: "", enabled: false, destinationName: "Amazon.co.jp" },
  { id: "storage-rakuten", category: "storage", provider: "rakuten", label: "楽天市場で保管用品を見る", href: "", enabled: false, destinationName: "楽天市場", disclosure: "サイト適格性確認まで有効化禁止" },
  { id: "packing-yahoo", category: "packing", provider: "yahoo", label: "Yahoo!ショッピングで梱包用品を見る", href: "", enabled: false, destinationName: "Yahoo!ショッピング" },
  { id: "packing-amazon", category: "packing", provider: "amazon", label: "Amazonで梱包用品を見る", href: "", enabled: false, destinationName: "Amazon.co.jp" },
  { id: "packing-rakuten", category: "packing", provider: "rakuten", label: "楽天市場で梱包用品を見る", href: "", enabled: false, destinationName: "楽天市場", disclosure: "サイト適格性確認まで有効化禁止" },
];

export function activeAffiliateLinks(category: AffiliateCategory) {
  return affiliateLinks.filter((link) => link.category === category && link.enabled && /^https:\/\//.test(link.href));
}
