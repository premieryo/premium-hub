import type { Product, ProductCategory, RankingItem } from "@/data/types";

export const CARD_GENRES = new Set(["pokemon", "onepiece", "dragonball"]);

export function getProductCategory(product: Product): ProductCategory | undefined {
  if (product.productCategory) return product.productCategory;
  if (!CARD_GENRES.has(product.genre)) return undefined;
  return product.type === "box" ? "booster-box" : undefined;
}

export function productsInCategory(products: Product[], category: ProductCategory) {
  return products.filter((product) => getProductCategory(product) === category);
}

export function rankingInCategory(ranking: RankingItem[], products: Product[], category: ProductCategory) {
  const allowed = new Set(productsInCategory(products, category).map((product) => product.id));
  return ranking.filter((item) => allowed.has(item.id));
}

export const RETAIL_COMPARISON_THRESHOLDS = { premium: 50, aboveRetail: 10, nearRetail: -10 } as const;

export function compareWithRetailPrice(currentPrice?: number, retailPrice?: number) {
  if (!currentPrice || !retailPrice || currentPrice <= 0 || retailPrice <= 0) return null;
  const rate = ((currentPrice / retailPrice) - 1) * 100;
  if (rate >= RETAIL_COMPARISON_THRESHOLDS.premium) return { rate, label: "プレミア", tone: "fire" } as const;
  if (rate >= RETAIL_COMPARISON_THRESHOLDS.aboveRetail) return { rate, label: "定価より高め", tone: "high" } as const;
  if (rate >= RETAIL_COMPARISON_THRESHOLDS.nearRetail) return { rate, label: "定価付近", tone: "near" } as const;
  return { rate, label: "定価割れ", tone: "below" } as const;
}
