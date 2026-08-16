import type { MetadataRoute } from "next";
import { genres } from "@/data/types";

const baseUrl = "https://premiumsokuho.jp";

const genrePages = [
  { path: "", changeFrequency: "daily", priority: 0.9 },
  { path: "/products", changeFrequency: "weekly", priority: 0.7 },
  { path: "/lottery", changeFrequency: "daily", priority: 0.8 },
  { path: "/restock", changeFrequency: "daily", priority: 0.8 },
  { path: "/ranking", changeFrequency: "daily", priority: 0.8 },
  { path: "/guide", changeFrequency: "monthly", priority: 0.6 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...genres.flatMap((genre) =>
      genrePages.map(({ path, changeFrequency, priority }) => ({
        url: `${baseUrl}/${genre}${path}`,
        changeFrequency,
        priority,
      })),
    ),
  ];
}
