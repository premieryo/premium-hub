export default function EmptyState({ message = "現在情報はありません" }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
      {message}
    </div>
  );
}
