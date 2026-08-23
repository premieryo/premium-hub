import { genres } from "../data/types";
import { updateGenrePrices } from "./updateGenrePrices";

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`プレミア速報 価格${apply ? "更新" : "DRY-RUN"}開始`);

  for (const genre of genres) {
    await updateGenrePrices(genre, { dryRun: !apply });
  }

  console.log(`\nすべての価格${apply ? "更新" : "確認"}が完了しました。`);
}

main().catch((error) => {
  console.error("価格更新処理を継続できませんでした。", error);
  process.exitCode = 1;
});
