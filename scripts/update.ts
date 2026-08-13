import { genres } from "../data/types";
import { updateGenrePrices } from "./updateGenrePrices";

async function main() {
  console.log("プレミア速報 価格更新開始");

  for (const genre of genres) {
    await updateGenrePrices(genre);
  }

  console.log("\nすべての価格更新が完了しました。");
}

main().catch((error) => {
  console.error("価格更新処理を継続できませんでした。", error);
  process.exitCode = 1;
});
