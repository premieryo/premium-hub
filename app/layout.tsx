import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "プレミア速報｜トレカの抽選・再販・BOX相場情報";
const siteDescription =
  "ポケモンカード、ワンピースカード、ドラゴンボールカードを中心に、抽選・再販・BOX相場・初心者向け情報をまとめています。";

export const metadata: Metadata = {
  metadataBase: new URL("https://premiumsokuho.jp"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://premiumsokuho.jp",
    siteName: "プレミア速報",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "プレミア速報",
  alternateName: "PREMIUM HUB",
  url: "https://premiumsokuho.jp/",
  description: siteDescription,
  inLanguage: "ja-JP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
