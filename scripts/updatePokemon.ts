import { updateGenrePrices } from "./updateGenrePrices";

const apply = process.argv.includes("--apply");

updateGenrePrices("pokemon", { dryRun: !apply }).catch((error) => {
  console.error("ポケモン価格の一括更新に失敗しました。", error);
  process.exitCode = 1;
});
