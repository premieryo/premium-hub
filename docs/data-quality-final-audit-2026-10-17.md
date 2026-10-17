# 第1段階：PR #41 最終監査結果（2026-10-17）

**判定：要修正。第2段階への移行・マージ・本番デプロイは保留。** 本番DBは今回SELECTのみ。画像コンポーネント・PR #42を変更していない。

## 1. 監査範囲・証拠の時点

- 対象コード：PR #41 / separate-images-and-market-quality / `04154091078f698d49e00f1a1b12686177187191`。今回のコミットは監査文書のみで、アプリケーションコードは同一。
- 2026-10-17にGitHubからPR #41・#42のopen / merged=falseを再確認。PR #42は別チャットの変更でheadが進んでいるため、旧262件の結果をPR #41の結果として使用しない。
- 本番DB：3ジャンル61 products、25 ranking、251 price_historyを読み取り。最新30 BOX＋重点追加ホワイトフレアの31商品を突合。
- Yahoo最新30件は2026-10-08 UTC（10-09 JST）取得済みの非公開保存結果を使用。取得日時を明示し、10-17にYahoo APIを再実行した結果とは扱わない。全24採用候補を現PRコードで再検証し全件通過。最新30の対象IDは現在の発売済み最新10 BOX×3と一致。
- 現在の価格保存先21件は10-17に販売店ページを直接GET（すべてHTTP 200）し、Product JSON-LDの名称・JAN・価格・新品条件・在庫情報を読み取り。これはYahoo APIの新規dry-runとは別の確認。15件通過、2件除外対象、4件はavailability未提供で在庫未確認。
- 生レスポンス、監査ログ、バックアップ、Supabase資格情報、ValueCommerce識別子は本レポートに掲載しない。商品URLはアフィリエイトURLを展開した通常の販売店URL。公開サイトのpublic配下への監査資料配置はしていない。

## 2. Yahoo30商品の個別監査結果

採用条件：対象商品・シリーズ・仕様一致、日本語版、新品、在庫あり、BOX表記と未開封／シュリンク／テープの根拠、単一BOX。不適切な付属品・数量・状態・予約見出しを除外。下表の価格は取得当時のdry-run値で、本番の現在値とは異なる。

