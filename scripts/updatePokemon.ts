import { updateGenrePrices } from "./updateGenrePrices";

updateGenrePrices("pokemon").catch((error) => {
  console.error("ポケモン価格の一括更新に失敗しました。", error);
  process.exitCode = 1;
});
