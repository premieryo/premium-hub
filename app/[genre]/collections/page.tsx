import { notFound } from "next/navigation";
import GenreProductsPage from "@/components/genre/GenreProductsPage";
import { genreConfigs } from "@/data/genre-config";
import type { Genre } from "@/data/types";
import { getGenreContext } from "@/lib/genres";
import { productsInCategory } from "@/lib/product-categories";

const collectionGenres = ["pokemon", "onepiece", "dragonball"] as const;

export const generateStaticParams = () => collectionGenres.map((genre) => ({ genre }));

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  if (!collectionGenres.includes(genre as (typeof collectionGenres)[number])) return {};
  const config = genreConfigs[genre as Genre];
  return {
    title: `${config.name}のコレクションBOX一覧 | プレミア速報`,
    description: `${config.name}の限定BOX・記念セット・コレクション商品を新しい順に確認できます。`,
    alternates: { canonical: `/${genre}/collections` },
  };
}

export default async function Page({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  if (!collectionGenres.includes(genre as (typeof collectionGenres)[number])) notFound();
  const context = await getGenreContext(genre);
  if (!context) notFound();
  return (
    <GenreProductsPage
      config={context.config}
      products={productsInCategory(context.data.products, "collection-box")}
      category="collection-box"
    />
  );
}
