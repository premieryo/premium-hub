import type { Metadata } from "next";
import Link from "next/link";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import TopNavigation from "@/components/TopNavigation";
import { genres, type LotteryItem } from "@/data/types";
import { getGenreContext } from "@/lib/genres";
import { getLotteryStatus, lotteryStatuses } from "@/lib/lottery-status";

export const metadata: Metadata = {
  title: "今日の抽選情報｜締切・応募受付中｜プレミア速報",
  description: "今日締切・応募受付中の抽選と、抽選結果発表予定をトレカ・ホビーの各ジャンルからまとめて確認できます。",
  alternates: { canonical: "/today" },
};

export const dynamic = "force-dynamic";

const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });
function isToday(item: LotteryItem, key: string) {
  if (item.deadlineAt) { const deadline = new Date(item.deadlineAt); return !Number.isNaN(deadline.getTime()) && dayFormatter.format(deadline) === key; }
  return /本日|今日/.test(item.deadline);
}
function resultDateKey(value?: string) {
  if (!value) return null;
  const match=value.match(/(?:2026年)?(\d{1,2})月(\d{1,2})日/);
  if (!match) return null;
  return `2026-${match[1].padStart(2,"0")}-${match[2].padStart(2,"0")}`;
}
function sortByDeadline<T extends LotteryItem>(items: T[]) {
  return items.sort((a,b)=>(a.deadlineAt?Date.parse(a.deadlineAt):Number.MAX_SAFE_INTEGER)-(b.deadlineAt?Date.parse(b.deadlineAt):Number.MAX_SAFE_INTEGER));
}
export default async function Today() {
  const contexts=(await Promise.all(genres.map((genre)=>getGenreContext(genre)))).flatMap((context)=>context?[context]:[]);
  const now=new Date(); const todayKey=dayFormatter.format(now);
  const all=contextes(contexts);
  const todayLotteries=sortByDeadline(all.filter((item)=>isToday(item,todayKey)));
  const acceptingLotteries=sortByDeadline(all.filter((item)=>{const s=getLotteryStatus(item,now);return s===lotteryStatuses.accepting||s===lotteryStatuses.closingSoon}));
  const resultSchedule=all.map(item=>({item,key:resultDateKey(item.resultDate)})).filter((row):row is {item:typeof all[number];key:string}=>Boolean(row.key)&&row.key>=todayKey).sort((a,b)=>a.key.localeCompare(b.key));
  const resultDays=[...new Set(resultSchedule.map(row=>row.key))].slice(0,14);
  return <main className="min-h-screen bg-[#050b18] text-white"><div className="mx-auto max-w-5xl px-4 py-6 sm:px-6"><TopNavigation/><div className="mt-5"><AffiliateDisclosure/></div>
    <header className="mt-8"><p className="text-xs font-black tracking-[.2em] text-blue-400">TODAY&apos;S LOTTERY</p><h1 className="mt-2 text-3xl font-black">今日の注目</h1><p className="mt-3 text-slate-300">今日締切の抽選と、いま応募できる抽選だけをまとめています。</p></header>
    <div className="mt-8 grid grid-cols-2 gap-3"><Summary label="今日締切の抽選" value={todayLotteries.length}/><Summary label="応募受付中の抽選" value={acceptingLotteries.length}/></div>
    <LotterySection title="今日締切の抽選" items={todayLotteries} empty="現在、今日締切として確認できる抽選はありません。"/>
    <LotterySection title="応募受付中の抽選" items={acceptingLotteries} empty="現在、応募受付中として確認できる抽選はありません。"/>
    <ResultCalendar days={resultDays} schedule={resultSchedule}/>
  </div></main>;
}
function contextes(contexts: Awaited<ReturnType<typeof getGenreContext>>[]) {
  return contexts.flatMap((context)=>context?context.data.lottery.map((item)=>({...item,genreName:context.config.name,genreSlug:context.config.slug})):[]);
}
function Summary({label,value}:{label:string;value:number}) { return <Link href="/lottery" className="rounded-2xl border border-blue-400/25 bg-[#09152c] p-4 sm:p-5"><div className="flex justify-between gap-2"><span className="text-xs font-bold text-slate-300 sm:text-base">{label}</span><span className="text-blue-400">◎</span></div><p className="mt-4 text-3xl font-black text-sky-300 sm:text-4xl">{value}<span className="ml-1 text-sm text-slate-400">件</span></p></Link>; }
function LotterySection({title,items,empty}:{title:string;items:ReturnType<typeof contextes>;empty:string}) { return <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.16em] text-orange-300">LOTTERY</p><h2 className="mt-1 text-2xl font-black">{title}</h2></div><Link href="/lottery" className="text-sm font-bold text-blue-300">すべて見る →</Link></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{items.length===0?<p className="rounded-2xl border border-slate-800 bg-[#09152c] p-5 text-sm text-slate-400 sm:col-span-2">{empty}</p>:items.slice(0,8).map((item)=><Link key={`${item.genreSlug}-${item.id}`} href={`/${item.genreSlug}/lottery`} className="rounded-2xl border border-orange-400/20 bg-[#09152c] p-5 transition hover:border-orange-300"><div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-orange-400/10 px-2 py-1 text-orange-200">{item.genreName}</span><span className="text-slate-400">{item.shop}</span></div><h3 className="mt-3 font-black leading-6">{item.product}</h3><p className="mt-3 text-sm font-bold text-orange-200">締切：{item.deadline}</p><p className="mt-2 text-xs text-slate-500">{getLotteryStatus(item)}</p></Link>)}</div></section>; }

function ResultCalendar({days,schedule}:{days:string[];schedule:{item:ReturnType<typeof contextes>[number];key:string}[]}) { return <section className="mt-10 pb-8"><div><p className="text-xs font-black tracking-[.16em] text-violet-300">RESULT CALENDAR</p><h2 className="mt-1 text-2xl font-black">抽選結果発表予定表</h2><p className="mt-2 text-sm text-slate-400">掲載中の抽選から、結果発表予定日が確認できるものをまとめています。</p></div>{days.length===0?<p className="mt-4 rounded-2xl border border-slate-800 bg-[#09152c] p-5 text-sm text-slate-400">現在、結果発表予定を確認できる抽選はありません。</p>:<div className="mt-4 overflow-hidden rounded-2xl border border-violet-400/20 bg-[#09152c]">{days.map(day=>{const items=schedule.filter(row=>row.key===day).map(row=>row.item);const [,month,date]=day.split("-");return <div key={day} className="grid grid-cols-[4.5rem_1fr] border-b border-slate-800 last:border-0"><div className="bg-violet-500/10 p-4 text-center"><p className="text-xs font-bold text-violet-300">{Number(month)}月</p><p className="text-2xl font-black">{Number(date)}</p></div><div className="divide-y divide-slate-800">{items.map(item=><Link key={`${item.genreSlug}-${item.id}`} href={`/${item.genreSlug}/lottery`} className="block p-4 transition hover:bg-white/5"><p className="text-xs font-bold text-blue-300">{item.genreName}・{item.shop}</p><p className="mt-1 text-sm font-black leading-5">{item.product}</p><p className="mt-1 text-xs text-slate-400">{item.resultDate}</p></Link>)}</div></div>})}</div>}</section>; }
