import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type {
  Genre,
  PriceSnapshot,
  Product,
  ProductPriceHistory,
  RankingItem,
} from "../data/types";
import { searchYahooItems } from "../lib/api/yahoo";

const REQUEST_INTERVAL_MS = 1_100;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_HISTORY_PER_PRODUCT = 365;

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJsonAtomic(path: string, value: unknown) {
  const temporaryPath = `${path}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, path);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function logError(genre: Genre, product: Product, error: unknown) {
  const logPath = join(process.cwd(), "logs", "price-update-errors.log");
  mkdirSync(dirname(logPath), { recursive: true });
  appendFileSync(
    logPath,
    `${new Date().toISOString()}\t${genre}\t${product.id}\t${errorMessage(error)}\n`,
    "utf8"
  );
}

function itemIcon(product: Product) {
  if (product.type === "figure") return "🎁";
  if (product.type === "toy") return "⚙️";
  if (product.type === "card") return "🎴";
  return "📦";
}

function createRankingItem(
  genre: Genre,
  product: Product,
  history: ProductPriceHistory
): RankingItem | null {
  const current = history.prices.at(-1);
  if (!current) return null;

  const previous = history.prices.at(-2) ?? current;
  const changeAmount = current.price - previous.price;
  const changeRate = previous.price === 0 ? 0 : (changeAmount / previous.price) * 100;
  const sign = changeAmount > 0 ? "+" : changeAmount < 0 ? "-" : "±";

  return {
    id: product.id,
    genre,
    shop: current.shop,
    product: product.name,
    price: `${current.price.toLocaleString()}円`,
    marketPrice: current.price,
    currentPrice: current.price,
    previousPrice: previous.price,
    changeAmount,
    changeRate: Number(changeRate.toFixed(2)),
    status: `前回比 ${sign}${Math.abs(changeAmount).toLocaleString()}円 (${changeRate >= 0 ? "+" : ""}${changeRate.toFixed(2)}%)`,
    icon: itemIcon(product),
    href: `/${genre}/ranking`,
    updatedAt: current.capturedAt,
  };
}

export async function updateGenrePrices(genre: Genre) {
  const dataDirectory = join(process.cwd(), "data", genre);
  const productsPath = join(dataDirectory, "products.json");
  const historyPath = join(dataDirectory, "price-history.json");
  const rankingPath = join(dataDirectory, "ranking.json");

  const products = readJson<Product[]>(productsPath);
  const histories = readJson<ProductPriceHistory[]>(historyPath);
  const existingRanking = readJson<RankingItem[]>(rankingPath);
  const updatedProducts: Product[] = [];
  const successfulProductIds = new Set<string>();

  console.log(`\n[${genre}] ${products.length}商品の価格更新を開始します`);

  for (const [index, product] of products.entries()) {
    try {
      const items = await searchYahooItems(product.searchWord, {
        productType: product.type,
        timeoutMs: REQUEST_TIMEOUT_MS,
      });
      const selected = items[0];

      if (!selected) throw new Error("条件に一致する本体商品が見つかりませんでした。");

      const capturedAt = new Date().toISOString();
      const snapshot: PriceSnapshot = {
        price: selected.price,
        shop: selected.seller.name,
        url: selected.url,
        capturedAt,
      };
      const history = histories.find((entry) => entry.productId === product.id);

      if (history) {
        history.prices = [...history.prices, snapshot].slice(-MAX_HISTORY_PER_PRODUCT);
      } else {
        histories.push({ productId: product.id, genre, prices: [snapshot] });
      }

      updatedProducts.push({
        ...product,
        shop: selected.seller.name,
        marketPrice: selected.price,
        url: selected.url,
        updatedAt: capturedAt,
      });
      successfulProductIds.add(product.id);
      console.log(`  ✓ ${product.name}: ${selected.price.toLocaleString()}円`);
    } catch (error) {
      updatedProducts.push(product);
      logError(genre, product, error);
      console.error(`  ✗ ${product.name}: ${errorMessage(error)}`);
    }

    if (index < products.length - 1) await wait(REQUEST_INTERVAL_MS);
  }

  const calculatedRanking = updatedProducts
    .filter((product) => successfulProductIds.has(product.id))
    .map((product) => {
      const history = histories.find((entry) => entry.productId === product.id);
      return history ? createRankingItem(genre, product, history) : null;
    })
    .filter((item): item is RankingItem => item !== null);

  const preservedRanking = existingRanking.filter(
    (item) => !successfulProductIds.has(item.id)
  );
  const ranking = [...calculatedRanking, ...preservedRanking].sort(
    (a, b) => (b.changeRate ?? Number.NEGATIVE_INFINITY) - (a.changeRate ?? Number.NEGATIVE_INFINITY)
  );

  writeJsonAtomic(productsPath, updatedProducts);
  writeJsonAtomic(historyPath, histories);
  writeJsonAtomic(rankingPath, ranking);

  console.log(`[${genre}] 成功 ${successfulProductIds.size}件 / 失敗 ${products.length - successfulProductIds.size}件`);
}
