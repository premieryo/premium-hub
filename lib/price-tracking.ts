import type { Genre, Product } from "@/data/types";
import { getProductCategory } from "./product-categories";

const limitedGenres = new Set<Genre>(["pokemon", "onepiece", "dragonball"]);
const CARD_GENRE_LIMIT = 10;

function getTokyoDateString(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isReleasedInTokyo(product: Product, now = new Date()) {
  return /^\d{4}-\d{2}-\d{2}$/.test(product.releaseDate)
    && product.releaseDate <= getTokyoDateString(now);
}

export function selectPriceTrackingProducts(
  genre: Genre,
  products: Product[],
  now = new Date(),
) {
  const eligible = products
    .filter((product) => product.genre === genre)
    .filter((product) => product.priceTrackingEnabled === true)
    .filter((product) => !limitedGenres.has(genre) || getProductCategory(product) === "booster-box")
    .filter((product) => isReleasedInTokyo(product, now))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.id.localeCompare(b.id));

  return limitedGenres.has(genre) ? eligible.slice(0, CARD_GENRE_LIMIT) : eligible;
}

export function selectPublicRankingProducts(
  genre: Genre,
  products: Product[],
  now = new Date(),
) {
  const genreProducts = products.filter((product) => product.genre === genre);
  const hasTrackingFlag = genreProducts.some((product) =>
    Object.prototype.hasOwnProperty.call(product, "priceTrackingEnabled")
  );

  return hasTrackingFlag
    ? selectPriceTrackingProducts(genre, genreProducts, now)
    : genreProducts;
}
