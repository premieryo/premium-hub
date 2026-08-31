import assert from "node:assert/strict";
import test from "node:test";
import { buildYahooItemSearchUrl } from "./api/yahoo";

function baseParams() {
  return new URLSearchParams({
    appid: "test-client-id",
    query: "ロケット団の栄光 BOX",
    results: "50",
    sort: "-score",
    condition: "new",
    in_stock: "true",
  });
}

function build(
  affiliate: { sid?: string; pid?: string },
  warnings: string[] = [],
) {
  return new URL(buildYahooItemSearchUrl(
    baseParams(),
    affiliate,
    (message) => warnings.push(message),
  ));
}

test("正常なsid/pidでValueCommerceパラメータを追加する", () => {
  const url = build({ sid: "3779439", pid: "892689435" });
  assert.equal(url.searchParams.get("affiliate_type"), "vc");
  assert.equal(url.searchParams.get("affiliate_id"),
    "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3779439&pid=892689435&vc_url=");
});

test("sid/pidが両方未設定なら警告なしで通常検索へフォールバックする", () => {
  const warnings: string[] = [];
  const url = build({}, warnings);
  assert.equal(url.searchParams.has("affiliate_type"), false);
  assert.equal(url.searchParams.has("affiliate_id"), false);
  assert.deepEqual(warnings, []);
});

test("sidのみなら警告して通常検索へフォールバックする", () => {
  const warnings: string[] = [];
  const url = build({ sid: "3779439" }, warnings);
  assert.equal(url.searchParams.has("affiliate_type"), false);
  assert.equal(url.searchParams.has("affiliate_id"), false);
  assert.equal(warnings.length, 1);
});

test("pidのみなら警告して通常検索へフォールバックする", () => {
  const warnings: string[] = [];
  const url = build({ pid: "892689435" }, warnings);
  assert.equal(url.searchParams.has("affiliate_type"), false);
  assert.equal(url.searchParams.has("affiliate_id"), false);
  assert.equal(warnings.length, 1);
});

test("不正形式なら警告して通常検索へフォールバックする", () => {
  const warnings: string[] = [];
  const url = build({ sid: "3779x439", pid: "892689435" }, warnings);
  assert.equal(url.searchParams.has("affiliate_type"), false);
  assert.equal(url.searchParams.has("affiliate_id"), false);
  assert.equal(warnings.length, 1);
});

test("affiliate_idをURLSearchParamsで一度だけエンコードする", () => {
  const url = buildYahooItemSearchUrl(baseParams(),
    { sid: "3779439", pid: "892689435" });
  assert.match(url, /affiliate_id=https%3A%2F%2Fck\.jp\.ap\.valuecommerce\.com%2Fservlet%2Freferral%3Fsid%3D3779439%26pid%3D892689435%26vc_url%3D/);
  assert.doesNotMatch(url, /%253A|%252F|%253F|%253D/);
});

test("既存のYahoo検索パラメータを維持する", () => {
  const url = build({ sid: "3779439", pid: "892689435" });
  assert.equal(url.origin + url.pathname,
    "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch");
  assert.equal(url.searchParams.get("appid"), "test-client-id");
  assert.equal(url.searchParams.get("query"), "ロケット団の栄光 BOX");
  assert.equal(url.searchParams.get("results"), "50");
  assert.equal(url.searchParams.get("sort"), "-score");
  assert.equal(url.searchParams.get("condition"), "new");
  assert.equal(url.searchParams.get("in_stock"), "true");
});