| ジャンル | 商品名 | 商品ID | 検索クエリ | 判定 | Yahoo商品タイトル | 採用価格 | 販売店 | 商品URL | 判定理由 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pokemon | ポケモンカードゲーム MEGA 拡張パック「30th CELEBRATION」BOX | 30th-celebration-box | 30th CELEBRATION BOX | 採用 | 新品未開封シュリンク付き ポケモンカードゲーム MEGA 拡張パック 30th CELEBRATION BOX | 27,500円 | イングス | https://store.shopping.yahoo.co.jp/ing-s/4521329462424.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| pokemon | ポケモンカードゲーム MEGA 拡張パック「ストームエメラルダ」BOX | storm-emeralda-box | ストームエメラルダ BOX | 採用 | (シュリンク付き未開封)ポケモンカードゲーム MEGA 拡張パック ストームエメラルダ BOX | 11,600円 | トレカの利休 | https://store.shopping.yahoo.co.jp/torekanorikyuu/pk-bp-se.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| pokemon | 拡張パック「アビスアイ」 | abyss-eye-box | アビスアイ BOX | 採用 | シュリンク付き　ポケモンカードゲーム アビスアイ BOX MEGA 拡張パック 新品未開封 | 9,970円 | sunny shop ヤフー店 | https://store.shopping.yahoo.co.jp/sunny-shop-store/4521329462127.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| pokemon | 拡張パック「ニンジャスピナー」 | ninja-spinner-box | ニンジャスピナー BOX | 採用 | ポケモンカードゲーム MEGA 拡張パック ニンジャスピナー BOX シュリンク付キャンセル不可 | 11,180円 | モトナワールドYahoo!ショップ | https://store.shopping.yahoo.co.jp/motona/92094400.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| pokemon | 拡張パック「ムニキスゼロ」 | munikis-zero-box | ムニキスゼロ BOX | 採用 | シュリンク付き　ポケモンカードゲーム MEGA 拡張パック ムニキスゼロ BOX | 9,500円 | sunny shop ヤフー店 | https://store.shopping.yahoo.co.jp/sunny-shop-store/4521329432267.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| pokemon | ハイクラスパック「MEGAドリームex」 | mega-dream-ex-box | MEGAドリームex BOX | 採用 | ポケモンカードゲーム MEGA ハイクラスパック MEGAドリームex BOX※シュリンク付き | 14,489円 | らいぶshop | https://store.shopping.yahoo.co.jp/light-hikari/4521329431932.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| pokemon | 拡張パック「インフェルノX」 | inferno-x-box | インフェルノX BOX | 採用 | ポケモンカードゲーム MEGA 拡張パック インフェルノX BOX 【シュリンク付き未開封品】 | 19,000円 | お宝あっと町田Yahoo!ショップ | https://store.shopping.yahoo.co.jp/otakara-machida/0320250924101.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| pokemon | ポケモンカードゲーム MEGA 拡張パック「メガシンフォニア」BOX | mega-symphonia-box | メガシンフォニア BOX | 採用 | (シュリンク付き)ポケモンカードゲーム MEGA 拡張パック メガシンフォニア BOX | 8,300円 | トレカの利休 | https://store.shopping.yahoo.co.jp/torekanorikyuu/pk-bp-ms.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| pokemon | ポケモンカードゲーム MEGA 拡張パック「メガブレイブ」BOX | mega-brave-box | メガブレイブ BOX | 採用 | (未開封シュリンク付き)ポケモンカードゲーム MEGA 拡張パック メガブレイブ BOX | 8,900円 | トレカの利休 | https://store.shopping.yahoo.co.jp/torekanorikyuu/pk-bp-mb.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| pokemon | 拡張パック「ブラックボルト」 | black-bolt-box | ブラックボルト BOX | 採用 | 『新品』ポケモンカード S&V 拡張パック ブラックボルト BOX ※シュリンク付き | 29,400円 | ノア商社Yahoo!店 | https://store.shopping.yahoo.co.jp/noahshoping/4521329427768.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | ONE PIECEカードゲーム ブースターパック「世界最強の戦士」[OP-17] BOX | world-strongest-warriors-op17-box | 世界最強の戦士 OP-17 BOX | 採用 | 【未開封BOX】【新品】 ONE PIECE カードゲーム ブースターパック 世界最強の戦士 OP-17 BOX 佐賀 | 12,800円 | 赤い熊さんYahoo!店 | https://store.shopping.yahoo.co.jp/akaikumasan/4582770058406.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | ブースターパック 決戦の刻 | onepiece-op16 | 決戦の刻 OP-16 BOX | 採用 | 新品未開封 ONE PIECE カードゲーム ブースターパック 決戦の刻 OP-16 BOX | 12,480円 | モトナワールドYahoo!ショップ | https://store.shopping.yahoo.co.jp/motona/9110058.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | ブースターパック 神の島の冒険 | onepiece-op15 | 神の島の冒険 OP-15 BOX | 採用 | 新品未開封 ONE PIECE カードゲーム ブースターパック 神の島の冒険 OP-15 BOX | 11,800円 | モトナワールドYahoo!ショップ | https://store.shopping.yahoo.co.jp/motona/91999200-b.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | エクストラブースター EGGHEAD CRISIS | onepiece-eb04 | EGGHEAD CRISIS EB-04 BOX | 採用 | 【新品】【即納】 「テープ付き」ONE PIECEカードゲーム エクストラブースター EGGHEAD CRISIS【EB-04】　BOX 24パック入り ワンピース トレカ | 16,799円 | SPW(適格請求書発行事業者)Yahoo!店 | https://store.shopping.yahoo.co.jp/speedwagon/10014387.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | ブースターパック 蒼海の七傑 | onepiece-op14 | 蒼海の七傑 OP-14 BOX | 採用 | 【新品未開封テープ付きBOX】ONE PIECEカードゲーム 蒼海の七傑【OP-14】 BOX | 11,480円 | GOチャンストア公式 Yahoo!店 | https://store.shopping.yahoo.co.jp/gochanstore/b0fqb2bqhm.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | エクストラブースター ONE PIECE Heroines Edition | onepiece-eb03 | ONE PIECE Heroines Edition EB-03 BOX | 採用 | ワンピース カードゲーム エクストラブースター Heroines Edition BOX ONE PIECE EB-03 バンダイ BANDAI 新品未開封 | 17,480円 | イーバリューYahoo!店 | https://store.shopping.yahoo.co.jp/evalue-omochayasan/4582769865220.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | ブースターパック 受け継がれる意志 | onepiece-op13 | 受け継がれる意志 OP-13 BOX | 採用 | 新品未開封 バンダイ (BANDAI) ONE PIECEカードゲーム  ブースターパック 受け継がれる意志 【OP-13】(BOX) | 21,480円 | モトナワールドYahoo!ショップ | https://store.shopping.yahoo.co.jp/motona/91985300.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | プレミアムブースター ONE PIECE CARD THE BEST vol.2 | onepiece-prb02 | ONE PIECE CARD THE BEST vol.2 PRB-02 BOX | 採用 | 【新品】１週間以内発送「テープ付き」ONE PIECEカードゲーム プレミアムブースター ONE PIECE CARD THE BEST vol.2【PRB-02】 (BOX)10パック入り　バンダイ | 18,697円 | SPW(適格請求書発行事業者)Yahoo!店 | https://store.shopping.yahoo.co.jp/speedwagon/10014510.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | ブースターパック 師弟の絆 | onepiece-op12 | 師弟の絆 OP-12 BOX | 採用 | ワンピース カードゲーム 師弟の絆 BOX ONE PIECE OP-12 バンダイ BANDAI 新品未開封 | 29,380円 | イーバリューYahoo!店 | https://store.shopping.yahoo.co.jp/evalue-omochayasan/4582769796838.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| onepiece | ブースターパック 神速の拳 | onepiece-op11 | 神速の拳 OP-11 BOX | スキップ | — | — | — | — | 50候補で安全な未開封1BOXの根拠不足。取得・書込なし |
| dragonball | ブースターパック BRIGHTNESS OF HOPE | dragonball-fb11 | BRIGHTNESS OF HOPE FB11 BOX | 採用 | ドラゴンボール スーパーカードゲーム フュージョンワールド ブースターパック BRIGHTNESS OF HOPE FB11 BOX商品 新品 未開封品 トレカ TCG | 10,500円 | SPJ Store | https://store.shopping.yahoo.co.jp/speranzajapan-store/4582770066562.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| dragonball | ドラゴンボールスーパーカードゲーム フュージョンワールド STORY BOOSTER 01 [ST01] BOX | story-booster-01-st01-box | STORY BOOSTER 01 ST01 BOX | 採用 | ドラゴンボールスーパーカードゲーム フュージョンワールド STORY BOOSTER 01 ST01 BOX ｜ 未開封 バンダイ BANDAI DBFW トレカ | 17,800円 | サンズオンラインストア | https://store.shopping.yahoo.co.jp/suns-online-store/td-wezj-dmfk.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| dragonball | ブースターパック CROSS FORCE | dragonball-fb10 | CROSS FORCE FB10 BOX | 採用 | 最安 即納『新品未開封 メーカーテープ付き』 ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック CROSS FORCE FB10 BOX 2026/6/13発売 | 12,480円 | オンラインショップ ミヤビ | https://store.shopping.yahoo.co.jp/yosabei/4582769965937.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| dragonball | ブースターパック DUAL EVOLUTION | dragonball-fb09 | DUAL EVOLUTION FB09 BOX | 採用 | 最安 即納『新品未開封 メーカーテープ付き』ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック DUAL EVOLUTION FB09 BOX 2026/3/14 | 10,700円 | オンラインショップ ミヤビ | https://store.shopping.yahoo.co.jp/yosabei/4582769937071.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |
| dragonball | ブースターパック 誇り高き戦闘民族 | dragonball-fb08 | 誇り高き戦闘民族 FB08 BOX | スキップ | — | — | — | — | 50候補で安全な未開封1BOXの根拠不足。取得・書込なし |
| dragonball | MANGA BOOSTER 02 | dragonball-sb02 | MANGA BOOSTER 02 SB02 BOX | スキップ | — | — | — | — | 50候補で安全な未開封1BOXの根拠不足。取得・書込なし |
| dragonball | ブースターパック 神龍への願い | dragonball-fb07 | 神龍への願い FB07 BOX | スキップ | — | — | — | — | 50候補で安全な未開封1BOXの根拠不足。取得・書込なし |
| dragonball | MANGA BOOSTER 01 | dragonball-sb01 | MANGA BOOSTER 01 SB01 BOX | スキップ | — | — | — | — | 50候補で安全な未開封1BOXの根拠不足。取得・書込なし |
| dragonball | ブースターパック 迫り来る脅威 | dragonball-fb06 | 迫り来る脅威 FB06 BOX | スキップ | — | — | — | — | 50候補で安全な未開封1BOXの根拠不足。取得・書込なし |
| dragonball | ブースターパック 未知なる冒険 | dragonball-fb05 | 未知なる冒険 FB05 BOX | 採用 | 『新品未開封』BANDAI(バンダイ)ドラゴンボールスーパーカードゲーム フュージョンワールド 未知なる冒険 FB05 [BOX] | 11,800円 | ノア商社Yahoo!店 | https://store.shopping.yahoo.co.jp/noahshoping/4582769733710.html | 商品同一性・新品・在庫・未開封1BOX条件を通過 |

