// Read-only audit: no Supabase client, lease, cursor or persistence calls.
import { officialCardCatalog } from "../data/card-catalog";
import { searchYahooItems } from "../lib/api/yahoo";
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
      const items = await searchYahooItems(product.searchWord, { productType: "box", purpose: "price", timeoutMs: 10000 });
      const selected = selectSafePriceCandidate(product, items);
      const rejected = items.flatMap((item) => {
        try { validateCandidate(product, item); return []; }
        catch (error) { return [{ name: item.name, price: item.price, reason: error instanceof Error ? error.message : "rejected" }]; }
      });
      console.log("MARKET_AUDIT_ROW", JSON.stringify({ genre: product.genre, id: product.id, name: product.name, releaseDate: product.releaseDate, latest: latest.some((p) => p.id === product.id), selected: selected ?? null, candidates: items.length, rejected }));
    } catch {
      // Never log request URLs/errors containing API credentials.
      console.log("MARKET_AUDIT_ROW", JSON.stringify({ genre: product.genre, id: product.id, name: product.name, selected: null, error: "Yahoo request failed", latest: latest.some((p) => p.id === product.id) }));
    }
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
  console.log("MARKET_AUDIT_END");
}
main().catch(() => { console.error("Market audit failed (credential or runtime unavailable)"); process.exitCode = 1; });
