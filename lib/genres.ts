import { genreConfigs } from "@/data/genre-config";
import type { GenreData } from "@/data/genre-data";
import { genres, sortProductsByReleaseDate, type Genre } from "@/data/types";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createPublicClient } from "@/lib/supabase/public";
import type { AdminResource } from "./admin-data";

export function isGenre(value: string): value is Genre {
  return genres.includes(value as Genre);
}

async function readGenreJson<T>(genre: Genre, filename: string): Promise<T> {
  const path = join(process.cwd(), "data", genre, filename);
  return JSON.parse(await readFile(path, "utf8")) as T;
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
  }
  const priceHistory = await readGenreJson<GenreData["priceHistory"]>(value, "price-history.json");

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
