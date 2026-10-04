import type { Genre, Product, ProductImageAsset } from "@/data/types";
import type { YahooItem } from "./api/yahoo";
import { findMultipleItemExpression, validateListingIdentity } from "./commerce-matching";

// Images have no release-date, price-window or in-stock requirement.
// Explicitly disabled images and other licensed providers remain untouched.
export function selectImageAcquisitionProducts(genre: Genre, products: Product[]) {
  return products.filter((product) => product.genre === genre && product.imageEnabled !== false
    && (!product.imageAsset || product.imageAsset.source === "valuecommerce"))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.id.localeCompare(b.id));
}

export function createProductImageAsset(product: Product, item: YahooItem, now = new Date()): ProductImageAsset | null {
  try {
    validateListingIdentity(product, item);
    if (item.condition !== "new" || findMultipleItemExpression(item.name)) return null;
    if (/空箱|箱のみ|オリパ|福袋|パック単品|バラパック|カード単品|シングルカード/.test(item.name)) return null;
    if (product.type === "box" && !/box|ボックス/i.test(item.name)) return null;
    const image = item.exImage;
    if (!image?.url) return null;
    const src = new URL(image.url);
    const click = new URL(item.url);
    if (src.protocol !== "https:" || src.hostname !== "item-shopping.c.yimg.jp" || src.username || src.password
      || click.protocol !== "https:" || click.hostname !== "ck.jp.ap.valuecommerce.com" || click.username || click.password
      || click.pathname !== "/servlet/referral"
      || !/^\d+$/.test(click.searchParams.get("sid") ?? "")
      || !/^\d+$/.test(click.searchParams.get("pid") ?? "")
      || !Number.isInteger(image.width) || (image.width ?? 0) <= 0
      || !Number.isInteger(image.height) || (image.height ?? 0) <= 0) return null;
    return { source: "valuecommerce", src: image.url, clickUrl: item.url, alt: item.name || product.name,
      width: image.width!, height: image.height!, fetchedAt: now.toISOString() };
  } catch {
    return null;
  }
}
