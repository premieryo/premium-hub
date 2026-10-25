# 発売日だけの修正：Codexレビュー待ち（2026-10-26 JST）

基点main：ef8b701a1900c0e1dd51beb0347501a11192a8b1。PR #41：d58c7c722c9ca8c52fd13cfbc2319830280ea0e7、未マージ。最新SHA・差分・既存監査を確認して着手。

## 6商品の照合

10月26日08:48〜08:50 JSTに本番DBをSELECTし、本番とPR #41 Previewを直接HTTPS取得（全対象HTTP200）。検索キャッシュから現在表示を推測していない。公式6商品詳細も直接取得してすべてHTTP200で発売日を確認。

| 商品 / DB ID | 公式発売日 | DB releaseDate | 本番表示 | PR #41 Preview |
| --- | --- | --- | --- | --- |
| 30th CELEBRATION / 30th-celebration-box | 2026-09-16 | 2026-09-16 | 9/15・発売済み | 9/16・発売済み |
| FUTURISTIC BOX / 30th-celebration-futuristic-box | 2026-09-16 | 2026-09-16 | 9/15・発売済み | 9/16・発売済み |
| ストームエメラルダ / storm-emeralda-box | 2026-07-31 | 2026-07-31 | 7/30・発売済み | 7/31・発売済み |
| EB-05 / onepiece-eb05 | 2026-10-31 | 2026-10-31 | 9/30・発売済み | 10/31・発売予定 |
| FB11 / dragonball-fb11 | 2026-09-12 | 2026-09-12 | 9/11・発売済み | 9/12・発売済み |
| FB12 / dragonball-fb12 | 2026-12-12 | 2026-12-12 | 12/11・発売予定 | 12/12・発売予定 |

公式一次情報：

- https://www.30th.pokemon-card.com/product/m6a
- https://www.30th.pokemon-card.com/product/furbox
- https://www.pokemon-card.com/ex/m6/
- https://www.onepiece-cardgame.com/products/eb05.html
- https://www.dbs-cardgame.com/fw/jp/products/01_422.html
- https://www.dbs-cardgame.com/fw/jp/products/01_477.html

比較表示URL：本番 https://premiumsokuho.jp とPR #41 https://premium-4e6m9w6hx-premium-hub.vercel.app の /pokemon/products、/pokemon/collections、/onepiece/products、/dragonball/products。FUTURISTICはcollection-boxのためcollectionsを確認。FB11とFW-11など別商品を取り違えていない。

## 原因の切り分け

1. 元データ：対象6件のDB発売日は公式と一致。mainのonepiece-eb05カタログだけ10/1が残り、mergeOfficialCardCatalogがDB 10/31より優先する。これがEB05の元データ誤り。
2. 表示：PublicProductCardがJST午前0時をDateへ変換後、timeZone指定なしのIntlで表示。UTCサーバーでは前日15時となり1日前表示になる。他商品も同じ共通カードで再発し得る。
3. 発売前/発売済み：既存isReleasedInTokyoとsplitBoosterProductsByReleaseはJST日付で比較している。EB05の発売済み判定は旧カタログ10/1に起因し、10/31に直すことで当日JST午前0時に切り替わる。判定アルゴリズム自体は変更しない。

## DB変更予定

対象6件のreleaseDateは更新不要。本番DB変更0件。

releaseStatusは30th/FUTURISTIC/FB11がupcomingのまま。ただし公開表示・発売判定はreleaseDateから算出し、当該フラグを参照しない。表示誤りの原因と混同しない。

将来、保存状態も揃える場合の任意の正規化候補（今回実施せず、発売日修正のリリース条件にしない）：

| ID | 項目 | 旧値 | 予定値 | 根拠・影響 |
| --- | --- | --- | --- | --- |
| 30th-celebration-box | releaseStatus | upcoming | released | 公式9/16、確認時点で経過。静的メタデータのみ |
| 30th-celebration-futuristic-box | releaseStatus | upcoming | released | 同上 |
| dragonball-fb11 | releaseStatus | upcoming | released | 公式9/12、確認時点で経過。静的メタデータのみ |

後日実行するなら再SELECT・バックアップ・対象ID/旧値一致・再SELECTが必要。releaseDate・価格・画像・価格取得日時・価格履歴は変更しない。

## 最小修正・検証

- PR #41のlib/release-date.tsをそのまま再利用。カレンダー文字列を検証し時差変換せず表示。不正値は「発売日未確認」。PublicProductCardの呼び出しだけ差し替える。
- カタログのonepiece-eb05 releaseDateだけ10/1→10/31。
- 価格取得・JAN・画像・在庫表示・追跡判定・価格履歴・cron・定期タスクの変更なし。PR #41の他3件のスペシャルBOX修正も今回の対象6件とは分け、取り込まない。
- 全89テスト成功（main既存84＋追加5）。全カタログと6商品の実SSRをUTC/JST/米国時間で確認、不正日付と閏日、6商品の前日/当日JST境界、EB05カタログ結合と価格等の保持、発売予定/発売済み一覧への切替、発売日順と入力不変を検証。
- lint・型チェック・webpack build成功。ローカルbuildは公開DB設定なしのJSONフォールバックで、本番照合の代替ではない。最新SHAのCI・Preview・390px実表示はPR本文へ記録する。

## PR #41との重複整理（今は変更しない）

1. 本PRをCodexレビューし、別途許可された場合のみmainへマージ・本番反映。Yahoo API認証待ちとは独立。
2. その後PR #41に最新mainを取り込み、formatter・PublicProductCardの日付呼び出し・EB05の10/31を維持。本PRにPR #41全体をcherry-pickしない。
3. カタログ競合時はEB05の10/31を維持し、PR #41独自のJAN・公式URL・別商品の発売日修正は別差分として保持。カードの独自価格在庫UIも日付修正と取り違えない。
4. 本PRの新規テストはrelease-date-display.test.tsとし、PR #41のrelease-date.test.tsとの追加衝突を避ける。全体検証後に重複を整理する場合も、PR #41独自の3スペシャルBOX・価格追跡の公式日付優先回帰を失わない。
5. PR #41のdiffから本PRと同一の修正が消え、価格/画像等の独自差分が残ることを確認して再レビューする。

PR #41/#42/#43の変更、マージ、本番デプロイ、本番DB更新は行わずCodexレビュー待ちで停止する。
