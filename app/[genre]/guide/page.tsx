import { notFound } from "next/navigation";
import GenreGuidePage from "@/components/genre/GenreGuidePage";
import { generateGenreParams, getGenreContext } from "@/lib/genres";

export const generateStaticParams = generateGenreParams;

export default async function Page({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const context = await getGenreContext(genre);
  if (!context) notFound();
  return <GenreGuidePage config={context.config} />;
}
