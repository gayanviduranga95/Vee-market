"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";
import { Button, StatusBadge, EmptyState, ErrorBanner } from "../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type PaddyLot = {
  id: number;
  productType?: string;
  riceType?: string;
  quantityKg?: number;
  askingPricePerKg?: number;
  availableDate?: string;
  status?: string;
  createdAt?: string;
};

export default function ListingsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [lots, setLots] = useState<PaddyLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "SOLD">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const t = useMemo(
    () => ({
      title: isSinhala ? "මගේ වී තොග" : "My Paddy Lots",
      subtitle: isSinhala
        ? "ඔබ වෙළඳපොළට එකතු කළ සියලුම වී තොග, ඒවායේ තත්ත්වයන් සහ මිල ගණන් මෙතැනින් බලන්න."
        : "Manage your paddy lots, inspect moisture test status, and review buyer offers.",
      backDashboard: isSinhala ? "← පුවරුව වෙත" : "← Back to Dashboard",
      addLot: isSinhala ? "+ නව වී තොගයක් එකතු කරන්න" : "+ Add Paddy Lot",
      filters: {
        all: isSinhala ? "සියල්ල" : "All",
        active: isSinhala ? "සක්‍රීය" : "Active",
        sold: isSinhala ? "විකුණා ඇත" : "Sold",
      },
      searchPlaceholder: isSinhala
        ? "වී වර්ගය අනුව සොයන්න (නාඩු, සම්බා...)"
        : "Search by rice type (Nadu, Samba...)",
      quantity: isSinhala ? "ප්‍රමාණය" : "Quantity",
      askingPrice: isSinhala ? "ඉල්ලුම් මිල" : "Asking Price",
      availableDate: isSinhala ? "ලබාගත හැකි දිනය" : "Available Date",
      viewDetails: isSinhala ? "තොග විස්තර සහ මිල ගණන් බලන්න →" : "View Details & Offers →",
      noLotsTitle: isSinhala ? "තවමත් වී තොග නොමැත" : "No Paddy Lots Found",
      noLotsDesc: isSinhala
        ? "ඔබේ පළමු වී තොගය එකතු කර සහල් මෝල් වෙතින් ලංසු ලබාගැනීම ආරම්භ කරන්න."
        : "Add your first paddy lot to start receiving bids from verified rice mills.",
      noMatchDesc: isSinhala
        ? "ඔබ සෙවූ නමට අදාළ වී තොග හමු නොවීය."
        : "No paddy lots matched your search query.",
      loadingText: isSinhala ? "වී තොග ලබාගනිමින්..." : "Loading paddy lots...",
      errorText: isSinhala ? "වී තොග ලබාගැනීමට නොහැකි විය." : "Unable to load your paddy lots.",
      kg: "kg",
      rsPerKg: isSinhala ? "රු. / kg" : "LKR / kg",
    }),
    [isSinhala]
  );

  async function loadLots() {
    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/farmer/lots`, {
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
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || t.errorText);
      }

      const data = await res.json();
      setLots(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error("Load lots error:", err);
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      // Filter by status
      if (filter === "ACTIVE") {
        if (lot.status && lot.status.toUpperCase() !== "ACTIVE") return false;
      } else if (filter === "SOLD") {
        if (!lot.status || lot.status.toUpperCase() !== "SOLD") return false;
      }

      // Filter by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const type = (lot.riceType || lot.productType || "").toLowerCase();
        const id = String(lot.id);
        if (!type.includes(q) && !id.includes(q)) return false;
      }

      return true;
    });
  }, [lots, filter, searchQuery]);

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "වී තොග" : "My Lots"} roleType="FARMER" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
        {/* TOP BAR / NAVIGATION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              {t.backDashboard}
            </Link>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          <Link href="/dashboard/listings/new">
            <Button variant="primary" size="lg" className="w-full sm:w-auto font-extrabold shadow-sm">
              {t.addLot}
            </Button>
          </Link>
        </div>

        {error && <ErrorBanner message={error} onRetry={loadLots} />}

        {/* CONTROLS: FILTER TABS & SEARCH INPUT */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {(["ALL", "ACTIVE", "SOLD"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition select-none ${
                  filter === mode
                    ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {mode === "ALL"
                  ? `${t.filters.all} (${lots.length})`
                  : mode === "ACTIVE"
                  ? `${t.filters.active} (${
                      lots.filter(
                        (l) => !l.status || l.status.toUpperCase() === "ACTIVE"
                      ).length
                    })`
                  : `${t.filters.sold} (${
                      lots.filter(
                        (l) => l.status && l.status.toUpperCase() === "SOLD"
                      ).length
                    })`}
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* LOTS DISPLAY: RESPONSIVE CARDS */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold">{t.loadingText}</p>
          </div>
        ) : filteredLots.length === 0 ? (
          <EmptyState
            title={t.noLotsTitle}
            description={searchQuery ? t.noMatchDesc : t.noLotsDesc}
            actionLabel={searchQuery ? undefined : t.addLot}
            onAction={
              searchQuery
                ? undefined
                : () => router.push("/dashboard/listings/new")
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLots.map((lot) => (
              <article
                key={lot.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Lot #{lot.id}
                      </span>
                      <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
                        {lot.riceType || lot.productType || "Paddy"}
                      </h2>
                    </div>
                    <StatusBadge status={lot.status || "ACTIVE"} size="md" />
                  </div>

                  {/* KEY METRICS */}
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/60">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400">
                        {t.quantity}
                      </p>
                      <p className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-white">
                        {lot.quantityKg?.toLocaleString()} {t.kg}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400">
                        {t.askingPrice}
                      </p>
                      <p className="mt-0.5 text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                        LKR {lot.askingPricePerKg}
                      </p>
                    </div>
                  </div>

                  {lot.availableDate && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      📅 {t.availableDate}:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {lot.availableDate}
                      </span>
                    </p>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link href={`/dashboard/listings/${lot.id}`}>
                    <Button variant="secondary" size="md" fullWidth>
                      {t.viewDetails}
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