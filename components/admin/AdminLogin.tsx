"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin({ unauthorized = false }: { unauthorized?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(unauthorized ? "このユーザーには管理者権限がありません。" : "");
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("メールアドレスまたはパスワードを確認してください。");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <p className="text-sm font-bold text-blue-400">PREMIUM HUB ADMIN</p>
        <h1 className="mt-2 text-3xl font-black">管理者ログイン</h1>
        <p className="mt-2 text-sm text-slate-400">登録済みの管理者アカウントでログインしてください。</p>
        {error && <p className="mt-5 rounded-xl bg-red-950 p-3 text-sm text-red-200" role="alert">{error}</p>}
        <label className="mt-6 block text-sm font-bold text-slate-300">メールアドレス<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-base" /></label>
        <label className="mt-4 block text-sm font-bold text-slate-300">パスワード<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-base" /></label>
        <button disabled={loading} className="mt-7 min-h-14 w-full rounded-xl bg-blue-600 text-lg font-black disabled:opacity-50">{loading ? "ログイン中..." : "ログイン"}</button>
      </form>
    </main>
  );
}
