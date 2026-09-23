import type { Metadata } from "next";
import CrossGenrePage from "@/components/CrossGenrePage";
export const metadata: Metadata = { title: "トレカ・BOXの相場・価格動向｜プレミア速報", description: "ポケモンカード、ワンピースカード、ドラゴンボールカードなど、トレカ・BOXを中心とした現在相場と価格動向をまとめて確認できます。", alternates: { canonical: "/ranking" } };
export const dynamic = "force-dynamic";
export default function Page(){ return <CrossGenrePage kind="ranking" />; }
