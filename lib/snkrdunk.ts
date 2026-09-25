import type { Product } from "@/data/types";
import { isReleasedInTokyo } from "@/lib/price-tracking";

const SNKRDUNK_SEARCH_URL = "https://snkrdunk.com/search/";
export const SNKRDUNK_EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

// Add a product ID here if its search results are found to be misleading.
const hiddenProductIds = new Set<string>();

const directProductUrls = new Map<string, string>([
  ["30th-celebration-premium-deck-set-espeon-umbreon", "https://snkrdunk.com/apparels/881423"],
]);

function compactSearchTerm(value: string): string {
  return value
    .replace(/[「」［］\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function withoutToken(value: string, token: string): string {
  return compactSearchTerm(value.replace(new RegExp(`(^|\\s)${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`, "gi"), " "));
}

export function buildSnkrdunkSearchTerm(product: Product): string | null {
  if (!(["pokemon", "onepiece", "dragonball"] as const).includes(product.genre as "pokemon" | "onepiece" | "dragonball")) return null;
  if (hiddenProductIds.has(product.id)) return null;

  if (product.productCategory === "collection-box") {
    return compactSearchTerm(product.name);
  }

  let name = withoutToken(product.searchWord || product.name, "BOX");
  if (product.seriesNumber && (product.genre === "onepiece" || product.genre === "dragonball")) {
    name = withoutToken(name, product.seriesNumber);
    return compactSearchTerm(`${product.seriesNumber} ${name} BOX`);
  }
  return compactSearchTerm(`${name} BOX`);
}

export function buildSnkrdunkSearchUrl(product: Product): string | null {
  const directUrl = directProductUrls.get(product.id);
  if (directUrl) return directUrl;
  const keywords = buildSnkrdunkSearchTerm(product);
  if (!keywords) return null;
  const url = new URL(SNKRDUNK_SEARCH_URL);
  url.searchParams.set("keywords", keywords);
  return url.toString();
}

export function getSnkrdunkLinkLabel(product: Product): string {
  if (!isReleasedInTokyo(product)) return "スニダンで出品状況を見る ↗";
  if (product.priceTrackingEnabled && product.marketPrice) return "スニダンでも確認する ↗";
  return "スニダンで相場を確認 ↗";
}
