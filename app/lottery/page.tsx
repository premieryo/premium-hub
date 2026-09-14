import type { Metadata } from "next";
import CrossGenrePage from "@/components/CrossGenrePage";
export const metadata: Metadata = { title: "抽選情報｜プレミア速報", description: "ポケモンカード、ONE PIECE、ドラゴンボール、ベイブレード、フィギュアの抽選情報をまとめて確認。", alternates: { canonical: "/lottery" } };
export const dynamic = "force-dynamic";
export default function Page(){ return <CrossGenrePage kind="lottery" />; }
