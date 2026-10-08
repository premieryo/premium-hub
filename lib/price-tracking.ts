import { officialCardCatalog } from "@/data/card-catalog";
import type { Genre, Product } from "@/data/types";
import { getProductCategory } from "./product-categories";

const limitedGenres = new Set<Genre>(["pokemon", "onepiece", "dragonball"]);
const CARD_GENRE_TRACKING_LIMIT = 10;
const officialDates = new Map(officialCardCatalog.map((product) => [`${product.genre}:${product.id}`, product.releaseDate]));

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
  const genreProducts = products
    .filter((product) => product.genre === genre)
    // Use the same verified calendar date as the public catalog. Preserve all
    // mutable commerce fields and original DB rows for optimistic writes.
    .map((product) => ({ ...product, releaseDate: officialDates.get(`${product.genre}:${product.id}`) ?? product.releaseDate }))
    .filter((product) => !limitedGenres.has(genre) || getProductCategory(product) === "booster-box")
    .filter((product) => isReleasedInTokyo(product, now))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.id.localeCompare(b.id));

  if (limitedGenres.has(genre)) {
    // Card genres are a rolling market window: always follow the latest 10
    // released booster boxes. This avoids stale manual tracking flags leaving
    // newer products at "相場集計前".
    return genreProducts.slice(0, CARD_GENRE_TRACKING_LIMIT);
  }

  return genreProducts.filter((product) => product.priceTrackingEnabled === true);
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
