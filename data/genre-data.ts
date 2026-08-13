import type {
  LotteryItem,
  Product,
  ProductPriceHistory,
  RankingItem,
  RestockItem,
} from "./types";

export type GenreData = {
  products: Product[];
  lottery: LotteryItem[];
  restock: RestockItem[];
  ranking: RankingItem[];
  priceHistory: ProductPriceHistory[];
};
