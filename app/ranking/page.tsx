import type { Metadata } from "next";
import CrossGenrePage from "@/components/CrossGenrePage";
export const metadata: Metadata = { title: "現在相場｜プレミア速報", description: "プレミア商品の現在相場と値動きを全ジャンル横断で確認。", alternates: { canonical: "/ranking" } };
export const dynamic = "force-dynamic";
export default function Page(){ return <CrossGenrePage kind="ranking" />; }
