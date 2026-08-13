import { notFound } from "next/navigation";
import GenreListPage from "@/components/genre/GenreListPage";
import { generateGenreParams, getGenreContext } from "@/lib/genres";

export const generateStaticParams = generateGenreParams;

export default async function Page({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const context = await getGenreContext(genre);
  if (!context) notFound();
  return <GenreListPage {...context} kind="ranking" />;
}
