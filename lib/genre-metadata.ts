import type { Metadata } from "next";
import { genreConfigs } from "@/data/genre-config";
import type { Genre } from "@/data/types";

type GenrePage = "top" | "products" | "lottery" | "restock" | "ranking" | "guide";

const pageMetadata: Record<
  GenrePage,
  {
    path: string;
    title: (name: string) => string;
    description: (name: string) => string;
  }
> = {
  top: {
    path: "",
    title: (name) => `${name} 抽選・再販・BOX相場情報｜プレミア速報`,
    description: (name) =>
      `${name}の抽選、再販、相場情報、商品一覧、初心者向けガイドをまとめて確認できます。`,
  },
  products: {
    path: "/products",
    title: (name) => `${name}の商品一覧 | プレミア速報`,
    description: (name) =>
      `${name}の商品情報を一覧で確認できます。発売日や参考価格など、商品選びに役立つ情報をまとめています。`,
  },
  lottery: {
    path: "/lottery",
    title: (name) => `${name}の抽選情報 | プレミア速報`,
    description: (name) =>
      `${name}の抽選販売情報、受付状況、締切をまとめています。最新の応募情報を確認できます。`,
  },
  restock: {
    path: "/restock",
    title: (name) => `${name}の再販・再入荷情報 | プレミア速報`,
    description: (name) =>
      `${name}の再販・再入荷情報をまとめています。販売予定や取扱店など、再販を探すときに役立つ情報を確認できます。`,
  },
  ranking: {
    path: "/ranking",
    title: (name) => `${name} BOX相場・価格ランキング｜プレミア速報`,
    description: (name) =>
      `${name}のBOX相場ランキングと価格動向をまとめています。注目商品の現在相場を確認できます。`,
  },
  guide: {
    path: "/guide",
    title: (name) => `${name} 初心者ガイド｜保管・相場の見方｜プレミア速報`,
    description: (name) =>
      `${name}の保管方法や相場の見方など、初心者が知っておきたい基礎情報をまとめています。`,
  },
};

export async function generateGenreMetadata(
  params: Promise<{ genre: string }>,
  page: GenrePage,
): Promise<Metadata> {
  const { genre } = await params;
  if (!(genre in genreConfigs)) return {};

  const config = genreConfigs[genre as Genre];
  const currentPage = pageMetadata[page];

  return {
    title: currentPage.title(config.name),
    description: currentPage.description(config.name),
    alternates: {
      canonical: `/${config.slug}${currentPage.path}`,
    },
  };
}