## 3. スキップ6件の理由

| 商品ID | 確認した50候補の内訳 |
| --- | --- |
| dragonball-fb06 | 未開封BOX根拠不足49、異なるシリーズ1 |
| dragonball-fb07 | 未開封BOX根拠不足50 |
| dragonball-fb08 | 未開封BOX根拠不足50 |
| dragonball-sb01 | 未開封BOX根拠不足46、商品名不一致4 |
| dragonball-sb02 | 未開封BOX根拠不足47、BOX封入数ではないパック数量2、商品名不一致1 |
| onepiece-op11 | 未開封BOX根拠不足48、商品名不一致2 |

名称上のBOXだけでは採用しない。6件は取得時点の安全なスキップであり、現在もすべて在庫がないという意味ではない。安全な価格が得られなかった商品へ推測値を書き込んでいない。

## 4. 重点候補：ローダー・別仕様・STORY BOOSTER 01

- 1,180円ローダー：保存済みの実API候補12件を現PRのvalidateCandidateへ入力し、12件除外・採用0件。ブラックボルト／ホワイトフレアそれぞれ3検索の重複を含む候補レコード12件であり、12種類の別商品という意味ではない。URLは horikku/2buuu1o801.html、zebrand-shop/2buuu1o801.html 等。用品だけなら不採用、後続に本物BOXがあればそれを採用する3ジャンル共通回帰も成功。
- 保存済み重点再取得：ブラックボルト通常版29,400円（noahshoping/4521329427768.html）、ホワイトフレア通常版25,300円（noahshoping/4521329427782.html）は現PRでも通過。
- 通常版／デラックス版は双方の取り違えを回帰で除外。今回の本番ブラックボルト26,500円はnoahshoping/4521329427300.htmlの**デラックス版（1BOX=4パック）**を参照。現PRで「異なる商品仕様を検出」となり、不合格。通常版商品の価格・ランキング・履歴・画像に同一の別仕様出品が入っている。
- ST01の13,500円候補：オンラインショップ ミヤビ / https://store.shopping.yahoo.co.jp/yosabei/4582770011982.html 。タイトルは即納・新品未開封・メーカーテープ付きだが、保存APIのheadLineに「予約」があり現PRでは除外。価格の大小で不正と判定していない。
- 修正後dry-runのST01はサンズオンラインストア17,800円 / https://store.shopping.yahoo.co.jp/suns-online-store/td-wezj-dmfk.html を採用。
- 本番はその後10-12に10,980円へ更新済み。10-17の販売店直読ではトレカジャパン / https://store.shopping.yahoo.co.jp/torekajapan/ppp-2338.html / STORY BOOSTER 01 ST01 BOX【未開封BOX】/ NewCondition / InStock / JAN 4582770011982 / 10,980円で一致。保存価格を古い17,800円へ戻さない。
- ST01には10-02取得の13,500円の過去履歴1件が残る。当時の見出し・販売条件の完全な証拠は未確認。現在の予約見出しだけを根拠にその過去履歴を削除しない。

## 5. 修復対象商品の変更前後と現在値

今回の本番DB更新：**0件**。メガブレイブ／メガシンフォニアは再更新禁止の指示を遵守。旧修復値の適用と、その後の定期取得による変化を区別した。

| 商品ID | 過去の不適切候補価格 | 過去の修復・正値保存確認 | 現在の保存値 | 今回の判断 |
| --- | --- | --- | --- | --- |
| black-bolt-box | 1,180円（ローダー） | 29,400円。非公開変更前バックアップ4レコードの対象 | 26,500円 | 10-10にデラックス版が再混入。新しい通常版候補の取得・対象限定修復が必要 |
| white-flare-box | 1,180円（ローダー） | 25,300円。上記と同じ限定修復の対象 | 25,300円 | products/ranking/最新履歴・通常版リンク一致。今回書込なし |
| mega-brave-box | 8,499円（要注意事項出品） | 8,900円の保存を再SELECTで確認 | 8,900円 | 現在値は正値。previousPrice=8,499、+4.72%表示と該当履歴1件の扱いが残件。再更新なし |
| mega-symphonia-box | 7,999円（要注意事項出品） | 8,300円の保存を再SELECTで確認 | 8,300円 | 現在値は正値。previousPrice=7,999、+3.76%表示と該当履歴1件の扱いが残件。再更新なし |
| 30th-celebration-box | 今回発見：27,499円（要注意事項出品） | 修復未実施 | 27,499円 | 新しい安全な候補と旧値一致条件を用いた限定修復が必要 |
| story-booster-01-st01-box | 13,500円の予約見出し候補 | 保存値は17,800円を経て定期更新 | 10,980円 | 現在の正しいST01 BOX候補と一致。過去13,500円履歴は根拠確認待ちで維持 |

ブラックボルトと30th CELEBRATIONの新しい修復価格は未決定。10-08の候補価格を10-17の現在価格と推測して再適用しない。正しい既存履歴は全件維持した。

## 6. 本番DB整合性・初回価格・更新時刻

最新30商品＋重点ホワイトフレアの31商品を検証。21商品に現在価格があり、products.marketPrice＝ranking.currentPrice＝最新price_history.price、products.url＝最新履歴URLが全21件一致。残り10商品は未取得（スキップ6件＋採用dry-run後も本番未保存の4件）で、推測補完していない。数値・参照先の一致は商品同一性の保証ではなく、上記の別仕様／要注意事項問題は別途不合格。
「初回」はDBに残る最古の記録であり、発売時相場や修復前の不適切値を正値として扱うものではない。価格差が60%以内でも商品取り違えを許可しない。

