import type { Genre } from "./types";

export type GuideItem = {
  icon: string;
  title: string;
  description: string;
};

export type GenreConfig = {
  slug: Genre;
  name: string;
  icon: string;
  description: string;
  itemLabel: string;
  guideItems: GuideItem[];
};

const commonGuideItems: GuideItem[] = [
  { icon: "📦", title: "商品の保管方法", description: "商品を綺麗に保管する方法を紹介予定。" },
  { icon: "💰", title: "売るタイミング", description: "高く売るタイミングや価格の見方を解説予定。" },
  { icon: "⭐", title: "相場の見方", description: "相場を確認するときのポイントを解説予定。" },
];

export const genreConfigs: Record<Genre, GenreConfig> = {
  pokemon: {
    slug: "pokemon",
    name: "ポケモンカード",
    icon: "🔥",
    description: "抽選・再販・相場情報を初心者にもわかりやすく紹介します。",
    itemLabel: "ポケモンカード・BOX",
    guideItems: [
      { icon: "📦", title: "BOXの保管方法", description: "シュリンク付きBOXを綺麗に保管する方法を紹介予定。" },
      { icon: "💰", title: "売るタイミング", description: "高く売るタイミングや価格の見方を解説予定。" },
      { icon: "⭐", title: "PSAとは？", description: "PSA鑑定やグレードについて解説予定。" },
    ],
  },
  onepiece: { slug: "onepiece", name: "ワンピースカード", icon: "🏴‍☠️", description: "ワンピースカードの抽選・再販・相場情報を紹介します。", itemLabel: "ワンピースカード・BOX", guideItems: commonGuideItems },
  dragonball: { slug: "dragonball", name: "ドラゴンボールカード", icon: "🐉", description: "ドラゴンボールカードの抽選・再販・相場情報を紹介します。", itemLabel: "ドラゴンボールカード・BOX", guideItems: commonGuideItems },
  beyblade: { slug: "beyblade", name: "ベイブレード", icon: "⚙️", description: "ベイブレードの抽選・再販・相場情報を紹介します。", itemLabel: "ベイブレード商品", guideItems: commonGuideItems },
  figure: { slug: "figure", name: "フィギュア", icon: "🎁", description: "フィギュアの抽選・再販・相場情報を紹介します。", itemLabel: "フィギュア", guideItems: commonGuideItems },
};
