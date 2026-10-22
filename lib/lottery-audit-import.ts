import { genres, type Genre } from "../data/types";
import { validateAdminItem, type AdminItem } from "./admin-data";
import { buildInformationDedupKey, prepareInformationItem } from "./information-moderation";

export type AuditInput = {
  genre: Genre; product: string; shop: string; applicationStart?: string;
  deadlineAt: string; applicationType: "online" | "store" | "both" | "app";
  applicationConditions: string; officialUrl: string; applicationUrl?: string;
  observedAt: string; evidence: string; evidenceKind: "official";
};
export type AuditResult = {
  index: number; input: AuditInput; reasons: string[]; eligible: boolean;
  priority: "当日締切" | "24時間以内" | "通常"; matches: { id: string; reason: string; differences: string[] }[];
  item?: AdminItem;
};
const hosts = ["pokemoncenter-online.com", "pokemon-card.com", "pokemon.co.jp", "p-bandai.jp", "bandainamco-am.co.jp", "onepiece-cardgame.com", "dbs-cardgame.com", "kidsrepublic.jp", "aeonretail.jp", "aeon.com", "geo-online.co.jp", "geonet.jp", "yamada-denki.jp", "yamada-denkiweb.com", "yodobashi.com", "biccamera.com", "books.rakuten.co.jp"];
const normalize = (value: unknown) => String(value ?? "").normalize("NFKC").toLowerCase().replace(/[\s「」『』【】\[\]()（）・!！:：-]/g, "");
export function publicHttps(value: unknown) {
  try {
    const url = new URL(String(value));
    if (url.protocol !== "https:" || url.username || url.password || url.port || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname) || /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(url.hostname)) return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) if (/^utm_|^(?:ref|fbclid|gclid)$/.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
    return url.toString();
  } catch { return null; }
}
export function isOfficialAuditUrl(value: unknown) {
  const safe = publicHttps(value);
  if (!safe) return false;
  const host = new URL(safe).hostname;
  return hosts.some(base => host === base || host.endsWith(`.${base}`));
}
// Local form values are explicitly JST; reject impossible calendar values rather
// than accepting Date.parse's rollover (e.g. February 30).
export function parseAuditTimestamp(value: unknown) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|\+09:00)?$/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, min, sec = "00", fraction = "", offset = "+09:00"] = match;
  const calendar = new Date(Date.UTC(+y, +m - 1, +d, +h, +min, +sec));
  if (+y < 2000 || calendar.getUTCFullYear() !== +y || calendar.getUTCMonth() + 1 !== +m || calendar.getUTCDate() !== +d || calendar.getUTCHours() !== +h || calendar.getUTCMinutes() !== +min || calendar.getUTCSeconds() !== +sec) return null;
  return new Date(`${y}-${m}-${d}T${h}:${min}:${sec}${fraction ? `.${fraction}` : ""}${offset}`).toISOString();
}
const tokyoDay = (value: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
const compareFields = ["shop", "product", "applicationStart", "deadlineAt", "applicationType", "applicationConditions", "officialUrl", "applicationUrl"];

export function previewLotteryAudit(values: unknown, existing: AdminItem[], now = new Date()): AuditResult[] {
  if (!Array.isArray(values) || !values.length || values.length > 20) throw new Error("1〜20件のJSON配列または入力候補を指定してください。");
  const seen: AdminItem[] = [...existing];
  const results = values.map((value, index) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${index + 1}行目はオブジェクトで入力してください。`);
    const raw = value as Record<string, unknown>;
    const input = Object.fromEntries(["genre", "product", "shop", "applicationStart", "deadlineAt", "applicationType", "applicationConditions", "officialUrl", "applicationUrl", "observedAt", "evidence", "evidenceKind"].map(key => [key, typeof raw[key] === "string" ? raw[key].trim() : ""])) as AuditInput;
    const reasons: string[] = [];
    const start = input.applicationStart ? parseAuditTimestamp(input.applicationStart) : undefined;
    const deadline = parseAuditTimestamp(input.deadlineAt);
    const observed = parseAuditTimestamp(input.observedAt);
    if (!genres.includes(input.genre)) reasons.push("ジャンルが不正です。");
    for (const [key, label] of [["product", "商品名"], ["shop", "販売店"], ["applicationConditions", "応募条件"]] as const) if (!input[key] || input[key].length > 2000) reasons.push(`${label}を1〜2000文字で入力してください。`);
    if (!["online", "store", "both", "app"].includes(input.applicationType)) reasons.push("応募方法を選択してください。");
    if (!deadline) reasons.push("正確な締切日時（年・月・日・時刻）が必要です。");
    if (deadline && Date.parse(deadline) <= now.getTime()) reasons.push("終了済みの抽選は登録できません。");
    if (input.applicationStart && !start) reasons.push("受付開始日時が不正です。");
    if (start && deadline && Date.parse(start) >= Date.parse(deadline)) reasons.push("受付開始は締切より前にしてください。");
    if (!observed || Date.parse(observed) > now.getTime() + 60000) reasons.push("確認日時が不正、未入力、または未来です。");
    if (!isOfficialAuditUrl(input.officialUrl) || input.evidenceKind !== "official" || input.evidence.length < 12 || input.evidence.length > 2000) reasons.push("対応する公式一次情報URLと確認根拠が必要です。競合情報のみ・未対応ドメインは登録できません。");
    if (input.applicationUrl && !publicHttps(input.applicationUrl)) reasons.push("応募URLは公開HTTPS URLにしてください。");
    if (["online", "both"].includes(input.applicationType) && !input.applicationUrl) reasons.push("Web応募のURLが必要です。");
    const matches: AuditResult["matches"] = [];
    const item: AdminItem = {
      id: `audit-row-${index + 1}`, genre: input.genre, product: input.product, shop: input.shop,
      applicationStart: start ?? undefined, deadlineAt: deadline ?? undefined, observedAt: observed ?? undefined,
      fetchedAt: observed ?? undefined, officialUrl: publicHttps(input.officialUrl) ?? undefined,
      applicationUrl: publicHttps(input.applicationUrl) ?? undefined, applicationType: input.applicationType,
      applicationConditions: input.applicationConditions, source: "audit-review", publicationStatus: "pending",
      evidence: input.evidence, evidenceKind: "official", status: "確認待ち", icon: "🎯", href: `/${input.genre}/lottery`,
    };
    for (const previous of seen.filter(row => row.genre === input.genre)) {
      const sameKey = buildInformationDedupKey(input.genre, "lottery", item) === buildInformationDedupKey(input.genre, "lottery", previous);
      const sameUrl = Boolean(item.officialUrl && publicHttps(previous.officialUrl) === item.officialUrl);
      const sameProduct = normalize(previous.product) === normalize(input.product);
      const sameShop = normalize(previous.shop) === normalize(input.shop);
      const previousDate = parseAuditTimestamp(previous.deadlineAt);
      const sameDate = Boolean(previousDate && previousDate === deadline);
      if (sameKey || sameUrl || sameShop && sameProduct || sameShop && sameDate) {
        matches.push({ id: previous.id, reason: sameKey ? "既存の重複キーと一致" : "同じ公式URL・販売店/商品・販売店/締切のいずれかに重複の疑い", differences: compareFields.filter(field => String(previous[field] ?? "") !== String(item[field] ?? "")).map(field => `${field}: ${String(previous[field] ?? "未設定")} → ${String(item[field] ?? "未設定")}`) });
      }
    }
    if (matches.length) reasons.push("既存情報または同じ取り込み内に重複の疑いがあります。既存情報を確認してください。");
    const priority: AuditResult["priority"] = deadline && tokyoDay(new Date(deadline)) === tokyoDay(now) ? "当日締切" : deadline && Date.parse(deadline) - now.getTime() <= 86400000 && Date.parse(deadline) > now.getTime() ? "24時間以内" : "通常";
    const validation = validateAdminItem("lottery", item, input.genre);
    if (validation.error) reasons.push(validation.error);
    const prepared = validation.item ? prepareInformationItem(input.genre, "lottery", { ...validation.item, applicationUrl: item.applicationUrl, evidence: input.evidence, evidenceKind: "official", publicationStatus: "pending" }) : undefined;
    // Even excluded rows participate in batch duplicate detection conservatively.
    seen.push(item);
    return { index, input, reasons, eligible: reasons.length === 0, priority, matches, item: prepared };
  });
  return results.sort((a, b) => (a.eligible === b.eligible ? 0 : a.eligible ? -1 : 1) || ["当日締切", "24時間以内", "通常"].indexOf(a.priority) - ["当日締切", "24時間以内", "通常"].indexOf(b.priority) || a.index - b.index);
}
