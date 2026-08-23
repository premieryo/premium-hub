import type { Genre } from "@/data/types";

export const adminResources = ["products", "lottery", "restock", "ranking"] as const;
export type AdminResource = (typeof adminResources)[number];
export type AdminItem = Record<string, string | number | boolean | undefined> & { id: string; genre: Genre };

export function isAdminResource(value: string): value is AdminResource {
  return adminResources.includes(value as AdminResource);
}

export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime" | "url" | "select" | "checkbox" | "product-reference";
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

const commonInfoFields: AdminField[] = [
  { name: "id", label: "ID", required: true, placeholder: "英数字とハイフン" },
  { name: "shop", label: "ショップ", required: true },
  { name: "product", label: "商品名", required: true },
  { name: "status", label: "ステータス", required: true },
  { name: "icon", label: "アイコン", required: true, placeholder: "📦" },
  { name: "href", label: "リンク先", required: true, placeholder: "/pokemon/lottery" },
];

export const adminResourceConfig: Record<AdminResource, { label: string; fields: AdminField[] }> = {
  products: {
    label: "商品",
    fields: [
      { name: "id", label: "ID", required: true, placeholder: "英数字とハイフン" },
      { name: "name", label: "商品名", required: true },
      { name: "type", label: "商品タイプ", type: "select", required: true, options: ["box", "card", "figure", "toy", "other"] },
      { name: "searchWord", label: "Yahoo!検索語", required: true },
      { name: "releaseDate", label: "発売日", type: "date", required: true },
      { name: "priceTrackingEnabled", label: "価格追跡する", type: "checkbox" },
      { name: "shop", label: "ショップ" },
      { name: "marketPrice", label: "現在価格", type: "number" },
      { name: "url", label: "商品URL", type: "url" },
    ],
  },
  lottery: {
    label: "抽選情報",
    fields: [...commonInfoFields, { name: "productId", label: "商品マスタ", type: "product-reference" }, { name: "observedAt", label: "確認日時", type: "datetime", placeholder: "ISO 8601形式" }, { name: "deadline", label: "応募締切", required: true }, { name: "deadlineAt", label: "締切日時", type: "text", placeholder: "ISO 8601形式" }, { name: "officialUrl", label: "公式URL", type: "url" }],
  },
  restock: {
    label: "再販情報",
    fields: [...commonInfoFields, { name: "date", label: "販売開始", required: true }, { name: "restockAt", label: "販売開始日時", type: "text", placeholder: "ISO 8601形式" }],
  },
  ranking: {
    label: "ランキング",
    fields: [...commonInfoFields, { name: "price", label: "表示価格", required: true }, { name: "currentPrice", label: "現在価格", type: "number", required: true }, { name: "previousPrice", label: "前回価格", type: "number", required: true }, { name: "changeAmount", label: "騰落額", type: "number" }, { name: "changeRate", label: "騰落率（%）", type: "number" }],
  },
};

export function validateAdminItem(resource: AdminResource, value: unknown, genre: Genre) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "入力データが不正です。" };
  const input = value as Record<string, unknown>;
  const item: Record<string, string | number | boolean> = { genre };

  for (const field of adminResourceConfig[resource].fields) {
    const raw = input[field.name];
    if (field.required && (raw === undefined || raw === null || String(raw).trim() === "")) return { error: `${field.label}は必須です。` };
    if (field.type === "checkbox") {
      item[field.name] = raw === true || raw === "true";
      continue;
    }
    if (raw === undefined || raw === null || String(raw).trim() === "") continue;
    if (field.type === "number") {
      const number = Number(raw);
      if (!Number.isFinite(number) || number < 0 && !["changeAmount", "changeRate"].includes(field.name)) return { error: `${field.label}は有効な数値で入力してください。` };
      item[field.name] = number;
    } else {
      const text = String(raw).trim();
      if (field.name === "id" && !/^[a-z0-9][a-z0-9-]*$/.test(text)) return { error: "IDは半角英小文字・数字・ハイフンで入力してください。" };
      if (field.type === "date" && Number.isNaN(Date.parse(text))) return { error: `${field.label}の日付が不正です。` };
      if (field.type === "datetime" && Number.isNaN(Date.parse(text))) return { error: `${field.label}は有効なISO 8601日時で入力してください。` };
      if (field.type === "url" && !/^https?:\/\//.test(text)) return { error: `${field.label}はhttp(s) URLで入力してください。` };
      if (field.name === "href" && !text.startsWith("/")) return { error: "リンク先は/から始めてください。" };
      item[field.name] = field.type === "datetime" ? new Date(text).toISOString() : text;
    }
  }

  if (resource === "ranking") {
    const current = Number(item.currentPrice);
    const previous = Number(item.previousPrice);
    const amount = current - previous;
    const rate = previous === 0 ? 0 : (amount / previous) * 100;
    item.marketPrice = current;
    item.changeAmount = amount;
    item.changeRate = Number(rate.toFixed(2));
    item.price = item.price || `${current.toLocaleString()}円`;
  }

  return { item: item as AdminItem };
}
