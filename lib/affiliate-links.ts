export type AffiliateProvider = "yahoo" | "amazon" | "rakuten" | "service";
export type AffiliateCategory = "storage" | "packing" | "grading" | "selling";
export type AffiliateUseCase = "card-sleeves" | "top-loaders" | "box-cases" | "humidity-control" | "opp-bags" | "bubble-wrap" | "shipping-boxes" | "grading-service" | "buyback-service";

export type AffiliateLink = {
  id: string;
  category: AffiliateCategory;
  useCase?: AffiliateUseCase;
  provider: AffiliateProvider;
  label: string;
  href: string;
  enabled: boolean;
  destinationName?: string;
  disclosure?: string;
  reviewedAt?: string;
};

export const AMAZON_ASSOCIATE_TRACKING_ID = "premiumsokuho-22";

// Central switchboard for approved monetization links.
// enabled=false until the exact media/account approval, tracked URL and provider rules are verified.
// Amazon: use Associates-generated links tied to AMAZON_ASSOCIATE_TRACKING_ID. Do not download/re-host Amazon product images.
// Rakuten: HOLD. Current Rakuten rules may conflict with resale/tenbai-oriented content. Do not enable until PREMIUM HUB eligibility is confirmed.
export const affiliateLinks: AffiliateLink[] = [
  { id: "storage-yahoo-sleeves", category: "storage", useCase: "card-sleeves", provider: "yahoo", label: "Yahoo!でカードスリーブを見る", href: "", enabled: false, destinationName: "Yahoo!ショッピング" },
  { id: "storage-amazon-sleeves", category: "storage", useCase: "card-sleeves", provider: "amazon", label: "Amazonでカードスリーブを見る", href: "", enabled: false, destinationName: "Amazon.co.jp" },
  { id: "storage-yahoo-loaders", category: "storage", useCase: "top-loaders", provider: "yahoo", label: "Yahoo!でローダーを見る", href: "", enabled: false, destinationName: "Yahoo!ショッピング" },
  { id: "storage-amazon-loaders", category: "storage", useCase: "top-loaders", provider: "amazon", label: "Amazonでローダーを見る", href: "", enabled: false, destinationName: "Amazon.co.jp" },
  { id: "storage-yahoo-box-cases", category: "storage", useCase: "box-cases", provider: "yahoo", label: "Yahoo!でBOX保護ケースを見る", href: "", enabled: false, destinationName: "Yahoo!ショッピング" },
  { id: "storage-amazon-box-cases", category: "storage", useCase: "box-cases", provider: "amazon", label: "AmazonでBOX保護ケースを見る", href: "", enabled: false, destinationName: "Amazon.co.jp" },
  { id: "storage-yahoo-humidity", category: "storage", useCase: "humidity-control", provider: "yahoo", label: "Yahoo!で防湿用品を見る", href: "", enabled: false, destinationName: "Yahoo!ショッピング" },
  { id: "storage-amazon-humidity", category: "storage", useCase: "humidity-control", provider: "amazon", label: "Amazonで防湿用品を見る", href: "", enabled: false, destinationName: "Amazon.co.jp" },
  { id: "packing-yahoo-opp", category: "packing", useCase: "opp-bags", provider: "yahoo", label: "Yahoo!でOPP袋を見る", href: "", enabled: false, destinationName: "Yahoo!ショッピング" },
  { id: "packing-amazon-opp", category: "packing", useCase: "opp-bags", provider: "amazon", label: "AmazonでOPP袋を見る", href: "", enabled: false, destinationName: "Amazon.co.jp" },
  { id: "packing-yahoo-bubble", category: "packing", useCase: "bubble-wrap", provider: "yahoo", label: "Yahoo!で緩衝材を見る", href: "", enabled: false, destinationName: "Yahoo!ショッピング" },
  { id: "packing-amazon-bubble", category: "packing", useCase: "bubble-wrap", provider: "amazon", label: "Amazonで緩衝材を見る", href: "", enabled: false, destinationName: "Amazon.co.jp" },
  { id: "packing-yahoo-boxes", category: "packing", useCase: "shipping-boxes", provider: "yahoo", label: "Yahoo!で段ボールを見る", href: "", enabled: false, destinationName: "Yahoo!ショッピング" },
  { id: "packing-amazon-boxes", category: "packing", useCase: "shipping-boxes", provider: "amazon", label: "Amazonで段ボールを見る", href: "", enabled: false, destinationName: "Amazon.co.jp" },
  { id: "storage-rakuten-hold", category: "storage", provider: "rakuten", label: "楽天市場で保管用品を見る", href: "", enabled: false, destinationName: "楽天市場", disclosure: "サイト適格性確認まで有効化禁止" },
  { id: "packing-rakuten-hold", category: "packing", provider: "rakuten", label: "楽天市場で梱包用品を見る", href: "", enabled: false, destinationName: "楽天市場", disclosure: "サイト適格性確認まで有効化禁止" },
];

export function activeAffiliateLinks(category: AffiliateCategory, useCase?: AffiliateUseCase) {
  return affiliateLinks.filter((link) => link.category === category && (!useCase || link.useCase === useCase) && link.enabled && /^https:\/\//.test(link.href));
}
