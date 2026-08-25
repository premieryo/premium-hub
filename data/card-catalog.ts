import type { Product, RankingItem } from "./types";

type CardCatalogProduct = Product & {
  productCategory: "booster-box" | "collection-box";
  priceTrackingEnabled: false;
  officialUrl: string;
};

const pokemonProductsUrl = "https://www.pokemon-card.com/products/index.html?dateLowerM=1&dateUpperD=25&dateUpperM=8&dateUpperY=2026&productType=expansion";
const onePieceBoostersUrl = "https://www.onepiece-cardgame.com/products/?subcategory=boosters";
const onePieceCollectionsUrl = "https://www.onepiece-cardgame.com/products/?subcategory=others";
const dragonBallBoostersUrl = "https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack";
const dragonBallProductsUrl = "https://www.dbs-cardgame.com/fw/jp/products/";

function booster(product: Omit<CardCatalogProduct, "type" | "productCategory" | "priceTrackingEnabled">): CardCatalogProduct {
  return { ...product, type: "box", productCategory: "booster-box", priceTrackingEnabled: false };
}

function collection(product: Omit<CardCatalogProduct, "type" | "productCategory" | "priceTrackingEnabled">): CardCatalogProduct {
  return { ...product, type: "other", productCategory: "collection-box", priceTrackingEnabled: false };
}

