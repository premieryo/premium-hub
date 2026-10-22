// Read-only candidate audit. No DB client, cron, lease or persistence calls.
import { officialCardCatalog } from "../data/card-catalog";
import { searchYahooItems } from "../lib/api/yahoo";
import { selectSafePriceCandidate, validateCandidate } from "./updateGenrePrices";
async function main() {
  const product = officialCardCatalog.find(p => p.id === "story-booster-01-st01-box")!;
  const at = new Date().toISOString();
  if (!process.env.YAHOO_CLIENT_ID) {
    console.log(JSON.stringify({ at, id: product.id, databaseWrites: 0, status: "blocked", reason: "Yahoo API credential unavailable. No live candidate verdict." }));
    process.exitCode = 1; return;
  }
  const candidates: { title: string; shop: string; price: number; url: string; inStock: boolean; accepted: boolean; reason: string }[] = [];
  const items = await searchYahooItems(product.searchWord, { janCode: product.jan, productType: "box", purpose: "price", onEvaluated(rows) {
    for (const { item, score } of rows) {
      let reason = "新品・在庫あり・仕様/JAN一致・未開封1BOX";
      let accepted = score >= 0;
      try { validateCandidate(product, item); if (!accepted) reason = "検索一致条件で除外"; }
      catch (e) { accepted = false; reason = e instanceof Error ? e.message : "validation rejected"; }
      candidates.push({ title: item.name, shop: item.seller?.name, price: item.price, url: item.url, inStock: item.inStock, accepted, reason });
    }
  }});
  console.log(JSON.stringify({ at, id: product.id, query: product.searchWord, jan: product.jan, databaseWrites: 0, selected: selectSafePriceCandidate(product, items) ?? null, candidates }));
}
main().catch(() => { console.error("Read-only Yahoo audit failed; request details omitted to protect credentials."); process.exitCode = 1; });
