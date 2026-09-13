export type LotterySourcePolicy = "auto" | "review";

export type LotterySource = {
  id: string;
  name: string;
  url: string;
  policy: LotterySourcePolicy;
  genres: readonly ("pokemon" | "onepiece" | "dragonball")[];
};

/**
 * Official sources we trust enough to discover lottery candidates from.
 * `auto` means the source is allowed to be auto-published only after a
 * source-specific parser has verified exact application dates and product data.
 * The generic monitor never publishes by itself.
 */
export const lotterySources = [
  {
    id: "pokemon-center-online",
    name: "ポケモンセンターオンライン",
    url: "https://www.support.pokemoncenter-online.com/%E6%8A%BD%E9%81%B8%E8%B2%A9%E5%A3%B2%E3%81%AB%E5%BF%9C%E5%8B%9F%E3%81%97%E3%81%9F%E3%81%84-67614f5aa560d7180698ec70",
    policy: "auto",
    genres: ["pokemon"],
  },
  {
    id: "premium-bandai-carddas",
    name: "プレミアムバンダイ カードダス",
    url: "https://p-bandai.jp/carddas/",
    policy: "auto",
    genres: ["onepiece", "dragonball"],
  },
  {
    id: "bandai-namco-onepiece",
    name: "ONE PIECEカードゲーム 公式ショップ",
    url: "https://bandainamco-am.co.jp/official_shop/onepiece-cardgame/news/",
    policy: "auto",
    genres: ["onepiece"],
  },
  {
    id: "bandai-namco-dragonball",
    name: "ドラゴンボールスーパーカードゲーム 公式ショップ",
    url: "https://bandainamco-am.co.jp/official_shop/dbs-cardgame/news/",
    policy: "auto",
    genres: ["dragonball"],
  },
] as const satisfies readonly LotterySource[];
