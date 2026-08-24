import { genreConfigs } from "@/data/genre-config";
import type { GenreData } from "@/data/genre-data";
import {
  genres,
  sortProductsByReleaseDate,
  type Genre,
  type LotteryItem,
  type RestockItem,
} from "@/data/types";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createPublicClient } from "@/lib/supabase/public";
import type { AdminResource } from "./admin-data";
import { selectPublicRankingProducts } from "./price-tracking";
import { isPublicInformationItem } from "./information-moderation";
import { fallbackCardRanking, mergeOfficialCardCatalog } from "@/data/card-catalog";

export function isGenre(value: string): value is Genre {
  return genres.includes(value as Genre);
}

async function readGenreJson<T>(genre: Genre, filename: string): Promise<T> {
  const path = join(process.cwd(), "data", genre, filename);
  return JSON.parse(await readFile(path, "utf8")) as T;
}

const tokyoDatePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function getTokyoDateParts(date: Date) {
  const parts = Object.fromEntries(
    tokyoDatePartsFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return { year: parts.year, month: parts.month, day: parts.day };
}

function parseJapaneseDate(value: string, now: Date) {
  const match = value.match(/(\d{1,2})月(\d{1,2})日(?:\s*(\d{1,2}):(\d{2}))?/);
  if (!match) return null;

  const { year, month: currentMonth } = getTokyoDateParts(now);
  const month = Number(match[1]);
  const day = Number(match[2]);
  const hour = match[3] === undefined ? 23 : Number(match[3]);
  const minute = match[4] === undefined ? 59 : Number(match[4]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;

  let resolvedYear = year;
  if (currentMonth === 12 && month === 1) resolvedYear += 1;
  if (currentMonth === 1 && month === 12) resolvedYear -= 1;

  const date = new Date(Date.UTC(resolvedYear, month - 1, day, hour - 9, minute));
  const parsed = getTokyoDateParts(date);
  if (parsed.year !== resolvedYear || parsed.month !== month || parsed.day !== day) return null;
  return date;
}

function filterPublicLottery(items: LotteryItem[], now: Date) {
  return items.filter((item) => {
    if (!isPublicInformationItem(item)) return false;
    if (item.deadlineAt) {
      const deadline = new Date(item.deadlineAt);
      return Number.isNaN(deadline.getTime()) || deadline.getTime() >= now.getTime();
    }
    const deadline = parseJapaneseDate(item.deadline, now);
    return deadline === null || deadline.getTime() >= now.getTime();
  });
}

function filterPublicRestock(items: RestockItem[], now: Date) {
  const retentionStart = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return items.filter((item) => {
    if (!isPublicInformationItem(item) || ["終了", "販売終了", "完売"].includes(item.status)) return false;
    const exactStart = item.saleStart ?? item.restockAt;
    const restock = exactStart
      ? new Date(exactStart)
      : parseJapaneseDate(item.date, now);
    if (!restock || Number.isNaN(restock.getTime())) return true;
    return restock.getTime() >= retentionStart;
  });
}

export async function getGenreContext(value: string) {
  if (!isGenre(value)) return null;

  let products: GenreData["products"];
  let lottery: GenreData["lottery"];
  let restock: GenreData["restock"];
  let ranking: GenreData["ranking"];

  try {
    const supabase = createPublicClient();
    const resources: AdminResource[] = ["products", "lottery", "restock", "ranking"];
    const results = await Promise.all(resources.map(async (resource) => {
      const { data, error } = await supabase.from("content_items").select("data").eq("genre", value).eq("resource", resource).order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => row.data);
    }));
    [products, lottery, restock, ranking] = results as [GenreData["products"], GenreData["lottery"], GenreData["restock"], GenreData["ranking"]];
  } catch (error) {
    console.error(`[${value}] Supabaseの読み込みに失敗したためJSONを使用します。`, error);
    [products, lottery, restock, ranking] = await Promise.all([
      readGenreJson<GenreData["products"]>(value, "products.json"),
      readGenreJson<GenreData["lottery"]>(value, "lottery.json"),
      readGenreJson<GenreData["restock"]>(value, "restock.json"),
      readGenreJson<GenreData["ranking"]>(value, "ranking.json"),
    ]);
    products = mergeOfficialCardCatalog(products, value);
    const fallbackRankingById = new Map(ranking.map((item) => [item.id, item]));
    for (const item of fallbackCardRanking.filter((item) => item.genre === value)) fallbackRankingById.set(item.id, item);
    ranking = [...fallbackRankingById.values()];
  }
  const now = new Date();
  lottery = filterPublicLottery(lottery, now);
  restock = filterPublicRestock(restock, now);
  const priceHistory = await readGenreJson<GenreData["priceHistory"]>(value, "price-history.json");
  const trackedProductIds = new Set(
    selectPublicRankingProducts(value, products).map((product) => product.id),
  );
  ranking = ranking.filter((item) => trackedProductIds.has(item.id));

  return {
    config: genreConfigs[value],
    data: {
      products: sortProductsByReleaseDate(products),
      lottery,
      restock,
      ranking,
      priceHistory,
    } satisfies GenreData,
  };
}

export function generateGenreParams() {
  return genres.map((genre) => ({ genre }));
}
