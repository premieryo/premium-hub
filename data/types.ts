export const genres = [
  "pokemon",
  "onepiece",
  "dragonball",
  "beyblade",
  "figure",
] as const;

export type Genre = (typeof genres)[number];

export type ProductType = "box" | "card" | "figure" | "toy" | "other";

export type Product = {
  id: string;
  name: string;
  genre: Genre;
  type: ProductType;
  searchWord: string;
  releaseDate: string;
  shop?: string;
  marketPrice?: number;
  url?: string;
  updatedAt?: string;
};

type InformationItem = {
  id: string;
  genre: Genre;
  shop: string;
  product: string;
  status: string;
  icon: string;
  href: string;
};

export type LotteryItem = InformationItem & {
  deadline: string;
  deadlineAt?: string;
  officialUrl?: string;
};

export type RestockItem = InformationItem & {
  date: string;
  restockAt?: string;
};

export type RankingItem = InformationItem & {
  price: string;
  marketPrice?: number;
  currentPrice?: number;
  previousPrice?: number;
  changeAmount?: number;
  changeRate?: number;
  updatedAt?: string;
};

export type PriceSnapshot = {
  price: number;
  shop: string;
  url: string;
  capturedAt: string;
};

export type ProductPriceHistory = {
  productId: string;
  genre: Genre;
  prices: PriceSnapshot[];
};

export function sortProductsByReleaseDate<T extends Product>(products: T[]): T[] {
  return [...products].sort(
    (a, b) => Date.parse(b.releaseDate) - Date.parse(a.releaseDate)
  );
}
