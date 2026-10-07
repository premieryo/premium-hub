# PR #41 データ品質監査（2026-10-07）

判定: マージ保留。SupabaseはSELECTのみ、書き込み0。

## 発売日: 本番products全61件

商品マスタ・公式一次情報・表示変換を別々に監査した。57件はマスタ日付と公式が一致。EB-05とスペシャルBOX3件は不一致。

本番の1日前表示は、JST午前0時をDate化し、timeZone未指定のIntl.DateTimeFormatでUTCサーバーから表示することが原因。例: OP-17の2026-08-22T00:00:00+09:00はUTCで8/21。PRはYYYY-MM-DDから直接暦日表示する。管理画面のdate入力は日付文字列のまま保存。価格対象の発売判定はAsia/Tokyoに固定。

6/13のニュースはスペシャルBOXの抽選開始日であり、公式商品詳細の発売日とは異なる。公式商品詳細に合わせた変更をPRに追加し、本番DBは未変更。

| ジャンル | 商品ID | 商品名 | 本番DB日付 | 公式発売日／PR適用後 | 判定 | 一次情報 |
| --- | --- | --- | --- | --- | --- | --- |
| dragonball | dragonball-championship-illustrations-01 | チャンピオンシップセット -ILLUSTRATIONS- 01 | 2025-09-21 | 2025-09-21 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_246.html) |
| dragonball | dragonball-championship-illustrations-02 | チャンピオンシップセット -ILLUSTRATIONS- 02 | 2025-09-21 | 2025-09-21 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_245.html) |
| dragonball | dragonball-championship-set-01 | チャンピオンシップセット 01 -孫悟空vsフリーザ- | 2024-10-12 | 2024-10-12 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_77.html) |
| dragonball | dragonball-championship-set-02 | チャンピオンシップセット 02 -ベジット- | 2024-10-12 | 2024-10-12 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_78.html) |
| dragonball | dragonball-fb01 | ブースターパック 覚醒の鼓動 | 2024-02-16 | 2024-02-16 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?page=2&tags=BoosterPack) |
| dragonball | dragonball-fb02 | ブースターパック 烈火の闘気 | 2024-05-10 | 2024-05-10 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?page=2&tags=BoosterPack) |
| dragonball | dragonball-fb03 | ブースターパック 怒りの咆哮 | 2024-08-09 | 2024-08-09 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?page=2&tags=BoosterPack) |
| dragonball | dragonball-fb04 | ブースターパック 限界を超えし者 | 2024-11-08 | 2024-11-08 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?page=2&tags=BoosterPack) |
| dragonball | dragonball-fb05 | ブースターパック 未知なる冒険 | 2025-02-08 | 2025-02-08 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb06 | ブースターパック 迫り来る脅威 | 2025-04-26 | 2025-04-26 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb07 | ブースターパック 神龍への願い | 2025-09-13 | 2025-09-13 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb08 | ブースターパック 誇り高き戦闘民族 | 2025-12-13 | 2025-12-13 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb09 | ブースターパック DUAL EVOLUTION | 2026-03-14 | 2026-03-14 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb10 | ブースターパック CROSS FORCE | 2026-06-13 | 2026-06-13 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb11 | ブースターパック BRIGHTNESS OF HOPE | 2026-09-12 | 2026-09-12 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb12 | ブースターパック REACH THE GOD | 2026-12-12 | 2026-12-12 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-limited-edition-01 | オフィシャルプレイマット&カードセット Limited Edition 01 | 2026-03-20 | 2026-03-20 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_331.html) |
| dragonball | dragonball-premium-card-collection-01 | プレミアムカードコレクション01 -Leaders- | 2025-03-15 | 2025-03-15 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/02_59.html) |
| dragonball | dragonball-sb01 | MANGA BOOSTER 01 | 2025-06-28 | 2025-06-28 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-sb02 | MANGA BOOSTER 02 | 2025-11-08 | 2025-11-08 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | story-booster-01-st01-box | ドラゴンボールスーパーカードゲーム フュージョンワールド STORY BOOSTER 01 [ST01] BOX | 2026-08-08 | 2026-08-08 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| onepiece | onepiece-eb02 | エクストラブースター Anime 25th collection | 2025-01-25 | 2025-01-25 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?page=2&subcategory=boosters) |
| onepiece | onepiece-eb03 | エクストラブースター ONE PIECE Heroines Edition | 2025-10-25 | 2025-10-25 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-eb04 | エクストラブースター EGGHEAD CRISIS | 2026-01-31 | 2026-01-31 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-eb05 | エクストラブースター ONE PIECE Heroines Edition vol.2 | 2026-10-01 | 2026-10-31 | 修正対象 | [公式](https://www.onepiece-cardgame.com/products/eb05.html) |
| onepiece | onepiece-kumamoto-special | プレミアムカードコレクション 熊本県スペシャル | 2026-02-22 | 2026-02-22 | 一致 | [公式](https://www.onepiece-cardgame.com/products/other/premium-card_collection_kumamoto-sp.php) |
| onepiece | onepiece-op09 | ブースターパック 新たなる皇帝 | 2024-08-31 | 2024-08-31 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?page=2&subcategory=boosters) |
| onepiece | onepiece-op10 | ブースターパック 王族の血統 | 2024-11-30 | 2024-11-30 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?page=2&subcategory=boosters) |
| onepiece | onepiece-op11 | ブースターパック 神速の拳 | 2025-03-01 | 2025-03-01 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op12 | ブースターパック 師弟の絆 | 2025-05-31 | 2025-05-31 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op13 | ブースターパック 受け継がれる意志 | 2025-08-23 | 2025-08-23 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op14 | ブースターパック 蒼海の七傑 | 2025-11-22 | 2025-11-22 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op15 | ブースターパック 神の島の冒険 | 2026-02-28 | 2026-02-28 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op16 | ブースターパック 決戦の刻 | 2026-05-30 | 2026-05-30 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-prb01 | プレミアムブースター ONE PIECE CARD THE BEST | 2024-07-27 | 2024-07-27 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?page=2&subcategory=boosters) |
| onepiece | onepiece-prb02 | プレミアムブースター ONE PIECE CARD THE BEST vol.2 | 2025-07-26 | 2025-07-26 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | world-strongest-warriors-op17-box | ONE PIECEカードゲーム ブースターパック「世界最強の戦士」[OP-17] BOX | 2026-08-22 | 2026-08-22 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| pokemon | 30th-celebration-box | ポケモンカードゲーム MEGA 拡張パック「30th CELEBRATION」BOX | 2026-09-16 | 2026-09-16 | 一致 | [公式](https://www.30th.pokemon-card.com/product/m6a) |
| pokemon | 30th-celebration-futuristic-box | 30th CELEBRATION FUTURISTIC BOX | 2026-09-16 | 2026-09-16 | 一致 | [公式](https://www.30th.pokemon-card.com/product/furbox) |
| pokemon | 30th-celebration-premium-deck-set-espeon-umbreon | 30th CELEBRATION プレミアムデッキセット エーフィ・ブラッキー | 2026-09-16 | 2026-09-16 | 一致 | [公式](https://www.30th.pokemon-card.com/product/mf?slide=modal) |
| pokemon | abyss-eye-box | 拡張パック「アビスアイ」 | 2026-05-22 | 2026-05-22 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | battle-partners-box | 拡張パック「バトルパートナーズ」 | 2025-01-24 | 2025-01-24 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | black-bolt-box | 拡張パック「ブラックボルト」 | 2025-06-06 | 2025-06-06 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | black-bolt-deluxe-box | 拡張パックデラックス「ブラックボルト」 | 2025-06-06 | 2025-06-06 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | hot-wind-arena-box | 強化拡張パック「熱風のアリーナ」 | 2025-03-14 | 2025-03-14 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | inferno-x-box | 拡張パック「インフェルノX」 | 2025-09-26 | 2025-09-26 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | mega-brave-box | ポケモンカードゲーム MEGA 拡張パック「メガブレイブ」BOX | 2025-08-01 | 2025-08-01 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | mega-dream-ex-box | ハイクラスパック「MEGAドリームex」 | 2025-11-28 | 2025-11-28 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | mega-symphonia-box | ポケモンカードゲーム MEGA 拡張パック「メガシンフォニア」BOX | 2025-08-01 | 2025-08-01 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | munikis-zero-box | 拡張パック「ムニキスゼロ」 | 2026-01-23 | 2026-01-23 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | ninja-spinner-box | 拡張パック「ニンジャスピナー」 | 2026-03-13 | 2026-03-13 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | pokemon-center-fukuoka-special-box | スペシャルBOX ポケモンセンターフクオカ | 2025-06-13 | 2025-07-11 | 修正対象 | [公式](https://www.pokemoncenter-online.com/4521329431536.html) |
| pokemon | pokemon-center-hiroshima-special-box | スペシャルBOX ポケモンセンターヒロシマ | 2025-06-13 | 2025-07-04 | 修正対象 | [公式](https://www.pokemoncenter-online.com/4521329427669.html) |
| pokemon | pokemon-center-tohoku-special-box | スペシャルBOX ポケモンセンタートウホク | 2025-06-13 | 2025-06-20 | 修正対象 | [公式](https://www.pokemoncenter-online.com/4521329431277.html) |
| pokemon | premium-trainer-box-mega | プレミアムトレーナーボックス MEGA | 2025-08-01 | 2025-08-01 | 一致 | [公式](https://www.pokemoncenter-online.com/4521329374635.html) |
| pokemon | rocket-glory-box | 拡張パック「ロケット団の栄光」 | 2025-04-18 | 2025-04-18 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | storm-emeralda-box | ポケモンカードゲーム MEGA 拡張パック「ストームエメラルダ」BOX | 2026-07-31 | 2026-07-31 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | super-electric-breaker-box | 超電ブレイカー BOX | 2024-10-18 | 2024-10-18 | 一致 | [公式](https://www.pokemon-card.com/ex/sv8/index.html) |
| pokemon | terastal-festival-box | テラスタルフェス BOX | 2024-12-06 | 2024-12-06 | 一致 | [公式](https://www.pokemon-card.com/ex/sv8a/index.html) |
| pokemon | white-flare-box | 拡張パック「ホワイトフレア」 | 2025-06-06 | 2025-06-06 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | white-flare-deluxe-box | 拡張パックデラックス「ホワイトフレア」 | 2025-06-06 | 2025-06-06 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |

## BOX誤取得の回帰確認

ブラックボルト、ホワイトフレア、OP-17、ST01について、実際のローダー出品名と15種の保管用品表記を先頭候補に置くテストを用意。用品だけなら候補なし、本物1BOXが続けばその候補を採用する。全181テスト成功。これは入力fixtureによる検証であり、実Yahoo検索の結果とは区別する。

## ST01の取得先確認

本番は2026-10-04T19:42:22.214Zに13,500円から17,800円へ更新されていた。現在の取得先はサンズオンラインストア。商品ページは1BOX=20パック、新品未開封、JAN 4582770011982、17,800円と記載。

https://store.shopping.yahoo.co.jp/suns-online-store/td-wezj-dmfk.html

ページと保存内容は一致するが、PR #41で現在選択されるAPI候補をdry-runで確認した結果ではない。13,500円は現在値ではなくrankingのpreviousPriceに残る。

## 最新10商品ずつ: 実dry-run未完了

ローカルはYAHOO_CLIENT_IDが未提供。npm run audit:latest-card-pricesは資格情報不足で終了した。Vercel MCPはpremium-hubチームへの403、CLIは未導入・VERCEL_TOKEN未提供。現在のAPI選択候補・価格は全30件未確認。保存値をdry-run結果として転記しない。

以下は実行対象と本番の保存値のみ。怪しい候補がないという判定はできない。

| ジャンル | 商品名 | 発売日 | 選択候補（dry-run） | 価格（dry-run） | 本番保存値（参考） |
| --- | --- | --- | --- | --- | ---: |
| pokemon | ポケモンカードゲーム MEGA 拡張パック「30th CELEBRATION」BOX | 2026-09-16 | 未実行 | 未確認 | 29000 |
| pokemon | ポケモンカードゲーム MEGA 拡張パック「ストームエメラルダ」BOX | 2026-07-31 | 未実行 | 未確認 | 10499 |
| pokemon | 拡張パック「アビスアイ」 | 2026-05-22 | 未実行 | 未確認 | 9960 |
| pokemon | 拡張パック「ニンジャスピナー」 | 2026-03-13 | 未実行 | 未確認 | 11180 |
| pokemon | 拡張パック「ムニキスゼロ」 | 2026-01-23 | 未実行 | 未確認 | 未取得 |
| pokemon | ハイクラスパック「MEGAドリームex」 | 2025-11-28 | 未実行 | 未確認 | 未取得 |
| pokemon | 拡張パック「インフェルノX」 | 2025-09-26 | 未実行 | 未確認 | 未取得 |
| pokemon | ポケモンカードゲーム MEGA 拡張パック「メガブレイブ」BOX | 2025-08-01 | 未実行 | 未確認 | 8499 |
| pokemon | ポケモンカードゲーム MEGA 拡張パック「メガシンフォニア」BOX | 2025-08-01 | 未実行 | 未確認 | 7999 |
| pokemon | 拡張パック「ブラックボルト」 | 2025-06-06 | 未実行 | 未確認 | 1180 |
| onepiece | ONE PIECEカードゲーム ブースターパック「世界最強の戦士」[OP-17] BOX | 2026-08-22 | 未実行 | 未確認 | 12800 |
| onepiece | ブースターパック 決戦の刻 | 2026-05-30 | 未実行 | 未確認 | 12480 |
| onepiece | ブースターパック 神の島の冒険 | 2026-02-28 | 未実行 | 未確認 | 11800 |
| onepiece | エクストラブースター EGGHEAD CRISIS | 2026-01-31 | 未実行 | 未確認 | 未取得 |
| onepiece | ブースターパック 蒼海の七傑 | 2025-11-22 | 未実行 | 未確認 | 未取得 |
| onepiece | エクストラブースター ONE PIECE Heroines Edition | 2025-10-25 | 未実行 | 未確認 | 未取得 |
| onepiece | ブースターパック 受け継がれる意志 | 2025-08-23 | 未実行 | 未確認 | 未取得 |
| onepiece | プレミアムブースター ONE PIECE CARD THE BEST vol.2 | 2025-07-26 | 未実行 | 未確認 | 未取得 |
| onepiece | ブースターパック 師弟の絆 | 2025-05-31 | 未実行 | 未確認 | 未取得 |
| onepiece | ブースターパック 神速の拳 | 2025-03-01 | 未実行 | 未確認 | 未取得 |
| dragonball | ブースターパック BRIGHTNESS OF HOPE | 2026-09-12 | 未実行 | 未確認 | 10500 |
| dragonball | ドラゴンボールスーパーカードゲーム フュージョンワールド STORY BOOSTER 01 [ST01] BOX | 2026-08-08 | 未実行 | 未確認 | 17800 |
| dragonball | ブースターパック CROSS FORCE | 2026-06-13 | 未実行 | 未確認 | 未取得 |
| dragonball | ブースターパック DUAL EVOLUTION | 2026-03-14 | 未実行 | 未確認 | 10700 |
| dragonball | ブースターパック 誇り高き戦闘民族 | 2025-12-13 | 未実行 | 未確認 | 未取得 |
| dragonball | MANGA BOOSTER 02 | 2025-11-08 | 未実行 | 未確認 | 未取得 |
| dragonball | ブースターパック 神龍への願い | 2025-09-13 | 未実行 | 未確認 | 未取得 |
| dragonball | MANGA BOOSTER 01 | 2025-06-28 | 未実行 | 未確認 | 未取得 |
| dragonball | ブースターパック 迫り来る脅威 | 2025-04-26 | 未実行 | 未確認 | 未取得 |
| dragonball | ブースターパック 未知なる冒険 | 2025-02-08 | 未実行 | 未確認 | 未取得 |

ブラックボルト・ホワイトフレアは最新10枠外でも追加監査する（script対応済み）。

## 本番修復案: 実行せず、承認前の提案

| 対象 | 現在値 | 修正後予定値／方針 |
| --- | --- | --- |
| ブラックボルト products.marketPrice | 1,180円 | 誤取得値を削除して未取得表示。数値の再設定は実dry-run確認後 |
| ホワイトフレア products.marketPrice | 1,180円 | 同上 |
| 上記2件のshop/url、ranking各価格 | ローダー取得先、1,180円 | 誤った取引情報とrankingを除去。正しい候補取得後に作成。削除対象JSONと行を承認時に再SELECTして提示 |
| ST01 products.marketPrice / ranking.currentPrice | 17,800円 | 価格書き換え予定なし。実dry-run結果を見て判断 |
| ST01 ranking.previousPrice | 13,500円 | 過去値の妥当性を再確認。根拠なく履歴を上書きしない |
| EB-05 releaseDate | 2026-10-01 | 2026-10-31（PRの公式マスタ補正で表示・追跡対象を訂正。DB修復は別途承認） |
| トウホク releaseDate | 2025-06-13 | 2025-06-20 |
| ヒロシマ releaseDate | 2025-06-13 | 2025-07-04 |
| フクオカ releaseDate | 2025-06-13 | 2025-07-11 |

誤価格を正常な前回値として増減率計算に使わない修復が必要。price_historyは未変更。修復時は対象履歴とJSONを再SELECTし、同時更新ガード・変更後SELECTを含む計画を承認後に実行する。

## 検証状況

- 前head 6d06369: GitHub Actions CI run 37198702287 success。Vercel botはERROR。ログにアクセスできないため原因確定は不可。
- 今回: 全181tests成功（node --import tsx --test）。npm testのtsx CLIは環境IPCのEPERM。標準npm testはActionsで確認する。
- 追加変更後のlint、TypeScript、production webpack buildも成功。
- 資格情報必須の監査を通常buildに連結する一時hookを除去し、明示的な読み取り専用監査コマンドへ移した。資格情報不足で監査は未実行のままであり、成功扱いにしない。
- 最終ActionsとPreview READY/画面確認、全30件のライブdry-runは未完了。これらが完了するまでマージ不可。

画像分離・プレ速くん背景・その他注目商品はPRに維持。
