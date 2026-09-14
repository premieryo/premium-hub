import type { ReactNode } from "react";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import TopNavigation from "@/components/TopNavigation";
import type { GenreConfig } from "@/data/genre-config";
export default function GenrePageFrame({config,children}:{config:GenreConfig;children:ReactNode}){return <main className="min-h-screen bg-slate-950 text-white"><div className="mx-auto max-w-5xl px-4 py-6 sm:px-6"><TopNavigation fallbackHref={`/${config.slug}`}/><div className="mt-5"><AffiliateDisclosure/></div>{children}</div></main>}
