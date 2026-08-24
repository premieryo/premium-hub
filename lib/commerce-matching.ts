import type { Product, ProductCategory } from "@/data/types";
import type { YahooItem } from "@/lib/api/yahoo";

export function normalizeCommerceText(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[\s'"「」『』【】()（）・]/g, "");
}

export function findMultipleItemExpression(value: string): string | null {
  const normalized = value.normalize("NFKC").toLowerCase();
  const patterns = [
    /(?:^|[\s【[(（])([2-9]\d*)\s*(?:box|ボックス|箱)(?:\s*セット)?(?:$|[\s】\])）])/i,
    /(?:box|ボックス|箱)\s*[x×*]\s*([2-9]\d*)/i,
    /(?:box|ボックス|箱)\s*([2-9]\d*)\s*(?:個|箱|セット)/i,
    /(?:^|\s)([2-9]\d*)\s*個\s*セット(?:$|\s)/i,
  ];
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) return match[0].trim();
  }
  return null;
}

export type IdentityEvidence = { janMatch: boolean; modelNumberMatch: boolean; nameMatch: boolean; seriesMatch: boolean; accepted: boolean; reason: string };

export function evaluateProductIdentity(product: Product, item: YahooItem): IdentityEvidence {
  const title = normalizeCommerceText(item.name);
  const jan = product.jan?.replace(/\D/g, "");
  const itemJan = item.janCode?.replace(/\D/g, "");
  const model = product.modelNumber && normalizeCommerceText(product.modelNumber);
  const officialName = normalizeCommerceText(product.name).replace(/ポケモンカードゲーム|onepieceカードゲーム|ドラゴンボールスーパーカードゲーム|フュージョンワールド/g, "");
  const series = product.seriesNumber && normalizeCommerceText(product.seriesNumber);
  const janMatch = Boolean(jan && ((itemJan && itemJan === jan) || title.includes(jan)));
  const modelNumberMatch = Boolean(model && title.includes(model));
  const nameMatch = officialName.length >= 6 && title.includes(officialName);
  const seriesMatch = Boolean(series && title.includes(series));
  const category: ProductCategory = product.productCategory ?? "booster-box";
  if (category === "collection-box") {
    if (!jan && !model) return { janMatch, modelNumberMatch, nameMatch, seriesMatch, accepted: false, reason: "collection商品は公式JANまたは型番が未確認" };
    if (!janMatch && !modelNumberMatch) return { janMatch, modelNumberMatch, nameMatch, seriesMatch, accepted: false, reason: "JAN・型番の完全一致なし" };
    if (!nameMatch && !seriesMatch) return { janMatch, modelNumberMatch, nameMatch, seriesMatch, accepted: false, reason: "正式商品名・シリーズ番号の一致なし" };
  }
  return { janMatch, modelNumberMatch, nameMatch, seriesMatch, accepted: true, reason: "商品同一性を確認" };
}
