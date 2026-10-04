import type { Product, ProductCategory } from "@/data/types";
import type { YahooItem } from "@/lib/api/yahoo";

export function normalizeCommerceText(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[\s'"「」『』【】()（）・]/g, "");
}

export function findMultipleItemExpression(value: string): string | null {
  const normalized = value.normalize("NFKC").toLowerCase()
    .replace(/(?<![a-z0-9])(?:op|eb|prb|fb|sb|st)-?\d{2}(?!\d)/g, "");
  const patterns = [
    /(?<![a-z0-9])(?:[2-9]|[1-9]\d+)\s*(?:box|ボックス|箱)(?![a-z])/i,
    /(?:box|ボックス|箱)\s*[x×*]\s*(?:[2-9]|[1-9]\d+)/i,
    /(?:box|ボックス|箱)\s*(?:[2-9]|[1-9]\d+)\s*(?:個|箱|セット)/i,
    /(?<![a-z0-9])(?:[2-9]|[1-9]\d+)\s*個\s*セット/i,
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

// Match query tokens independently: shops often insert Japanese names between
// an English product name and its series number. Series punctuation is flexible.
export function matchesCommerceQuery(title: string, query: string) {
  const normalizedTitle = normalizeCommerceText(title).replace(/-/g, "");
  const tokens = query.normalize("NFKC").split(/\s+/)
    .map((token) => normalizeCommerceText(token).replace(/box|ボックス|本体|新品|未開封/g, "").replace(/-/g, ""))
    .filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => normalizedTitle.includes(token));
}

export function validateListingIdentity(product: Product, item: YahooItem) {
  if (!matchesCommerceQuery(item.name, product.searchWord)) throw new Error("対象商品名が一致しません。");
  const expected = product.seriesNumber?.normalize("NFKC").toLowerCase().replace(/-/g, "");
  const series = [...item.name.normalize("NFKC").toLowerCase().matchAll(/(?<![a-z0-9])(op|eb|prb|fb|sb|st)-?(\d{2})(?!\d)/g)]
    .map((match) => ({ prefix: match[1], value: `${match[1]}${match[2]}` }));
  if (expected && ["onepiece", "dragonball"].includes(product.genre)) {
    const prefix = expected.match(/^[a-z]+/)?.[0];
    if (!series.some((value) => value.value === expected)) throw new Error(`シリーズ番号${product.seriesNumber}の完全一致なし`);
    if (series.some((value) => value.prefix === prefix && value.value !== expected)) throw new Error("異なるシリーズ番号を検出");
  }
  if (product.jan && item.janCode && product.jan.replace(/\D/g, "") !== item.janCode.replace(/\D/g, "")) {
    throw new Error("JANコードが一致しません。");
  }
  const title = normalizeCommerceText(item.name);
  if (product.type === "box" && /ローダー|保管用|保護ケース|カードケース|boxケース|uvカット|空箱|箱のみ|アクリルケース|マグネットケース|ディスプレイケース|収納ケース|プロテクター|boxprotector|storagecase/.test(title)) throw new Error("BOX用保管用品・空箱を検出");
  if (/英語版|韓国語版|中国語版|海外版|english|korean|chinese/.test(title)) throw new Error("海外版を検出");
  if (product.genre === "pokemon" && product.productCategory !== "collection-box") {
    for (const variant of ["デラックス", "futuristic", "プレミアムデッキセット"]) {
      if (title.includes(variant) && !normalizeCommerceText(product.searchWord).includes(variant)) throw new Error("異なる商品仕様を検出");
    }
  }
  const identity = evaluateProductIdentity(product, item);
  if (!identity.accepted) throw new Error(identity.reason);
}
