import assert from "node:assert/strict";
import test from "node:test";
import { searchYahooItems } from "./api/yahoo";

for (const purpose of ["price", "image"] as const) {
  test(`${purpose}検索の在庫条件と語句の挿入を検証`, async (t) => {
    const previous = process.env.YAHOO_CLIENT_ID;
    process.env.YAHOO_CLIENT_ID = "test-only";
    let requested: URL | undefined;
    t.mock.method(globalThis, "fetch", async (input: string | URL) => {
      requested = new URL(String(input));
      return Response.json({ hits: [{ name: "CROSS FORCE ドラゴンボール FB-10 BOX 未開封",
        price: 5000, condition: "new", inStock: purpose === "price", url: "https://example.com/item", seller: { name: "shop" } }] });
    });
    try {
      const items = await searchYahooItems("CROSS FORCE FB10 BOX", { purpose });
      assert.equal(items.length, 1);
      assert.equal(requested?.searchParams.get("in_stock"), purpose === "price" ? "true" : null);
      assert.equal(requested?.searchParams.get("condition"), "new");
    } finally {
      if (previous === undefined) delete process.env.YAHOO_CLIENT_ID;
      else process.env.YAHOO_CLIENT_ID = previous;
      t.mock.restoreAll();
    }
  });
}
