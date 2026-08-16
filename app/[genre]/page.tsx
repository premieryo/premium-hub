import { notFound } from "next/navigation";
import GenreTopPage from "@/components/genre/GenreTopPage";
import { generateGenreParams, getGenreContext } from "@/lib/genres";
import { generateGenreMetadata } from "@/lib/genre-metadata";

export const generateStaticParams = generateGenreParams;

export function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  return generateGenreMetadata(params, "top");
}

export default async function Page({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const context = await getGenreContext(genre);
  if (!context) notFound();
  return <GenreTopPage {...context} />;
}
