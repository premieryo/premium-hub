import type { Metadata } from "next";
import CrossGenrePage from "@/components/CrossGenrePage";
export const metadata: Metadata = { title: "トレカ・ホビーの再販・再入荷情報｜プレミア速報", description: "ポケモンカード、ワンピースカード、ドラゴンボールカードなど、トレカ・ホビー商品の再販・再入荷情報をまとめて確認できます。", alternates: { canonical: "/restock" } };
export const dynamic = "force-dynamic";
export default function Page(){ return <CrossGenrePage kind="restock" />; }
