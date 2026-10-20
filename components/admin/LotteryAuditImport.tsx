"use client";
import { useState } from "react";
import type { AuditInput, AuditResult } from "@/lib/lottery-audit-import";
import { genreConfigs } from "@/data/genre-config";
import { genres } from "@/data/types";

type Preview = { results: AuditResult[]; fingerprint: string };
const empty: AuditInput = { genre: "pokemon", product: "", shop: "", applicationStart: "", deadlineAt: "", applicationType: "online", applicationConditions: "", officialUrl: "", applicationUrl: "", observedAt: "", evidence: "", evidenceKind: "official" };
const deadlineFormat = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "short", timeStyle: "short" });
const labels = { product: "商品名", shop: "販売店", applicationStart: "受付開始（JST・不明なら空欄）", deadlineAt: "締切（JST）", applicationConditions: "応募条件（条件なしの場合も公式確認の内容を入力）", officialUrl: "公式情報URL", applicationUrl: "応募URL（アプリは公式案内URL・店頭のみは空欄可）", observedAt: "確認日時（JST）", evidence: "確認根拠（公式の締切・応募方法・条件の要点）" };

export default function LotteryAuditImport({ enabled, onSaved }: { enabled: boolean; onSaved: () => Promise<void> }) {
  const [input, setInput] = useState<AuditInput>(empty);
  const [queue, setQueue] = useState<AuditInput[]>([]);
  const [json, setJson] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  function change(key: keyof AuditInput, value: string) { setInput(current => ({ ...current, [key]: value })); }
  function add() { setQueue(current => [...current, input]); setInput(empty); setPreview(null); setMessage("候補を入力一覧へ追加しました。まだ保存していません。"); }
  function importJson() {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!Array.isArray(parsed) || !parsed.length || parsed.length > 20) throw new Error("1〜20件のJSON配列を指定してください。");
      setQueue(parsed); setPreview(null); setMessage("JSONを読み込みました。検証してください。まだ保存していません。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "JSONが不正です。"); }
  }
  async function run(index?: number) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/lottery-audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: index === undefined ? "preview" : "save", candidates: queue, fingerprint: preview?.fingerprint, index }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "検証に失敗しました。");
      if (body.saved) { setQueue(current => current.filter((_, row) => row !== index)); setPreview(null); setMessage("承認待ちへ1件保存しました。公開していません。残りは再検証してください。"); await onSaved(); }
      else { setPreview(body); setMessage("保存予定と除外理由を確認してください。まだ保存していません。"); }
    } catch (error) { setPreview(null); setMessage(error instanceof Error ? error.message : "処理に失敗しました。"); }
    finally { setBusy(false); }
  }
  return <section aria-label="抽選監査の取り込み" className="mt-6 min-w-0 rounded-2xl border border-blue-500/30 bg-slate-900 p-4">
    <h2 className="text-xl font-bold">抽選監査結果を取り込む</h2>
    <p className="mt-2 text-sm text-slate-300">公式情報を確認した候補を検証し、差分を見てから承認待ちに保存します。自動公開しません。</p>
    {!enabled && <p className="mt-3 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">現在は検証専用です。非公開権限の適用・検証が終わるまで保存できません。</p>}
    <details className="mt-4" open><summary className="min-h-11 cursor-pointer py-2 font-bold">1件ずつ入力</summary>
      <div className="mt-3 grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">ジャンル<select aria-label="監査ジャンル" className="mt-1 min-h-12 w-full rounded-xl bg-slate-950 p-3" value={input.genre} onChange={event => change("genre", event.target.value)}>{genres.map(genre => <option key={genre} value={genre}>{genreConfigs[genre].name}</option>)}</select></label>
        <label className="text-sm font-bold">応募方法<select aria-label="監査応募方法" className="mt-1 min-h-12 w-full rounded-xl bg-slate-950 p-3" value={input.applicationType} onChange={event => change("applicationType", event.target.value)}>{Object.entries({ online: "Web応募", app: "アプリ応募", store: "店頭応募", both: "Web・店頭" }).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        {Object.entries(labels).map(([key, label]) => <label key={key} className={`min-w-0 text-sm font-bold ${["evidence", "applicationConditions"].includes(key) ? "sm:col-span-2" : ""}`}>{label}{["evidence", "applicationConditions"].includes(key) ? <textarea className="mt-1 min-h-24 w-full rounded-xl bg-slate-950 p-3 text-base font-normal" value={input[key as keyof AuditInput]} onChange={event => change(key as keyof AuditInput, event.target.value)} /> : <input type={["applicationStart", "deadlineAt", "observedAt"].includes(key) ? "datetime-local" : key.endsWith("Url") ? "url" : "text"} className="mt-1 min-h-12 w-full min-w-0 rounded-xl bg-slate-950 p-3 text-base font-normal" value={input[key as keyof AuditInput]} onChange={event => change(key as keyof AuditInput, event.target.value)} />}</label>)}
      </div><p className="mt-3 text-xs text-slate-400">日時・URLは推測せず、公式で確認できた値を入力してください。競合情報だけでは登録できません。</p>
      <button type="button" disabled={busy || queue.length >= 20} onClick={add} className="mt-3 min-h-12 w-full rounded-xl border border-blue-400 px-4 font-bold disabled:opacity-40">入力一覧へ追加（保存しない）</button>
    </details>
    <details className="mt-4"><summary className="min-h-11 cursor-pointer py-2 font-bold">JSON配列から読み込む</summary><p className="text-xs text-slate-400">項目名：genre, product, shop, applicationStart, deadlineAt, applicationType, applicationConditions, officialUrl, applicationUrl, observedAt, evidence, evidenceKind。evidenceKindは公式確認時のみofficial。日時はJSTまたはZ付きISO形式。</p><textarea aria-label="監査JSON" rows={7} className="mt-2 w-full rounded-xl bg-slate-950 p-3 text-base" value={json} onChange={event => setJson(event.target.value)} /><button type="button" disabled={busy} onClick={importJson} className="mt-2 min-h-12 w-full rounded-xl border border-slate-600">入力一覧をJSONで置き換える</button></details>
    <p className="mt-4 text-sm">入力一覧：{queue.length}件</p>
    {queue.length > 0 && <button type="button" disabled={busy} onClick={() => { setQueue([]); setPreview(null); }} className="min-h-11 text-sm text-slate-300 underline">入力一覧をクリア</button>}
    <button type="button" disabled={busy || !queue.length} onClick={() => void run()} className="mt-3 min-h-12 w-full rounded-xl bg-blue-600 font-bold disabled:opacity-40">{busy ? "処理中…" : "保存前に検証・差分を確認"}</button>
    {message && <p role="status" className="mt-3 break-words rounded-xl bg-slate-800 p-3 text-sm text-amber-200">{message}</p>}
    {preview && <div className="mt-4 space-y-3">{preview.results.map(row => <article key={row.index} className="min-w-0 rounded-xl border border-slate-700 p-3">
      <p className="text-xs font-bold text-blue-300">{row.priority} / {row.eligible ? "承認待ちに追加予定" : "登録対象外"}</p><h3 className="mt-1 break-words font-bold">{row.input.product || `入力${row.index + 1}`}</h3><p className="mt-1 break-words text-sm">{genreConfigs[row.input.genre]?.name ?? row.input.genre} / {row.input.shop} / 締切 {row.item?.deadlineAt ? `${deadlineFormat.format(new Date(String(row.item.deadlineAt)))} JST` : "未確認"}</p>
      {row.reasons.map(reason => <p key={reason} className="mt-2 break-words text-sm text-amber-200">{reason}</p>)}
      {row.matches.map(match => <div key={match.id} className="mt-2 break-words text-sm text-slate-300"><p>既存ID：{match.id} / {match.reason}</p><ul className="mt-1 space-y-1">{match.differences.map(diff => <li key={diff}>{diff}</li>)}</ul></div>)}
      {row.eligible && <><p className="mt-2 text-sm text-slate-300">既存情報の変更：なし → 新規の承認待ち1件。公式根拠・JST日時・応募条件を保存します。</p><details className="mt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm">保存予定の全項目</summary><pre className="whitespace-pre-wrap break-all text-xs text-slate-300">{JSON.stringify(row.item, null, 2)}</pre></details><button type="button" disabled={busy || !enabled} onClick={() => void run(row.index)} className="mt-3 min-h-12 w-full rounded-xl bg-amber-600 px-3 font-bold disabled:opacity-40">この候補を承認待ちへ保存</button></>}
    </article>)}</div>}
  </section>;
}
