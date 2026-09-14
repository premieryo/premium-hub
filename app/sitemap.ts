import type { MetadataRoute } from "next";
import { genres } from "@/data/types";
const baseUrl="https://premiumsokuho.jp";
export default function sitemap():MetadataRoute.Sitemap{const common=["","/privacy","/today","/guide","/lottery","/ranking","/restock"].map(path=>({url:`${baseUrl}${path}`}));const genrePages=genres.flatMap(g=>["","/products","/lottery","/restock","/ranking","/guide"].map(path=>({url:`${baseUrl}/${g}${path}`})));const collections=["pokemon","onepiece","dragonball"].flatMap(g=>["/collections","/collection-ranking"].map(path=>({url:`${baseUrl}/${g}${path}`})));return [...common,...genrePages,...collections]}