| 商品ID | 現在値 | ranking現在値 | 前回値 | DB最古価格 | 最新履歴 | 履歴件数 | 商品更新時刻 UTC | 最新履歴時刻 UTC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dragonball-fb05 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| dragonball-fb06 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| dragonball-fb07 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| dragonball-fb08 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| dragonball-fb09 | 9,580円 | 9,580円 | 10,700円 | 10,700円 | 9,580円 | 2 | 2026-10-14T19:42:32.098Z | 2026-10-14 19:42:32.098+00 |
| dragonball-fb10 | 9,380円 | 9,380円 | 9,380円 | 9,380円 | 9,380円 | 1 | 2026-10-15T19:42:14.065Z | 2026-10-15 19:42:14.065+00 |
| dragonball-fb11 | 10,500円 | 10,500円 | 10,500円 | 10,500円 | 10,500円 | 2 | 2026-10-14T19:42:21.156Z | 2026-10-14 19:42:21.156+00 |
| dragonball-sb01 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| dragonball-sb02 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| story-booster-01-st01-box | 10,980円 | 10,980円 | 17,800円 | 27,700円 | 10,980円 | 24 | 2026-10-12T19:42:27.968Z | 2026-10-12 19:42:27.968+00 |
| onepiece-eb03 | 23,900円 | 23,900円 | 23,900円 | 23,900円 | 23,900円 | 1 | 2026-10-09T19:42:18.656Z | 2026-10-09 19:42:18.656+00 |
| onepiece-eb04 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| onepiece-op11 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| onepiece-op12 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| onepiece-op13 | 29,200円 | 29,200円 | 29,200円 | 29,200円 | 29,200円 | 1 | 2026-10-09T19:42:28.985Z | 2026-10-09 19:42:28.985+00 |
| onepiece-op14 | 16,000円 | 16,000円 | 16,000円 | 16,000円 | 16,000円 | 1 | 2026-10-16T19:42:31.462Z | 2026-10-16 19:42:31.462+00 |
| onepiece-op15 | 11,800円 | 11,800円 | 11,800円 | 12,800円 | 11,800円 | 23 | 2026-10-13T19:42:35.029Z | 2026-10-13 19:42:35.029+00 |
| onepiece-op16 | 12,480円 | 12,480円 | 12,480円 | 14,580円 | 12,480円 | 23 | 2026-10-13T19:42:16.990Z | 2026-10-13 19:42:16.99+00 |
| onepiece-prb02 | 未取得 | 未取得 | 未取得 | 未取得 | 未取得 | 0 | — | — |
| world-strongest-warriors-op17-box | 12,800円 | 12,800円 | 12,800円 | 25,880円 | 12,800円 | 24 | 2026-10-12T19:42:22.101Z | 2026-10-12 19:42:22.101+00 |
| 30th-celebration-box | 27,499円 | 27,499円 | 29,000円 | 29,000円 | 27,499円 | 2 | 2026-10-14T19:42:15.417Z | 2026-10-14 19:42:15.417+00 |
| abyss-eye-box | 9,970円 | 9,970円 | 9,960円 | 9,960円 | 9,970円 | 2 | 2026-10-14T19:42:26.493Z | 2026-10-14 19:42:26.493+00 |
| black-bolt-box | 26,500円 | 26,500円 | 29,400円 | 29,400円 | 26,500円 | 2 | 2026-10-10T19:42:23.863Z | 2026-10-10 19:42:23.863+00 |
| inferno-x-box | 20,000円 | 20,000円 | 19,000円 | 19,000円 | 20,000円 | 2 | 2026-10-16T19:42:25.399Z | 2026-10-16 19:42:25.399+00 |
| mega-brave-box | 8,900円 | 8,900円 | 8,499円 | 12,000円 | 8,900円 | 24 | 2026-10-13T19:42:29.678Z | 2026-10-13 19:42:29.678+00 |
| mega-dream-ex-box | 15,480円 | 15,480円 | 14,489円 | 14,489円 | 15,480円 | 2 | 2026-10-15T19:42:25.322Z | 2026-10-15 19:42:25.322+00 |
| mega-symphonia-box | 8,300円 | 8,300円 | 7,999円 | 10,390円 | 8,300円 | 24 | 2026-10-14T19:42:08.513Z | 2026-10-14 19:42:08.513+00 |
| munikis-zero-box | 10,500円 | 10,500円 | 9,500円 | 9,500円 | 10,500円 | 2 | 2026-10-15T19:42:19.742Z | 2026-10-15 19:42:19.742+00 |
| ninja-spinner-box | 11,180円 | 11,180円 | 11,180円 | 12,780円 | 11,180円 | 23 | 2026-10-13T19:42:22.994Z | 2026-10-13 19:42:22.994+00 |
| storm-emeralda-box | 10,800円 | 10,800円 | 10,499円 | 17,000円 | 10,800円 | 24 | 2026-10-13T19:42:09.999Z | 2026-10-13 19:42:09.999+00 |
| white-flare-box | 25,300円 | 25,300円 | 25,300円 | 25,300円 | 25,300円 | 1 | 2026-10-08T15:28:03.908234+00:00 | 2026-10-08 15:28:03.908234+00 |

既存ranking25件のうち4件は現在の最新30追跡対象外の旧データ。うち超電ブレイカー／テラスタルフェスにはDB履歴がないため、過去の初回値を実履歴として新規作成しない。対象外の正常データを削除していない。

### 6.1 現在保存されている販売店ページ21件の確認

HTTP 200およびJSON-LDを直接確認。availabilityがない4件は在庫未確認であり、在庫切れと断定しない。掲載中価格は全21件でDB値と一致した。予約headLineはJSON-LDには含まれないため、新しいYahoo APIレスポンスでの見出し確認を代替したとは扱わない。

