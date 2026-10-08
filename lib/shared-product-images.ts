import type { Product, ProductImageAsset } from "@/data/types";

type ImageTarget = { id: string; product: string; productId?: string };
const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[\s「」『』【】\[\]]/g, "");

export function resolveProductImage(item: ImageTarget, products: Product[]): ProductImageAsset | undefined {
  const explicitId = item.productId ?? item.id;
  const byId = products.find((product) => product.id === explicitId);
  if (byId) return byId.imageEnabled ? byId.imageAsset : undefined;
  // Never use partial names: normal/deluxe and bundles can share keywords.
  if (item.productId) return undefined;
  const matches = products.filter((product) => normalize(product.name) === normalize(item.product));
  return matches.length === 1 && matches[0].imageEnabled ? matches[0].imageAsset : undefined;
}

export function attachProductImages<T extends ImageTarget>(items: T[], products: Product[]): (T & { imageAsset?: ProductImageAsset })[] {
  return items.map((item) => ({ ...item, imageAsset: resolveProductImage(item, products) }));
}
