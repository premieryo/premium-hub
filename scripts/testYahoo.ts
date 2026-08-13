import { searchYahooItems } from "../lib/api/yahoo";

async function main() {
  console.log("Yahoo!ショッピングAPIへ接続します...");

  const items = await searchYahooItems("ロケット団の栄光 BOX", {
    productType: "box",
    timeoutMs: 10_000,
  });

  console.log(`取得件数: ${items.length}`);

  items.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.name} / ${item.price.toLocaleString()}円 / ${item.seller.name}`
    );
  });
}

main().catch((error) => {
  console.error("エラーが発生しました。");
  console.error(error);
  process.exit(1);
});
