import { notFound } from "next/navigation";
import GenreProductsPage from "@/components/genre/GenreProductsPage";
import { generateGenreParams, getGenreContext } from "@/lib/genres";
import { generateGenreMetadata } from "@/lib/genre-metadata";

export const generateStaticParams = generateGenreParams;

export function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  return generateGenreMetadata(params, "products");
}

export default async function Page({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const context = await getGenreContext(genre);
  if (!context) notFound();
  return <GenreProductsPage config={context.config} products={context.data.products} />;
}