| 商品ID | DB値 | 店頭ページ価格 | JAN | 商品タイトル | 判定／未確認 | URL |
| --- | --- | --- | --- | --- | --- | --- |
| 30th-celebration-box | 27,499円 | 27,499円 | 4521329462424 | 要注意事項確認!! シュリンク付 ポケモンカードゲーム MEGA 拡張パック 30th CELEBRATION BOX | 除外語を検出: 要注意事項 | https://store.shopping.yahoo.co.jp/mkrj/4521329462424.html |
| abyss-eye-box | 9,970円 | 9,970円 | 4521329462127 | シュリンク付き　ポケモンカードゲーム アビスアイ BOX MEGA 拡張パック 新品未開封 | pass | https://store.shopping.yahoo.co.jp/sunny-shop-store/4521329462127.html |
| black-bolt-box | 26,500円 | 26,500円 | 4521329427300 | 『新品』ポケモンカード S&V 拡張パックデラックス ブラックボルト BOX ※シュリンク付き | 異なる商品仕様を検出 | https://store.shopping.yahoo.co.jp/noahshoping/4521329427300.html |
| dragonball-fb09 | 9,580円 | 9,580円 | 4582769937071 | 【未開封BOX】【新品】 ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック DUAL EVOLUTION FB09 BOX 佐賀 | pass | https://store.shopping.yahoo.co.jp/akaikumasan/4582769937071.html |
| dragonball-fb10 | 9,380円 | 9,380円 | 4582769965937 | 【未開封BOX】【新品】 ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック CROSS FORCE FB10 BOX 佐賀 | pass | https://store.shopping.yahoo.co.jp/akaikumasan/4582769965937.html |
| dragonball-fb11 | 10,500円 | 10,500円 | 4582770066562 | ドラゴンボール スーパーカードゲーム フュージョンワールド ブースターパック BRIGHTNESS OF HOPE FB11 BOX商品 新品 未開封品 トレカ TCG | pass | https://store.shopping.yahoo.co.jp/speranzajapan-store/4582770066562.html |
| inferno-x-box | 20,000円 | 20,000円 | 4521329431529 | ポケモンカードゲーム MEGA 拡張パック インフェルノX BOX 【シュリンク付き未開封品】 | pass | https://store.shopping.yahoo.co.jp/otakara-machida/0320250924101.html |
| mega-brave-box | 8,900円 | 8,900円 | 4521329431154 | (未開封シュリンク付き)ポケモンカードゲーム MEGA 拡張パック メガブレイブ BOX | 在庫未確認（販売店JSON-LDにavailabilityなし。品切れと断定しない） | https://store.shopping.yahoo.co.jp/torekanorikyuu/pk-bp-mb.html |
| mega-dream-ex-box | 15,480円 | 15,480円 | 4521329431932 | ポケモンカードゲーム  MEGA ハイクラスパック MEGAドリームex BOX シュリンク付 | pass | https://store.shopping.yahoo.co.jp/motona/92093600.html |
| mega-symphonia-box | 8,300円 | 8,300円 | 4521329431178 | (シュリンク付き)ポケモンカードゲーム MEGA 拡張パック メガシンフォニア BOX | 在庫未確認（販売店JSON-LDにavailabilityなし。品切れと断定しない） | https://store.shopping.yahoo.co.jp/torekanorikyuu/pk-bp-ms.html |
| munikis-zero-box | 10,500円 | 10,500円 | 4521329432274 | 《未開封・シュリンク付き》ポケモンカードゲーム MEGA 拡張パック ムニキスゼロ BOX | 在庫未確認（販売店JSON-LDにavailabilityなし。品切れと断定しない） | https://store.shopping.yahoo.co.jp/creari-no/3900-32274.html |
| ninja-spinner-box | 11,180円 | 11,180円 | 4521329432786 | ポケモンカードゲーム MEGA 拡張パック ニンジャスピナー BOX シュリンク付キャンセル不可 | pass | https://store.shopping.yahoo.co.jp/motona/92094400.html |
| onepiece-eb03 | 23,900円 | 23,900円 | 4582769865220 | 『新品未開封』ONE PIECE(ワンピース)カードゲーム エクストラブースター ONE PIECE Heroines Edition EB-03 [BOX] | pass | https://store.shopping.yahoo.co.jp/noahshoping/4582769865220.html |
| onepiece-op13 | 29,200円 | 29,200円 | 4582769865213 | 新品未開封 受け継がれる意志 OP-13 ONE PIECE カードゲーム ワンピース ボックス バンダイ BANDAI | pass | https://store.shopping.yahoo.co.jp/free-world/cardbox-o-017.html |
| onepiece-op14 | 16,000円 | 16,000円 | 4582769922978 | 【BOX】ONE PIECE カードゲーム ブースターパック 蒼海の七傑 OP-14 BOX ｜ 未開封 ワンピース バンダイ ワンピースカード | pass | https://store.shopping.yahoo.co.jp/suns-online-store/s6-qt8o-kgoc.html |
| onepiece-op15 | 11,800円 | 11,800円 | 4582769966002 | 新品未開封 ONE PIECE カードゲーム ブースターパック 神の島の冒険 OP-15 BOX | pass | https://store.shopping.yahoo.co.jp/motona/91999200-b.html |
| onepiece-op16 | 12,480円 | 12,480円 | 4582769982897 | 新品未開封 ONE PIECE カードゲーム ブースターパック 決戦の刻 OP-16 BOX | pass | https://store.shopping.yahoo.co.jp/motona/9110058.html |
| storm-emeralda-box | 10,800円 | 10,800円 | 4521329462233 | 【未開封BOX】【新品】 ポケモンカードゲーム MEGA 拡張パック ストームエメラルダ BOX 佐賀 | 在庫未確認（販売店JSON-LDにavailabilityなし。品切れと断定しない） | https://store.shopping.yahoo.co.jp/akaikumasan/4521329462233.html |
| story-booster-01-st01-box | 10,980円 | 10,980円 | 4582770011982 | ドラゴンボールスーパーカードゲーム ドラゴンボールスーパーカードゲーム  フュージョンワールド STORY BOOSTER 01 ST01 BOX 【未開封BOX】 | pass | https://store.shopping.yahoo.co.jp/torekajapan/ppp-2338.html |
| white-flare-box | 25,300円 | 25,300円 | 4521329427782 | 『新品』ポケモンカード S&V 拡張パック ホワイトフレア BOX ※シュリンク付き | pass | https://store.shopping.yahoo.co.jp/noahshoping/4521329427782.html |
| world-strongest-warriors-op17-box | 12,800円 | 12,800円 | 4582770058406 | 【未開封BOX】【新品】 ONE PIECE カードゲーム ブースターパック 世界最強の戦士 OP-17 BOX 佐賀 佐賀 | pass | https://store.shopping.yahoo.co.jp/akaikumasan/4582770058406.html |


