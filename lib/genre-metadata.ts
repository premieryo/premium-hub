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
    title: (name) => `${name}の抽選・再販・相場情報 | プレミア速報`,
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
      `${name}の最新抽選情報、受付状況、締切情報を初心者向けに分かりやすくまとめています。`,
  },
  restock: {
    path: "/restock",
    title: (name) => `${name}の再販・再入荷情報 | プレミア速報`,
    description: (name) =>
      `${name}の再販・再入荷情報をまとめています。販売予定や取扱店の情報を確認できます。`,
  },
  ranking: {
    path: "/ranking",
    title: (name) => `${name}の相場・ランキング | プレミア速報`,
    description: (name) =>
      `${name}の相場ランキングと価格動向をまとめています。注目商品の相場を分かりやすく確認できます。`,
  },
  guide: {
    path: "/guide",
    title: (name) => `${name}の初心者ガイド | プレミア速報`,
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
