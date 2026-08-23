import type { Genre } from "../data/types";
import { updateGenrePrices, type PriceUpdateSummary } from "./updateGenrePrices";

export const cardGenres = ["pokemon", "onepiece", "dragonball"] as const satisfies readonly Genre[];

export async function updateCardPrices(
  options: { dryRun?: boolean; useRunLease?: boolean; allowExistingToday?: boolean } = {},
) {
  const summaries: PriceUpdateSummary[] = [];
  for (const genre of cardGenres) summaries.push(await updateGenrePrices(genre, options));
  return summaries;
}
