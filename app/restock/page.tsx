import type { Metadata } from "next";
import CrossGenrePage from "@/components/CrossGenrePage";
export const metadata: Metadata = { title: "再販情報｜プレミア速報", description: "プレミア商品の再販・再入荷情報を全ジャンル横断で確認。", alternates: { canonical: "/restock" } };
export const dynamic = "force-dynamic";
export default function Page(){ return <CrossGenrePage kind="restock" />; }
