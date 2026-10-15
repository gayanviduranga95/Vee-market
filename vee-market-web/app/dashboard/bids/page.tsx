"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";
import { Button, StatusBadge, EmptyState, ErrorBanner } from "../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Bid = {
  bidId: number;
  lotId: number;
  millUserId: number;
  bidPricePerKg: number;
  status: string;
  createdAt?: string;
};

export default function FarmerBidsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      title: isSinhala ? "ලැබුණු මිල ගණන් (Offers)" : "Received Offers",
      subtitle: isSinhala
        ? "ඔබේ සියලුම වී තොග සඳහා සහල් මෝල් හිමියන් ඉදිරිපත් කර ඇති මිල ගණන් සංසන්දනය කරන්න."
        : "Compare wholesale price bids submitted by certified rice mills across all your paddy lots.",
      back: isSinhala ? "← පුවරුව වෙත" : "← Back to Dashboard",
      emptyTitle: isSinhala ? "තවමත් මිල ගණන් ලැබී නැත" : "No Offers Received Yet",
      emptyDesc: isSinhala
        ? "මෝල් හිමියන් ඔබේ වී තොග නිරීක්ෂණය කර මිල ඉදිරිපත් කළ පසු මෙහි දිස්වනු ඇත."
        : "Offers submitted by rice mills will appear here. Make sure your paddy lots are active.",
      viewLotBtn: isSinhala ? "තොගය පරීක්ෂා කර පිළිගන්න →" : "Review & Accept on Lot →",
      mill: isSinhala ? "සහල් මෝල" : "Rice Mill",
      lot: isSinhala ? "වී තොගය" : "Paddy Lot",
      pricePerKg: isSinhala ? "ඉදිරිපත් කළ මිල" : "Offered Price",
      rsPerKg: isSinhala ? "රු. / kg" : "LKR / kg",
      loadingText: isSinhala ? "මිල ගණන් ලබාගනිමින්..." : "Loading incoming offers...",
      errorText: isSinhala ? "මිල ගණන් ලබාගැනීමට නොහැකි විය." : "Failed to load offers.",
    }),
    [isSinhala]
  );

  async function loadBids() {
    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/farmer/bids`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(t.errorText);
      }

      const data = await res.json();
      setBids(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load farmer bids error:", err);
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "මිල ගණන්" : "Offers"} roleType="FARMER" />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {t.back}
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        {error && <ErrorBanner message={error} onRetry={loadBids} />}

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold">{t.loadingText}</p>
          </div>
        ) : bids.length === 0 ? (
          <EmptyState
            title={t.emptyTitle}
            description={t.emptyDesc}
            icon="🤝"
            actionLabel={isSinhala ? "මගේ වී තොග බලන්න" : "Check My Paddy Lots"}
            onAction={() => router.push("/dashboard/listings")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bids.map((bid) => (
              <article
                key={bid.bidId}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {t.lot} #{bid.lotId}
                      </span>
                      <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
                        {t.mill} #{bid.millUserId}
                      </h2>
                    </div>
                    <StatusBadge status={bid.status || "PENDING"} size="md" />
                  </div>

                  <div className="mt-4 rounded-2xl bg-emerald-50/70 p-4 dark:bg-emerald-950/40">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {t.pricePerKg}
                    </p>
                    <p className="mt-1 text-3xl font-black text-emerald-700 dark:text-emerald-400">
                      LKR {bid.bidPricePerKg}
                      <span className="text-xs font-semibold text-slate-500 ml-1">/ kg</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Link href={`/dashboard/listings/${bid.lotId}`}>
                    <Button variant="primary" size="md" fullWidth className="font-bold">
                      {t.viewLotBtn}
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