### 6.2 残る履歴の扱い

- ブラックボルト：通常版の29,400円履歴は維持。10-10の26,500円は別仕様出品に対応しているため、修復時に対象履歴1件をバックアップし、隔離範囲を明示する必要がある。
- メガブレイブ／メガシンフォニア：8,499円／7,999円の履歴は各1件残存。現在値は8,900円／8,300円で一致するが、その不適切な前回値を使った+4.72%／+3.76%を正常な高騰と扱えない。今回の再更新禁止範囲として変更せず引き継ぐ。
- ST01：10,980円と直前17,800円の変化率-38.31%は計算上整合。13,500円の当時証拠は不足するため、その過去記録は未確認として保持。
- 1,180円のローダー履歴はブラックボルト／ホワイトフレアとも0件。
- 原因：mainの旧validateCandidateにはPR #41の別仕様・要注意事項・予約見出しの共通対策が未適用。PR #41側は実際の問題タイトルを除外できる。未マージの間に本番の旧コードが再取得した結果を、PRの対策失敗と混同しない。

## 7. 発売日61件とJST対策

過去の公式一次情報監査表を現在DBへ全件突合し、61/61一致。ここでは公式61ページを再取得せず、確認済み一次情報の監査結果を再利用。修正4件はEB-05=2026-10-31、トウホク=2025-06-20、ヒロシマ=2025-07-04、フクオカ=2025-07-11を維持。
- formatReleaseDateはYYYY-MM-DDの年月日を直接組み立てる。ホストTZ依存のIntl表示を使わない。
- 全カタログをUTC／Asia/Tokyo／America/Los_Angelesで試験し、前日化しない。発売判定はJST午前0時の直前／直後を試験。EB-05も10-30 14:59:59Zでは未発売、15:00:00Zから発売。
- 既存PR #41 Preview /onepieceを今回GETしHTTP 200、2026年10月31日の表示を再確認。本番へのPR反映は行っておらず、本番全ページのJST修正完了とは宣言しない。

