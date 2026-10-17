import type { Product, ProductImageAsset } from "@/data/types";
import { validateListingIdentity } from "./commerce-matching";

type ImageTarget = { id: string; product: string; productId?: string };
const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[\s「」『』【】\[\]]/g, "");

export function resolveProductImage(item: ImageTarget, products: Product[]): ProductImageAsset | undefined {
  // Some information rows point at a BOX ID while selling loose packs or
  // advertising several products. A BOX photo would misrepresent that offer.
  if (/パックセット|パックまとめ|BOX相当|ボックス相当|箱相当|[／/]/i.test(item.product)) return undefined;
  const explicitId = item.productId ?? item.id;
  const byId = products.find((product) => product.id === explicitId);
  if (byId) return byId.imageEnabled ? byId.imageAsset : undefined;
  // Never use partial names: normal/deluxe and bundles can share keywords.
  if (item.productId) return undefined;
  const matches = products.filter((product) => {
    if (normalize(product.name) === normalize(item.product)) return true;
    // Information titles commonly omit the publisher and BOX suffix.
    // Use the same full query/series/variant identity checks as acquisition,
    // then require one unambiguous master; never fuzzy-match keywords.
    try {
      validateListingIdentity(product, { name: item.product, price: 0, url: "", seller: { name: "" }, condition: "new", inStock: false });
      return true;
    } catch { return false; }
  });
  return matches.length === 1 && matches[0].imageEnabled ? matches[0].imageAsset : undefined;
}

export function attachProductImages<T extends ImageTarget>(items: T[], products: Product[]): (T & { imageAsset?: ProductImageAsset })[] {
  return items.map((item) => ({ ...item, imageAsset: resolveProductImage(item, products) }));
}