export const officialCardCatalog: CardCatalogProduct[] = [
  booster({ id: "30th-celebration-box", genre: "pokemon", name: "ポケモンカードゲーム MEGA 拡張パック「30th CELEBRATION」BOX", searchWord: "30th CELEBRATION BOX", releaseDate: "2026-09-16", retailPrice: 7200, officialUrl: "https://www.30th.pokemon-card.com/product/m6a", releaseStatus: "upcoming" }),
  booster({ id: "storm-emeralda-box", genre: "pokemon", name: "ポケモンカードゲーム MEGA 拡張パック「ストームエメラルダ」BOX", searchWord: "ストームエメラルダ BOX", releaseDate: "2026-07-31", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "abyss-eye-box", genre: "pokemon", name: "拡張パック「アビスアイ」", searchWord: "アビスアイ BOX", releaseDate: "2026-05-22", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "ninja-spinner-box", genre: "pokemon", name: "拡張パック「ニンジャスピナー」", searchWord: "ニンジャスピナー BOX", releaseDate: "2026-03-13", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "munikis-zero-box", genre: "pokemon", name: "拡張パック「ムニキスゼロ」", searchWord: "ムニキスゼロ BOX", releaseDate: "2026-01-23", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "mega-dream-ex-box", genre: "pokemon", name: "ハイクラスパック「MEGAドリームex」", searchWord: "MEGAドリームex BOX", releaseDate: "2025-11-28", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "inferno-x-box", genre: "pokemon", name: "拡張パック「インフェルノX」", searchWord: "インフェルノX BOX", releaseDate: "2025-09-26", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "mega-brave-box", genre: "pokemon", name: "ポケモンカードゲーム MEGA 拡張パック「メガブレイブ」BOX", searchWord: "メガブレイブ BOX", releaseDate: "2025-08-01", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "mega-symphonia-box", genre: "pokemon", name: "ポケモンカードゲーム MEGA 拡張パック「メガシンフォニア」BOX", searchWord: "メガシンフォニア BOX", releaseDate: "2025-08-01", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "black-bolt-box", genre: "pokemon", name: "拡張パック「ブラックボルト」", searchWord: "ブラックボルト BOX", releaseDate: "2025-06-06", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "white-flare-box", genre: "pokemon", name: "拡張パック「ホワイトフレア」", searchWord: "ホワイトフレア BOX", releaseDate: "2025-06-06", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "black-bolt-deluxe-box", genre: "pokemon", name: "拡張パックデラックス「ブラックボルト」", searchWord: "ブラックボルト デラックス BOX", releaseDate: "2025-06-06", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "white-flare-deluxe-box", genre: "pokemon", name: "拡張パックデラックス「ホワイトフレア」", searchWord: "ホワイトフレア デラックス BOX", releaseDate: "2025-06-06", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "rocket-glory-box", genre: "pokemon", name: "拡張パック「ロケット団の栄光」", searchWord: "ロケット団の栄光 BOX", releaseDate: "2025-04-18", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "hot-wind-arena-box", genre: "pokemon", name: "強化拡張パック「熱風のアリーナ」", searchWord: "熱風のアリーナ BOX", releaseDate: "2025-03-14", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),
  booster({ id: "battle-partners-box", genre: "pokemon", name: "拡張パック「バトルパートナーズ」", searchWord: "バトルパートナーズ BOX", releaseDate: "2025-01-24", officialUrl: pokemonProductsUrl, releaseStatus: "released" }),

  collection({ id: "30th-celebration-futuristic-box", genre: "pokemon", name: "30th CELEBRATION FUTURISTIC BOX", searchWord: "30th CELEBRATION FUTURISTIC BOX", releaseDate: "2026-09-16", retailPrice: 27500, officialUrl: "https://www.30th.pokemon-card.com/product/furbox", releaseStatus: "upcoming" }),
  collection({ id: "premium-trainer-box-mega", genre: "pokemon", name: "プレミアムトレーナーボックス MEGA", searchWord: "プレミアムトレーナーボックス MEGA", releaseDate: "2025-08-01", retailPrice: 6350, officialUrl: "https://www.pokemon-card.com/ex/m1/index.html", releaseStatus: "released" }),
  collection({ id: "pokemon-center-tohoku-special-box", genre: "pokemon", name: "スペシャルBOX ポケモンセンタートウホク", searchWord: "スペシャルBOX ポケモンセンタートウホク", releaseDate: "2025-06-13", retailPrice: 2090, officialUrl: "https://www.pokemon-card.com/info/005053.html", releaseStatus: "released" }),
  collection({ id: "pokemon-center-hiroshima-special-box", genre: "pokemon", name: "スペシャルBOX ポケモンセンターヒロシマ", searchWord: "スペシャルBOX ポケモンセンターヒロシマ", releaseDate: "2025-06-13", retailPrice: 2090, officialUrl: "https://www.pokemon-card.com/info/005053.html", releaseStatus: "released" }),
  collection({ id: "pokemon-center-fukuoka-special-box", genre: "pokemon", name: "スペシャルBOX ポケモンセンターフクオカ", searchWord: "スペシャルBOX ポケモンセンターフクオカ", releaseDate: "2025-06-13", retailPrice: 2090, officialUrl: "https://www.pokemon-card.com/info/005053.html", releaseStatus: "released" }),

  booster({ id: "onepiece-eb05", genre: "onepiece", name: "エクストラブースター ONE PIECE Heroines Edition vol.2", searchWord: "ONE PIECE EB-05 BOX", releaseDate: "2026-10-01", seriesNumber: "EB-05", officialUrl: onePieceBoostersUrl, releaseStatus: "upcoming" }),
  booster({ id: "world-strongest-warriors-op17-box", genre: "onepiece", name: "ONE PIECEカードゲーム ブースターパック「世界最強の戦士」[OP-17] BOX", searchWord: "世界最強の戦士 OP-17 BOX", releaseDate: "2026-08-22", seriesNumber: "OP-17", retailPrice: 5760, officialUrl: "https://p-bandai.jp/item/item-1000255803/", releaseStatus: "released" }),
  booster({ id: "onepiece-op16", genre: "onepiece", name: "ブースターパック 決戦の刻", searchWord: "決戦の刻 OP-16 BOX", releaseDate: "2026-05-30", seriesNumber: "OP-16", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000253295/", releaseStatus: "released" }),
  booster({ id: "onepiece-op15", genre: "onepiece", name: "ブースターパック 神の島の冒険", searchWord: "神の島の冒険 OP-15 BOX", releaseDate: "2026-02-28", seriesNumber: "OP-15", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  booster({ id: "onepiece-eb04", genre: "onepiece", name: "エクストラブースター EGGHEAD CRISIS", searchWord: "EGGHEAD CRISIS EB-04 BOX", releaseDate: "2026-01-31", seriesNumber: "EB-04", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  booster({ id: "onepiece-op14", genre: "onepiece", name: "ブースターパック 蒼海の七傑", searchWord: "蒼海の七傑 OP-14 BOX", releaseDate: "2025-11-22", seriesNumber: "OP-14", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000254607/", releaseStatus: "released" }),
  booster({ id: "onepiece-eb03", genre: "onepiece", name: "エクストラブースター ONE PIECE Heroines Edition", searchWord: "ONE PIECE Heroines Edition EB-03 BOX", releaseDate: "2025-10-25", seriesNumber: "EB-03", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  booster({ id: "onepiece-op13", genre: "onepiece", name: "ブースターパック 受け継がれる意志", searchWord: "受け継がれる意志 OP-13 BOX", releaseDate: "2025-08-23", seriesNumber: "OP-13", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000254606/", releaseStatus: "released" }),
  booster({ id: "onepiece-prb02", genre: "onepiece", name: "プレミアムブースター ONE PIECE CARD THE BEST vol.2", searchWord: "ONE PIECE CARD THE BEST vol.2 PRB-02 BOX", releaseDate: "2025-07-26", seriesNumber: "PRB-02", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  booster({ id: "onepiece-op12", genre: "onepiece", name: "ブースターパック 師弟の絆", searchWord: "師弟の絆 OP-12 BOX", releaseDate: "2025-05-31", seriesNumber: "OP-12", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  booster({ id: "onepiece-op11", genre: "onepiece", name: "ブースターパック 神速の拳", searchWord: "神速の拳 OP-11 BOX", releaseDate: "2025-03-01", seriesNumber: "OP-11", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  booster({ id: "onepiece-eb02", genre: "onepiece", name: "エクストラブースター Anime 25th collection", searchWord: "Anime 25th collection EB-02 BOX", releaseDate: "2025-01-25", seriesNumber: "EB-02", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  booster({ id: "onepiece-op10", genre: "onepiece", name: "ブースターパック 王族の血統", searchWord: "王族の血統 OP-10 BOX", releaseDate: "2024-11-30", seriesNumber: "OP-10", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  booster({ id: "onepiece-op09", genre: "onepiece", name: "ブースターパック 新たなる皇帝", searchWord: "新たなる皇帝 OP-09 BOX", releaseDate: "2024-08-31", seriesNumber: "OP-09", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  booster({ id: "onepiece-prb01", genre: "onepiece", name: "プレミアムブースター ONE PIECE CARD THE BEST", searchWord: "ONE PIECE CARD THE BEST PRB-01 BOX", releaseDate: "2024-07-27", seriesNumber: "PRB-01", officialUrl: onePieceBoostersUrl, releaseStatus: "released" }),
  collection({ id: "onepiece-kumamoto-special", genre: "onepiece", name: "プレミアムカードコレクション 熊本県スペシャル", searchWord: "プレミアムカードコレクション 熊本県スペシャル", releaseDate: "2026-02-22", officialUrl: onePieceCollectionsUrl, releaseStatus: "released" }),

  booster({ id: "dragonball-fb12", genre: "dragonball", name: "ブースターパック REACH THE GOD", searchWord: "REACH THE GOD FB12 BOX", releaseDate: "2026-12-12", seriesNumber: "FB12", officialUrl: dragonBallBoostersUrl, releaseStatus: "upcoming" }),
  booster({ id: "dragonball-fb11", genre: "dragonball", name: "ブースターパック BRIGHTNESS OF HOPE", searchWord: "BRIGHTNESS OF HOPE FB11 BOX", releaseDate: "2026-09-12", seriesNumber: "FB11", officialUrl: dragonBallBoostersUrl, releaseStatus: "upcoming" }),
  booster({ id: "story-booster-01-st01-box", genre: "dragonball", name: "ドラゴンボールスーパーカードゲーム フュージョンワールド STORY BOOSTER 01 [ST01] BOX", searchWord: "STORY BOOSTER 01 ST01 BOX", releaseDate: "2026-08-08", seriesNumber: "ST01", retailPrice: 6600, officialUrl: "https://p-bandai.jp/item/item-1000255641/", releaseStatus: "released" }),
  booster({ id: "dragonball-fb10", genre: "dragonball", name: "ブースターパック CROSS FORCE", searchWord: "CROSS FORCE FB10 BOX", releaseDate: "2026-06-13", seriesNumber: "FB10", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000252480/", releaseStatus: "released" }),
  booster({ id: "dragonball-fb09", genre: "dragonball", name: "ブースターパック DUAL EVOLUTION", searchWord: "DUAL EVOLUTION FB09 BOX", releaseDate: "2026-03-14", seriesNumber: "FB09", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000247915/", releaseStatus: "released" }),
  booster({ id: "dragonball-fb08", genre: "dragonball", name: "ブースターパック 誇り高き戦闘民族", searchWord: "誇り高き戦闘民族 FB08 BOX", releaseDate: "2025-12-13", seriesNumber: "FB08", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000242317/", releaseStatus: "released" }),
  booster({ id: "dragonball-sb02", genre: "dragonball", name: "MANGA BOOSTER 02", searchWord: "MANGA BOOSTER 02 SB02 BOX", releaseDate: "2025-11-08", seriesNumber: "SB02", retailPrice: 7920, officialUrl: "https://p-bandai.jp/item/item-1000244821/", releaseStatus: "released" }),
  booster({ id: "dragonball-fb07", genre: "dragonball", name: "ブースターパック 神龍への願い", searchWord: "神龍への願い FB07 BOX", releaseDate: "2025-09-13", seriesNumber: "FB07", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000241082/", releaseStatus: "released" }),
  booster({ id: "dragonball-sb01", genre: "dragonball", name: "MANGA BOOSTER 01", searchWord: "MANGA BOOSTER 01 SB01 BOX", releaseDate: "2025-06-28", seriesNumber: "SB01", officialUrl: dragonBallBoostersUrl, releaseStatus: "released" }),
  booster({ id: "dragonball-fb06", genre: "dragonball", name: "ブースターパック 迫り来る脅威", searchWord: "迫り来る脅威 FB06 BOX", releaseDate: "2025-04-26", seriesNumber: "FB06", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000252484/", releaseStatus: "released" }),
  booster({ id: "dragonball-fb05", genre: "dragonball", name: "ブースターパック 未知なる冒険", searchWord: "未知なる冒険 FB05 BOX", releaseDate: "2025-02-08", seriesNumber: "FB05", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000235879/", releaseStatus: "released" }),
  booster({ id: "dragonball-fb04", genre: "dragonball", name: "ブースターパック 限界を超えし者", searchWord: "限界を超えし者 FB04 BOX", releaseDate: "2024-11-08", seriesNumber: "FB04", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000252487/", releaseStatus: "released" }),
  booster({ id: "dragonball-fb03", genre: "dragonball", name: "ブースターパック 怒りの咆哮", searchWord: "怒りの咆哮 FB03 BOX", releaseDate: "2024-08-09", seriesNumber: "FB03", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000225291/", releaseStatus: "released" }),
  booster({ id: "dragonball-fb02", genre: "dragonball", name: "ブースターパック 烈火の闘気", searchWord: "烈火の闘気 FB02 BOX", releaseDate: "2024-05-10", seriesNumber: "FB02", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000225255/", releaseStatus: "released" }),
  booster({ id: "dragonball-fb01", genre: "dragonball", name: "ブースターパック 覚醒の鼓動", searchWord: "覚醒の鼓動 FB01 BOX", releaseDate: "2024-02-16", seriesNumber: "FB01", retailPrice: 5280, officialUrl: "https://p-bandai.jp/item/item-1000209892/", releaseStatus: "released" }),
  collection({ id: "dragonball-limited-edition-01", genre: "dragonball", name: "オフィシャルプレイマット&カードセット Limited Edition 01", searchWord: "オフィシャルプレイマット カードセット Limited Edition 01", releaseDate: "2026-03-20", retailPrice: 4730, officialUrl: dragonBallProductsUrl, releaseStatus: "released" }),
  collection({ id: "dragonball-premium-card-collection-01", genre: "dragonball", name: "プレミアムカードコレクション01 -Leaders-", searchWord: "プレミアムカードコレクション01 Leaders", releaseDate: "2025-03-15", retailPrice: 1500, officialUrl: dragonBallProductsUrl, releaseStatus: "released" }),
  collection({ id: "dragonball-championship-illustrations-01", genre: "dragonball", name: "チャンピオンシップセット -ILLUSTRATIONS- 01", searchWord: "チャンピオンシップセット ILLUSTRATIONS 01", releaseDate: "2025-09-21", retailPrice: 2750, officialUrl: dragonBallProductsUrl, releaseStatus: "released" }),
  collection({ id: "dragonball-championship-illustrations-02", genre: "dragonball", name: "チャンピオンシップセット -ILLUSTRATIONS- 02", searchWord: "チャンピオンシップセット ILLUSTRATIONS 02", releaseDate: "2025-09-21", retailPrice: 2750, officialUrl: dragonBallProductsUrl, releaseStatus: "released" }),
  collection({ id: "dragonball-championship-set-01", genre: "dragonball", name: "チャンピオンシップセット 01 -孫悟空vsフリーザ-", searchWord: "チャンピオンシップセット 01 孫悟空 フリーザ", releaseDate: "2024-10-12", retailPrice: 4950, officialUrl: dragonBallProductsUrl, releaseStatus: "released" }),
  collection({ id: "dragonball-championship-set-02", genre: "dragonball", name: "チャンピオンシップセット 02 -ベジット-", searchWord: "チャンピオンシップセット 02 ベジット", releaseDate: "2024-10-12", retailPrice: 4950, officialUrl: dragonBallProductsUrl, releaseStatus: "released" }),
];

const fallbackCommerce = new Map<string, Partial<Product>>([
  ["storm-emeralda-box", { priceTrackingEnabled: true, marketPrice: 17000, shop: "イングス", url: "https://store.shopping.yahoo.co.jp/ing-s/4521329462233.html", updatedAt: "2026-08-23T18:33:32.476Z" }],
  ["mega-brave-box", { priceTrackingEnabled: true, marketPrice: 12000, shop: "トレカの利休", url: "https://store.shopping.yahoo.co.jp/torekanorikyuu/pk-bp-mb.html", updatedAt: "2026-08-23T18:33:34.316Z" }],
  ["mega-symphonia-box", { priceTrackingEnabled: true, marketPrice: 10390, shop: "トレカの利休", url: "https://store.shopping.yahoo.co.jp/torekanorikyuu/pk-bp-ms.html", updatedAt: "2026-08-23T18:33:36.093Z" }],
  ["world-strongest-warriors-op17-box", { priceTrackingEnabled: true, marketPrice: 25880, shop: "イーバリューYahoo!店", url: "https://store.shopping.yahoo.co.jp/evalue-omochayasan/4582770058406.html", updatedAt: "2026-08-23T18:33:38.019Z" }],
  ["story-booster-01-st01-box", { priceTrackingEnabled: true, marketPrice: 27700, shop: "ノア商社Yahoo!店", url: "https://store.shopping.yahoo.co.jp/noahshoping/4582770011982.html", updatedAt: "2026-08-23T18:33:39.278Z" }],
]);

export const fallbackCardRanking: RankingItem[] = [
  { id: "storm-emeralda-box", href: "/pokemon/ranking", icon: "📦", shop: "イングス", genre: "pokemon", price: "17,000円", status: "前回比 ±0円 (+0.00%)", product: "ポケモンカードゲーム MEGA 拡張パック「ストームエメラルダ」BOX", updatedAt: "2026-08-23T18:33:32.476Z", changeRate: 0, marketPrice: 17000, changeAmount: 0, currentPrice: 17000, previousPrice: 17000 },
  { id: "mega-brave-box", href: "/pokemon/ranking", icon: "📦", shop: "トレカの利休", genre: "pokemon", price: "12,000円", status: "前回比 ±0円 (+0.00%)", product: "ポケモンカードゲーム MEGA 拡張パック「メガブレイブ」BOX", updatedAt: "2026-08-23T18:33:34.316Z", changeRate: 0, marketPrice: 12000, changeAmount: 0, currentPrice: 12000, previousPrice: 12000 },
  { id: "mega-symphonia-box", href: "/pokemon/ranking", icon: "📦", shop: "トレカの利休", genre: "pokemon", price: "10,390円", status: "前回比 ±0円 (+0.00%)", product: "ポケモンカードゲーム MEGA 拡張パック「メガシンフォニア」BOX", updatedAt: "2026-08-23T18:33:36.093Z", changeRate: 0, marketPrice: 10390, changeAmount: 0, currentPrice: 10390, previousPrice: 10390 },
  { id: "world-strongest-warriors-op17-box", href: "/onepiece/ranking", icon: "📦", shop: "イーバリューYahoo!店", genre: "onepiece", price: "25,880円", status: "前回比 ±0円 (+0.00%)", product: "ONE PIECEカードゲーム ブースターパック「世界最強の戦士」[OP-17] BOX", updatedAt: "2026-08-23T18:33:38.019Z", changeRate: 0, marketPrice: 25880, changeAmount: 0, currentPrice: 25880, previousPrice: 25880 },
  { id: "story-booster-01-st01-box", href: "/dragonball/ranking", icon: "📦", shop: "ノア商社Yahoo!店", genre: "dragonball", price: "27,700円", status: "前回比 ±0円 (+0.00%)", product: "ドラゴンボールスーパーカードゲーム フュージョンワールド STORY BOOSTER 01 [ST01] BOX", updatedAt: "2026-08-23T18:33:39.278Z", changeRate: 0, marketPrice: 27700, changeAmount: 0, currentPrice: 27700, previousPrice: 27700 },
];

export function mergeOfficialCardCatalog(products: Product[], genre: Product["genre"]): Product[] {
  const merged = new Map(products.map((product) => [product.id, product]));
  for (const official of officialCardCatalog.filter((product) => product.genre === genre)) {
    const existing = merged.get(official.id);
    const product = existing ? {
      ...official,
      priceTrackingEnabled: existing.priceTrackingEnabled === true,
      marketPrice: existing.marketPrice,
      shop: existing.shop,
      url: existing.url,
      updatedAt: existing.updatedAt,
      affiliateUrl: existing.affiliateUrl,
      imageSource: existing.imageSource,
      imageSourceId: existing.imageSourceId,
      imageAlt: existing.imageAlt,
      imageEnabled: existing.imageEnabled,
    } : official;
    const fallback = fallbackCommerce.get(official.id);
    merged.set(official.id, {
      ...product,
      priceTrackingEnabled: existing?.priceTrackingEnabled ?? fallback?.priceTrackingEnabled ?? false,
      marketPrice: existing?.marketPrice ?? fallback?.marketPrice,
      shop: existing?.shop ?? fallback?.shop,
      url: existing?.url ?? fallback?.url,
      updatedAt: existing?.updatedAt ?? fallback?.updatedAt,
    });
  }
  return [...merged.values()];
}
