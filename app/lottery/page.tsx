import type { Metadata } from "next";
import CrossGenrePage from "@/components/CrossGenrePage";
export const metadata: Metadata = { title: "トレカ・ホビーの抽選情報｜ポケカ・ワンピースほか｜プレミア速報", description: "ポケモンカード、ワンピースカード、ドラゴンボールカード、ベイブレード、フィギュアの抽選情報と締切をまとめて確認できます。", alternates: { canonical: "/lottery" } };
export const dynamic = "force-dynamic";
export default function Page(){ return <CrossGenrePage kind="lottery" />; }
