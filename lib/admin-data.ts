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
  type?: "text" | "textarea" | "number" | "date" | "datetime" | "url" | "select" | "checkbox" | "product-reference" | "hidden";
  required?: boolean;
  options?: string[];
  optionLabels?: Record<string, string>;
  placeholder?: string;
};

const commonInfoFields: AdminField[] = [
  { name: "id", label: "ID", required: true, placeholder: "英数字とハイフン" },
  { name: "shop", label: "ショップ", required: true },
  { name: "product", label: "商品名", required: true },
  { name: "status", label: "ステータス", required: true },
  { name: "icon", label: "アイコン", type: "hidden", required: true },
  { name: "href", label: "リンク先", type: "hidden", required: true },
];

function parseTokyoDateTime(value: string) {
  const hasOffset = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const parsed = new Date(hasOffset ? value : `${value}+09:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function formatTokyoDisplay(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export const adminResourceConfig: Record<AdminResource, { label: string; fields: AdminField[] }> = {
  products: {
    label: "商品",
    fields: [
      { name: "id", label: "ID", required: true, placeholder: "英数字とハイフン" },
      { name: "name", label: "商品名", required: true },
      { name: "productCategory", label: "商品カテゴリ", type: "select", options: ["booster-box", "collection-box"] },
      { name: "seriesNumber", label: "シリーズ番号" },
      { name: "type", label: "商品タイプ", type: "select", required: true, options: ["box", "card", "figure", "toy", "other"] },
      { name: "searchWord", label: "Yahoo!検索語", required: true },
      { name: "releaseDate", label: "発売日", type: "date", required: true },
      { name: "retailPrice", label: "定価（税込）", type: "number" },
      { name: "jan", label: "JAN" },
      { name: "modelNumber", label: "メーカー型番" },
      { name: "officialUrl", label: "公式URL", type: "url" },
      { name: "priceTrackingEnabled", label: "価格追跡する", type: "checkbox" },
      { name: "shop", label: "ショップ" },
      { name: "marketPrice", label: "現在価格", type: "number" },
      { name: "url", label: "商品URL", type: "url" },
    ],
  },
  lottery: {
    label: "抽選情報",
    fields: [...commonInfoFields, { name: "productId", label: "商品マスタ", type: "product-reference" }, { name: "deadlineAt", label: "締切日時（日本時間）", type: "datetime" }, { name: "officialUrl", label: "公式URL", type: "url" }, { name: "publicationStatus", label: "公開承認", type: "select", options: ["pending", "approved", "rejected"] }, { name: "applicationType", label: "応募方法", type: "select", options: ["online", "store", "both"], optionLabels: { online: "オンライン", store: "店頭", both: "オンライン・店頭" }, placeholder: "未設定" }, { name: "applicationStart", label: "応募開始（日本時間）", type: "datetime" }, { name: "resultDate", label: "結果発表（日本時間）", type: "datetime" }, { name: "saleDate", label: "販売日時（日本時間）", type: "datetime" }, { name: "applicationConditions", label: "応募条件", type: "textarea", placeholder: "会員登録や購入履歴などの応募条件" }, { name: "notes", label: "注意事項", type: "textarea", placeholder: "応募回数、本人確認、キャンセル条件など" }, { name: "deadline", label: "応募締切（表示用）" }, { name: "source", label: "情報源", type: "hidden" }, { name: "fetchedAt", label: "取得日時", type: "hidden" }, { name: "observedAt", label: "確認日時", type: "hidden" }],
  },
  restock: {
    label: "再販情報",
    fields: [...commonInfoFields, { name: "productId", label: "商品マスタ", type: "product-reference" }, { name: "saleStart", label: "販売開始日時（日本時間）", type: "datetime" }, { name: "officialUrl", label: "公式URL", type: "url" }, { name: "publicationStatus", label: "公開承認", type: "select", options: ["pending", "approved", "rejected"] }, { name: "channel", label: "販売方法", type: "select", options: ["online", "store"] }, { name: "region", label: "地域" }, { name: "quantityLimit", label: "購入制限" }, { name: "date", label: "販売開始（表示用）" }, { name: "source", label: "情報源", type: "hidden" }, { name: "fetchedAt", label: "取得日時", type: "hidden" }],
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
      const datetime = field.type === "datetime" ? parseTokyoDateTime(text) : null;
      if (field.type === "datetime" && !datetime) return { error: `${field.label}は有効な日時で入力してください。` };
      if (field.type === "url" && !/^https?:\/\//.test(text)) return { error: `${field.label}はhttp(s) URLで入力してください。` };
      if (field.name === "href" && !text.startsWith("/")) return { error: "リンク先は/から始めてください。" };
      if (field.options && !field.options.includes(text)) return { error: `${field.label}の選択値が不正です。` };
      item[field.name] = field.type === "datetime" ? datetime! : text;
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

  if (resource === "lottery" && !item.deadline && typeof item.deadlineAt === "string") {
    item.deadline = formatTokyoDisplay(item.deadlineAt);
  }
  if (resource === "restock" && !item.date && typeof item.saleStart === "string") {
    item.date = formatTokyoDisplay(item.saleStart);
  }

  return { item: item as AdminItem };
}
