"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import { useLanguage } from "../../components/LanguageProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Bid = {
  bidId: number;
  lotId: number;
  millUserId: number;
  bidPricePerKg: number;
  status: string;
};

export default function FarmerBidsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const si = language === "si";
  const text = si
    ? { title: "මගේ මිල ගණන්", subtitle: "ඔබේ වී තොග සඳහා මෝල්වලින් ලැබුණු මිල ගණන්.", empty: "තවමත් මිල ගණනක් ලැබී නැත.", loading: "පූරණය වෙමින්...", error: "මිල ගණන් ලබාගැනීමට නොහැකි විය.", back: "පුවරුව වෙත", lot: "වී තොගය", mill: "මෝල", offer: "මිල", details: "විස්තර බලන්න" }
    : { title: "My Offers", subtitle: "Offers received from mills for your paddy lots.", empty: "No offers have been received yet.", loading: "Loading...", error: "Unable to load offers.", back: "Back to Dashboard", lot: "Paddy Lot", mill: "Mill", offer: "Offer", details: "View Details" };

  useEffect(() => {
    const token = localStorage.getItem("vee-market-token") || localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetch(`${API_URL}/api/farmer/bids`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || text.error);
        setBids(await response.json());
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : text.error))
      .finally(() => setLoading(false));
  }, [router, text.error]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="font-bold text-emerald-700 dark:text-emerald-400">Vee Market</Link>
          <div className="flex items-center gap-2"><LanguageSwitcher /><ThemeSwitcher /></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <Link href="/dashboard" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">← {text.back}</Link>
        <h1 className="mt-6 text-3xl font-bold">{text.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{text.subtitle}</p>
        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
        {loading ? <p className="mt-8 text-slate-500 dark:text-slate-400">{text.loading}</p> : bids.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><p className="font-semibold">{text.empty}</p></div> : <div className="mt-8 grid gap-4 md:grid-cols-2">{bids.map((bid) => <article key={bid.bidId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{text.lot} #{bid.lotId}</p><h2 className="mt-1 text-xl font-bold">{text.mill} #{bid.millUserId}</h2></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">{bid.status}</span></div><p className="mt-6 text-2xl font-bold text-emerald-700 dark:text-emerald-400">LKR {bid.bidPricePerKg} / kg</p><Link href={`/dashboard/listings/${bid.lotId}`} className="mt-6 inline-flex rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700">{text.details}</Link></article>)}</div>}
      </div>
    </main>
  );
}
