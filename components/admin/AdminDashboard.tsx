"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { genreConfigs } from "@/data/genre-config";
import { genres, type Genre } from "@/data/types";
import {
  adminResourceConfig,
  adminResources,
  type AdminItem,
  type AdminResource,
} from "@/lib/admin-data";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const router = useRouter();
  const [genre, setGenre] = useState<Genre>("pokemon");
  const [resource, setResource] = useState<AdminResource>("products");
  const [items, setItems] = useState<AdminItem[]>([]);
  const [editing, setEditing] = useState<AdminItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/${genre}/${resource}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "読み込みに失敗しました。");
      setItems(body);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "読み込みに失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [genre, resource]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/${genre}/${resource}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "読み込みに失敗しました。");
        if (!cancelled) setItems(body);
      })
      .catch((error: unknown) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "読み込みに失敗しました。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [genre, resource]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(item: AdminItem) {
    setEditing(item);
    setShowForm(true);
  }

  async function logout() {
    await createClient().auth.signOut();
    router.refresh();
  }

  async function remove(item: AdminItem) {
    const label = String(item.name ?? item.product ?? item.id);
    if (!window.confirm(`「${label}」を削除しますか？\nこの操作は元に戻せません。`)) return;
    const response = await fetch(`/api/admin/${genre}/${resource}?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error ?? "削除に失敗しました。");
    setMessage("削除しました。");
    await loadItems();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-28 pt-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-bold text-blue-400">PREMIUM HUB ADMIN</p>
          <h1 className="mt-1 text-3xl font-black">管理画面</h1>
          <p className="mt-2 text-sm text-slate-400">Supabaseへ安全に保存します。</p></div>
          <button onClick={() => void logout()} className="min-h-11 shrink-0 rounded-xl border border-slate-700 px-3 text-sm font-bold text-slate-300">ログアウト</button>
        </header>

        <section className="mt-6 grid gap-4 rounded-2xl bg-slate-900 p-4 sm:grid-cols-2">
          <Select label="ジャンル" value={genre} onChange={(value) => { setLoading(true); setMessage(""); setGenre(value as Genre); }} options={genres.map((value) => ({ value, label: `${genreConfigs[value].icon} ${genreConfigs[value].name}` }))} />
          <Select label="管理項目" value={resource} onChange={(value) => { setLoading(true); setMessage(""); setResource(value as AdminResource); }} options={adminResources.map((value) => ({ value, label: adminResourceConfig[value].label }))} />
        </section>

        {message && <p className="mt-4 rounded-xl bg-slate-800 px-4 py-3 text-sm text-amber-200" role="status">{message}</p>}

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{genreConfigs[genre].name}・{adminResourceConfig[resource].label}</h2>
          <span className="text-sm text-slate-400">{items.length}件</span>
        </div>

        <section className="mt-4 space-y-3">
          {loading ? <Status text="読み込み中..." /> : items.length === 0 ? <Status text="現在情報はありません" /> : items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <p className="break-words text-xs text-slate-500">{item.id}</p>
              <h3 className="mt-1 break-words text-lg font-bold">{String(item.name ?? item.product ?? item.id)}</h3>
              <p className="mt-1 break-words text-sm text-slate-300">{String(item.shop ?? item.status ?? item.searchWord ?? "")}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => openEdit(item)} className="min-h-12 rounded-xl bg-blue-600 px-4 font-bold hover:bg-blue-500">編集</button>
                <button onClick={() => void remove(item)} className="min-h-12 rounded-xl border border-red-500/50 px-4 font-bold text-red-300 hover:bg-red-500/10">削除</button>
              </div>
            </article>
          ))}
        </section>
      </div>

      <button onClick={openCreate} className="fixed bottom-5 right-5 min-h-14 rounded-full bg-blue-600 px-6 text-base font-black shadow-xl shadow-blue-950 hover:bg-blue-500 sm:right-8">＋ 追加</button>

      {showForm && <AdminForm genre={genre} resource={resource} item={editing} onClose={() => setShowForm(false)} onSaved={async () => { setShowForm(false); setMessage(editing ? "更新しました。" : "追加しました。"); await loadItems(); }} />}
    </main>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="block text-sm font-bold text-slate-300">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-base text-white">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function Status({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">{text}</div>;
}

function AdminForm({ genre, resource, item, onClose, onSaved }: { genre: Genre; resource: AdminResource; item: AdminItem | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...Object.fromEntries(Object.entries(item ?? {}).map(([key, value]) => [key, String(value)])),
    ...Object.fromEntries(adminResourceConfig[resource].fields.map((field) => [field.name, item?.[field.name] === undefined ? "" : String(item[field.name])])),
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/${genre}/${resource}`, {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item ? { originalId: item.id, item: values } : values),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "保存に失敗しました。");
      await onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 sm:p-8" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="mx-auto max-w-xl rounded-2xl bg-slate-900 p-5 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-black">{item ? "編集" : "新規追加"}</h2><button type="button" onClick={onClose} className="min-h-11 rounded-lg px-3 text-slate-300">閉じる</button></div>
        {error && <p className="mt-4 rounded-xl bg-red-950 p-3 text-sm text-red-200">{error}</p>}
        <div className="mt-5 space-y-4">
          {adminResourceConfig[resource].fields.map((field) => <label key={field.name} className="block text-sm font-bold text-slate-300">{field.label}{field.required && <span className="text-red-400"> *</span>}{field.type === "select" ? <select required={field.required} value={values[field.name]} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-base text-white"><option value="">選択してください</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input required={field.required} type={field.type ?? "text"} min={field.type === "number" && !["changeAmount", "changeRate"].includes(field.name) ? "0" : undefined} step={field.type === "number" ? "any" : undefined} value={values[field.name]} placeholder={field.placeholder} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-base text-white placeholder:text-slate-600" />}</label>)}
        </div>
        <button disabled={saving} className="mt-7 min-h-14 w-full rounded-xl bg-blue-600 text-lg font-black disabled:opacity-50">{saving ? "保存中..." : "保存する"}</button>
      </form>
    </div>
  );
}
