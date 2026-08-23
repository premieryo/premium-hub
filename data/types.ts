export const genres = [
  "pokemon",
  "onepiece",
  "dragonball",
  "beyblade",
  "figure",
] as const;

export type Genre = (typeof genres)[number];

export type ProductType = "box" | "card" | "figure" | "toy" | "other";

export const productImageSources = [
  "amazon",
  "valuecommerce",
  "licensed-asp",
] as const;

export type ProductImageSource = (typeof productImageSources)[number];

export type ProductImageAsset = {
  source: ProductImageSource;
  src: string;
  clickUrl: string;
  alt: string;
  width: number;
  height: number;
  fetchedAt?: string;
};

export type Product = {
  id: string;
  name: string;
  genre: Genre;
  type: ProductType;
  searchWord: string;
  releaseDate: string;
  priceTrackingEnabled?: boolean;
  jan?: string;
  modelNumber?: string;
  imageSource?: ProductImageSource;
  imageSourceId?: string;
  imageAlt?: string;
  imageEnabled?: boolean;
  affiliateUrl?: string;
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
  productId?: string;
  officialUrl?: string;
  source?: string;
  fetchedAt?: string;
  publicationStatus?: "pending" | "approved" | "rejected";
  matchStatus?: "matched" | "unmatched";
  dedupKey?: string;
};

export type LotteryItem = InformationItem & {
  deadline: string;
  applicationStart?: string;
  deadlineAt?: string;
  resultDate?: string;
  saleDate?: string;
  observedAt?: string;
};

export type RestockItem = InformationItem & {
  date: string;
  saleStart?: string;
  restockAt?: string;
  channel?: "online" | "store";
  region?: string;
  quantityLimit?: string;
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