| ジャンル | 商品ID | 現在DB発売日 | 過去公式監査値 | 一致 | 一次情報（既存監査） |
| --- | --- | --- | --- | --- | --- |
| dragonball | dragonball-championship-illustrations-01 | 2025-09-21 | 2025-09-21 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_246.html) |
| dragonball | dragonball-championship-illustrations-02 | 2025-09-21 | 2025-09-21 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_245.html) |
| dragonball | dragonball-championship-set-01 | 2024-10-12 | 2024-10-12 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_77.html) |
| dragonball | dragonball-championship-set-02 | 2024-10-12 | 2024-10-12 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_78.html) |
| dragonball | dragonball-fb01 | 2024-02-16 | 2024-02-16 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?page=2&tags=BoosterPack) |
| dragonball | dragonball-fb02 | 2024-05-10 | 2024-05-10 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?page=2&tags=BoosterPack) |
| dragonball | dragonball-fb03 | 2024-08-09 | 2024-08-09 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?page=2&tags=BoosterPack) |
| dragonball | dragonball-fb04 | 2024-11-08 | 2024-11-08 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?page=2&tags=BoosterPack) |
| dragonball | dragonball-fb05 | 2025-02-08 | 2025-02-08 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb06 | 2025-04-26 | 2025-04-26 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb07 | 2025-09-13 | 2025-09-13 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb08 | 2025-12-13 | 2025-12-13 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb09 | 2026-03-14 | 2026-03-14 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb10 | 2026-06-13 | 2026-06-13 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb11 | 2026-09-12 | 2026-09-12 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-fb12 | 2026-12-12 | 2026-12-12 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-limited-edition-01 | 2026-03-20 | 2026-03-20 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/01_331.html) |
| dragonball | dragonball-premium-card-collection-01 | 2025-03-15 | 2025-03-15 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/02_59.html) |
| dragonball | dragonball-sb01 | 2025-06-28 | 2025-06-28 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | dragonball-sb02 | 2025-11-08 | 2025-11-08 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| dragonball | story-booster-01-st01-box | 2026-08-08 | 2026-08-08 | 一致 | [公式](https://www.dbs-cardgame.com/fw/jp/products/?tags=BoosterPack) |
| onepiece | onepiece-eb02 | 2025-01-25 | 2025-01-25 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?page=2&subcategory=boosters) |
| onepiece | onepiece-eb03 | 2025-10-25 | 2025-10-25 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-eb04 | 2026-01-31 | 2026-01-31 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-eb05 | 2026-10-31 | 2026-10-31 | 一致 | [公式](https://www.onepiece-cardgame.com/products/eb05.html) |
| onepiece | onepiece-kumamoto-special | 2026-02-22 | 2026-02-22 | 一致 | [公式](https://www.onepiece-cardgame.com/products/other/premium-card_collection_kumamoto-sp.php) |
| onepiece | onepiece-op09 | 2024-08-31 | 2024-08-31 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?page=2&subcategory=boosters) |
| onepiece | onepiece-op10 | 2024-11-30 | 2024-11-30 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?page=2&subcategory=boosters) |
| onepiece | onepiece-op11 | 2025-03-01 | 2025-03-01 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op12 | 2025-05-31 | 2025-05-31 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op13 | 2025-08-23 | 2025-08-23 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op14 | 2025-11-22 | 2025-11-22 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op15 | 2026-02-28 | 2026-02-28 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-op16 | 2026-05-30 | 2026-05-30 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | onepiece-prb01 | 2024-07-27 | 2024-07-27 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?page=2&subcategory=boosters) |
| onepiece | onepiece-prb02 | 2025-07-26 | 2025-07-26 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| onepiece | world-strongest-warriors-op17-box | 2026-08-22 | 2026-08-22 | 一致 | [公式](https://www.onepiece-cardgame.com/products/?subcategory=boosters) |
| pokemon | 30th-celebration-box | 2026-09-16 | 2026-09-16 | 一致 | [公式](https://www.30th.pokemon-card.com/product/m6a) |
| pokemon | 30th-celebration-futuristic-box | 2026-09-16 | 2026-09-16 | 一致 | [公式](https://www.30th.pokemon-card.com/product/furbox) |
| pokemon | 30th-celebration-premium-deck-set-espeon-umbreon | 2026-09-16 | 2026-09-16 | 一致 | [公式](https://www.30th.pokemon-card.com/product/mf?slide=modal) |
| pokemon | abyss-eye-box | 2026-05-22 | 2026-05-22 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | battle-partners-box | 2025-01-24 | 2025-01-24 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | black-bolt-box | 2025-06-06 | 2025-06-06 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | black-bolt-deluxe-box | 2025-06-06 | 2025-06-06 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | hot-wind-arena-box | 2025-03-14 | 2025-03-14 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | inferno-x-box | 2025-09-26 | 2025-09-26 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | mega-brave-box | 2025-08-01 | 2025-08-01 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | mega-dream-ex-box | 2025-11-28 | 2025-11-28 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | mega-symphonia-box | 2025-08-01 | 2025-08-01 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | munikis-zero-box | 2026-01-23 | 2026-01-23 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | ninja-spinner-box | 2026-03-13 | 2026-03-13 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | pokemon-center-fukuoka-special-box | 2025-07-11 | 2025-07-11 | 一致 | [公式](https://www.pokemoncenter-online.com/4521329431536.html) |
| pokemon | pokemon-center-hiroshima-special-box | 2025-07-04 | 2025-07-04 | 一致 | [公式](https://www.pokemoncenter-online.com/4521329427669.html) |
| pokemon | pokemon-center-tohoku-special-box | 2025-06-20 | 2025-06-20 | 一致 | [公式](https://www.pokemoncenter-online.com/4521329431277.html) |
| pokemon | premium-trainer-box-mega | 2025-08-01 | 2025-08-01 | 一致 | [公式](https://www.pokemoncenter-online.com/4521329374635.html) |
| pokemon | rocket-glory-box | 2025-04-18 | 2025-04-18 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | storm-emeralda-box | 2026-07-31 | 2026-07-31 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | super-electric-breaker-box | 2024-10-18 | 2024-10-18 | 一致 | [公式](https://www.pokemon-card.com/ex/sv8/index.html) |
| pokemon | terastal-festival-box | 2024-12-06 | 2024-12-06 | 一致 | [公式](https://www.pokemon-card.com/ex/sv8a/index.html) |
| pokemon | white-flare-box | 2025-06-06 | 2025-06-06 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |
| pokemon | white-flare-deluxe-box | 2025-06-06 | 2025-06-06 | 一致 | [公式](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=17&dateUpperM=8&dateUpperY=2026&productType=expansion) |


## 8. 旧商品画像27件：読み取り専用監査

非公開の変更前バックアップ28件からパック画像3件を除外し、再試行の2件を加えた27商品IDを照合。全27件でimageEnabled=true／imageAssetあり／source=valuecommerce。画像URLはYahoo商品画像ホスト、クリックURLはValueCommerce referralで保存されている。保存時画像から22件はURL不変、5件は定期取得で更新。26件は現マスタとタイトル上の同一性を通過、ブラックボルト1件はデラックス版として不一致。
URL不変22件は過去の目視確認証拠を再利用。更新された5件のうちブラックボルトは不適切と確定し、残る4件はタイトル・シリーズ一致まで確認。新しい写真内容の目視再確認は第2段階へ明示して引き継ぐ。今回画像の取得・保存・表示コンポーネント変更はしていない。

| 商品ID | 提供元 | 有効・保存 | 保存時URLとの一致 | 名称／仕様 | 現在の画像タイトル |
| --- | --- | --- | --- | --- | --- |
| dragonball-fb01 | valuecommerce | 有効・あり | 不変 | 一致 | 【テープ付き新品未開封】ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック 覚醒の鼓動 FB01 BOX ボックス |
| dragonball-fb02 | valuecommerce | 有効・あり | 不変 | 一致 | ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック 烈火の闘気 FB02 BOX (24パック入り) 正規テープ付き 完全未開封BOX |
| dragonball-fb04 | valuecommerce | 有効・あり | 不変 | 一致 | バンダイ BANDAI ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック 限界を超えし者FB04BOX24パック入り |
| dragonball-fb05 | valuecommerce | 有効・あり | 不変 | 一致 | バンダイBANDAI ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック 未知なる冒険FB05 BOX24パック入り 対 |
| dragonball-fb06 | valuecommerce | 有効・あり | 不変 | 一致 | 【新品】【トレカBOX】(FB06)ドラゴンボールスーパーCG フュージョンワールド ブースター 迫り来る脅威[在庫品] |
| dragonball-fb07 | valuecommerce | 有効・あり | 不変 | 一致 | バンダイ(BANDAI) ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック 神龍への願い[FB07] (BOX)24パック入り |
| dragonball-fb08 | valuecommerce | 有効・あり | 不変 | 一致 | バンダイBANDAI ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック 誇り高き戦闘民族FB08 BOX24パック入り |
| dragonball-fb10 | valuecommerce | 有効・あり | 更新あり | 一致 | 【未開封BOX】【新品】 ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック CROSS FORCE FB10 BOX 佐賀 |
| dragonball-fb12 | valuecommerce | 有効・あり | 不変 | 一致 | 【予約商品】【テープ付き未開封品】ドラゴンボールスーパーカードゲーム フュージョンワールド ブースターパック『REACH THE GOD』FB12 BOX |
| onepiece-eb03 | valuecommerce | 有効・あり | 更新あり | 一致 | 『新品未開封』ONE PIECE(ワンピース)カードゲーム エクストラブースター ONE PIECE Heroines Edition EB-03 [BOX] |
| onepiece-eb04 | valuecommerce | 有効・あり | 不変 | 一致 | ONE PIECE カードゲーム エクストラブースター EGGHEAD CRISIS【EB-04】 1BOX |
| onepiece-op10 | valuecommerce | 有効・あり | 不変 | 一致 | 新品未開封　テープ付　ワンピースカードゲーム ブースターパック 王族の血統【OP-10】  バンダイ BANDAI　1BOX |
| onepiece-op11 | valuecommerce | 有効・あり | 不変 | 一致 | ONE PIECEカードゲーム 神速の拳【OP-11】/BOX◆新品Ss |
| onepiece-op12 | valuecommerce | 有効・あり | 不変 | 一致 | ワンピース カードゲーム 師弟の絆 BOX ONE PIECE OP-12 バンダイ BANDAI 新品未開封 |
| onepiece-op13 | valuecommerce | 有効・あり | 更新あり | 一致 | 新品未開封 受け継がれる意志 OP-13 ONE PIECE カードゲーム ワンピース ボックス バンダイ BANDAI |
| onepiece-op14 | valuecommerce | 有効・あり | 更新あり | 一致 | 【BOX】ONE PIECE カードゲーム ブースターパック 蒼海の七傑 OP-14 BOX ｜ 未開封 ワンピース バンダイ ワンピースカード |
| onepiece-prb01 | valuecommerce | 有効・あり | 不変 | 一致 | ワンピースカードゲーム プレミアムブースター ONE PIECE CARD THE BEST【PRB-01】(BOX)10パック入 レーディングカード BANDAI 送料無料 新品 未開封品 |
| onepiece-prb02 | valuecommerce | 有効・あり | 不変 | 一致 | ONE PIECEカードゲーム プレミアムブースター ONE PIECE CARD THE BEST vol.2【PRB-02】 【未開封1BOX】 |
| 30th-celebration-premium-deck-set-espeon-umbreon | valuecommerce | 有効・あり | 不変 | 一致 | ポケモンカードゲーム MEGA 30th CELEBRATION プレミアムデッキセット エーフィ・ブラッキー |
| battle-partners-box | valuecommerce | 有効・あり | 不変 | 一致 | 『新品』ポケモンカードゲームS&V 拡張パック バトルパートナーズ BOX ※シュリンク付き |
| black-bolt-box | valuecommerce | 有効・あり | 更新あり | 不一致：異なる商品仕様を検出 | 『新品』ポケモンカード S&V 拡張パックデラックス ブラックボルト BOX ※シュリンク付き |
| inferno-x-box | valuecommerce | 有効・あり | 不変 | 一致 | ポケモンカードゲーム MEGA 拡張パック インフェルノX BOX 【シュリンク付き未開封品】 |
| super-electric-breaker-box | valuecommerce | 有効・あり | 不変 | 一致 | ポケモンカードゲーム 超電ブレイカー BOX スカーレット&バイオレット 拡張パック 新品未開封 シュリンク付き |
| terastal-festival-box | valuecommerce | 有効・あり | 不変 | 一致 | シュリンク包装 ポケモンカードゲーム スカーレット&バイオレット ハイクラスパック テラスタルフェスex BOX |
| white-flare-box | valuecommerce | 有効・あり | 不変 | 一致 | 【シュリンクなし】ポケモンカードゲーム ホワイトフレア BOX 拡張パック |
| onepiece-eb02 | valuecommerce | 有効・あり | 不変 | 一致 | BOX テープ付き未開封 ONE PIECEカードゲーム エクストラブースター Anime 25th collection　EB-02 |
| onepiece-op09 | valuecommerce | 有効・あり | 不変 | 一致 | 『新品未開封』ONE PIECE(ワンピース)カードゲーム 新たなる皇帝 OP-09 [BOX] |

以前取り消したブラックボルトデラックス／ホワイトフレアデラックス／EB-05のパック写真は今回の27件に数えない。EB-05の画像は未確認のままでも価格へ予約値を書かない。FB12の発売前画像取得と価格は分離され、現在も本番価格・ranking・履歴を新規作成していない。

## 9. tests / lint / typecheck / build / Actions / Preview

- PR #41のコードで256 tests成功（PR #42の共有画像表示6 testsは含まない）。node --import tsx --test lib/*.test.tsで実行。
- npm run lint成功、npx tsc --noEmit成功、npm run build -- --webpack成功。ローカルビルドは環境資格情報を取り出さず実行しており、本番DB接続の実動作確認は上記SELECT・公開ページ確認で分けて実施。
- アプリケーションコードSHA 0415409 の既存Actions [37802287021](https://github.com/premieryo/premium-hub/actions/runs/37802287021) successを今回再確認。通常CIのnpm ci/test/lint/buildが成功。
- 同SHAの既存Vercel [Preview](https://premium-nm0srztvn-premium-hub.vercel.app) / deployment dpl_B6SU6Sh9L9sV4u4EPJMU2BkkXtGh はREADYを今回再確認。/pokemon・/onepieceはGET 200。
- 本文書コミット後の最新ActionsとPreviewはコミットのチェック欄を参照。アプリケーションコードは変更なし。CI完了を確認せず成功扱いにはしない。
- 過去の390px・25ページ成功という報告は保持。ただし今回の作業環境に元の25ページ検証ファイルはなく、本監査の新しいスマホ確認証拠とは扱わない。画像共通表示の最新スマホ再確認はPR #42の第2段階で実施。

## 10. 未完了事項・次作業への引き継ぎ

1. **本番ブラックボルトの再混入を解消**：通常版の安全な新規Yahoo候補を取得。現在26,500円・URL末尾4521329427300.html・該当時刻が変わっていないことを条件に、商品・ランキング・対象履歴1件をバックアップして限定修復。正しい29,400円の過去履歴は保持。別仕様画像の修復は画像担当範囲を確認して別変更として扱う。
2. **30th CELEBRATIONの不適切出品を修復**：現在27,499円・mkrj/4521329462424.html。安全な未開封1BOXを新規確認し、履歴も対象限定で整合させる。旧27500円を現在値と推測して適用しない。
3. **メガ2件の比較基準・履歴を整理**：再更新禁止のため今回未変更。現在値を維持したまま、不適切な過去値の隔離と比較基準の扱いを別途決定する。
4. **現在の在庫未確認4件**：メガブレイブ／メガシンフォニア／ムニキスゼロ／ストームエメラルダ。販売店JSON-LDにavailabilityがなく在庫切れとは断定できない。価格を再保存する前に新規API等で在庫を確認する。
5. **ST01過去13,500円**：当時の候補条件を確認。現在10,980円の正しい候補・履歴は変更しない。
6. **本番への対策適用方針**：旧コードの定期取得が別仕様等を再混入させ得る。今回の本番デプロイ禁止・マージ禁止を維持したため未適用。後続の承認済みリリース計画と、修復後の再取得確認を揃える。
7. **画像の残件**：更新された4画像の目視再確認と、不適切なブラックボルト画像の解消。画像共通表示の改修・スマホ検証はPR #42へ分離。

**第2段階へは進めない。** コードのテスト成功だけで本番データ品質を合格にしない。上記の確定不整合と未確認事項を解消した後に、PR #41を再判定する。PR #41・#42は未マージ、本番デプロイなし。
