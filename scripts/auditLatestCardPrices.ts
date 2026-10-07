// Read-only audit: no Supabase client, lease, cursor or persistence calls.
import { officialCardCatalog } from "../data/card-catalog";
import { searchYahooItems, type YahooItem } from "../lib/api/yahoo";
import { selectPriceTrackingProducts } from "../lib/price-tracking";
import { selectSafePriceCandidate, validateCandidate } from "./updateGenrePrices";

async function main() {
  if (!process.env.YAHOO_CLIENT_ID) throw new Error("Yahoo credential unavailable");
  const now = new Date();
  const latest = (["pokemon", "onepiece", "dragonball"] as const).flatMap((genre) => selectPriceTrackingProducts(genre, officialCardCatalog, now));
  // Known accessory contamination also needs a live check outside the latest 10.
  const extras = officialCardCatalog.filter((p) => ["black-bolt-box", "white-flare-box"].includes(p.id) && !latest.some((q) => q.id === p.id));
  console.log("MARKET_AUDIT_START", JSON.stringify({ at: now.toISOString(), databaseWrites: 0, latestCount: latest.length }));
  for (const product of [...latest, ...extras]) {
    try {
      let evaluated: { item: YahooItem; score: number }[] = [];
      const items = await searchYahooItems(product.searchWord, { productType: "box", purpose: "price", timeoutMs: 10000, onEvaluated: (rows) => { evaluated = rows; } });
      const selected = selectSafePriceCandidate(product, items);
      const candidates = evaluated.map(({ item, score }) => {
        let reason = "新品・在庫あり・対象商品名/仕様一致・未開封1BOXのタイトル根拠あり";
        let accepted = score >= 0;
        try { validateCandidate(product, item); }
        catch (error) { accepted = false; reason = error instanceof Error ? error.message : "rejected"; }
        if (score < 0 && accepted === false && reason.startsWith("新品")) reason = "検索フィルターで対象外（名称・種別・除外語）";
        return { name: item.name, shop: item.seller?.name, price: item.price, url: item.url, score, accepted, selected: item === selected, reason };
      });
      console.log("MARKET_AUDIT_ROW", JSON.stringify({ genre: product.genre, id: product.id, name: product.name, query: product.searchWord, releaseDate: product.releaseDate, latest: latest.some((p) => p.id === product.id), selected: selected ?? null, candidates: candidates.length }));
      for (const candidate of candidates) console.log("MARKET_AUDIT_CANDIDATE", JSON.stringify({ id: product.id, ...candidate }));
    } catch {
      // Never log request URLs/errors containing API credentials.
      console.log("MARKET_AUDIT_ROW", JSON.stringify({ genre: product.genre, id: product.id, name: product.name, selected: null, error: "Yahoo request failed", latest: latest.some((p) => p.id === product.id) }));
    }
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
  console.log("MARKET_AUDIT_END");
}
main().catch(() => { console.error("Market audit failed (credential or runtime unavailable)"); process.exitCode = 1; });
