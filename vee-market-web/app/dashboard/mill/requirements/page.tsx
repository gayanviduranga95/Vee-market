"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../components/LanguageProvider";
import VeeHeader from "../../../components/VeeHeader";
import { Button, StatusBadge, EmptyState, ErrorBanner } from "../../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Requirement = {
  id: number;
  riceType: string;
  quantityKg: number;
  frequency: string;
};

type MillOffer = {
  id: number;
  requirementId: number;
  millName: string;
  pricePerKg: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
};

export default function MillRequirementsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [myOffers, setMyOffers] = useState<MillOffer[]>([]);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const t = useMemo(
    () => ({
      title: isSinhala
        ? "සාප්පු සහ හෝටල් සහල් ඉල්ලුම්"
        : "Wholesale Buyer Requirements",
      subtitle: isSinhala
        ? "වෙළඳසැල් සහ හෝටල් විසින් ඉදිරිපත් කර ඇති තොග සහල් අවශ්‍යතා සඳහා ඔබේ මෝලේ මිල ගණන් ඉදිරිපත් කරන්න."
        : "Submit direct wholesale price quotes for bulk rice demands posted by verified shops and restaurants.",
      back: isSinhala ? "← මෝල් පුවරුව වෙත" : "← Back to Mill Dashboard",
      quotePrice: isSinhala ? "ඔබේ මිල / kg (LKR)" : "Quote / kg (LKR)",
      submitQuote: isSinhala ? "මිල ගණන ඉදිරිපත් කරන්න" : "Submit Quote",
      emptyTitle: isSinhala ? "දැනට සහල් අවශ්‍යතා නොමැත" : "No Active Demands Found",
      emptyDesc: isSinhala
        ? "සාප්පු හෝ හෝටල් විසින් නව සහල් අවශ්‍යතා පළ කළ පසු මෙහි දිස්වනු ඇත."
        : "Commercial buyers haven't posted any bulk demands yet.",
      myQuotesTitle: isSinhala ? "මා ඉදිරිපත් කළ මිල ගණන්" : "My Submitted Quotes",
      loadingText: isSinhala ? "අවශ්‍යතා ලබාගනිමින්..." : "Loading requirements...",
      errorText: isSinhala ? "අවශ්‍යතා ලබාගැනීමට නොහැකි විය." : "Failed to load requirements.",
    }),
    [isSinhala]
  );

  function authHeaders() {
    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");
    return token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        }
      : null;
  }

  async function loadData() {
    const headers = authHeaders();
    if (!headers) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [reqRes, offersRes] = await Promise.all([
        fetch(`${API_URL}/api/mill/requirements`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/mill/requirements/offers`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (reqRes.status === 401 || reqRes.status === 403) {
        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (reqRes.ok) setRequirements(await reqRes.json());
      if (offersRes.ok) setMyOffers(await offersRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmitOffer(requirementId: number) {
    const headers = authHeaders();
    if (!headers) return;

    const price = prices[requirementId];
    if (!price || Number(price) <= 0) {
      setError(isSinhala ? "කරුණාකර වලංගු මිලක් ඇතුළත් කරන්න." : "Please enter a valid price.");
      return;
    }

    try {
      setSavingId(requirementId);
      setError(null);

      const res = await fetch(
        `${API_URL}/api/mill/requirements/${requirementId}/offers`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ pricePerKg: Number(price) }),
        }
      );

      if (!res.ok) throw new Error("Could not submit offer");

      const created = (await res.json()) as MillOffer;
      setMyOffers((prev) => [created, ...prev]);
      setPrices((prev) => ({ ...prev, [requirementId]: "" }));
      setNotification(isSinhala ? "මිල ගණන සාර්ථකව ඉදිරිපත් කරන ලදී!" : "Quote submitted!");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting quote");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "ව්‍යාපාරික ඉල්ලුම්" : "Buyer Demands"} roleType="MILL" />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <div>
          <Link
            href="/dashboard/mill"
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

        {error && <ErrorBanner message={error} onRetry={loadData} />}

        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ {notification}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold">{t.loadingText}</p>
          </div>
        ) : requirements.length === 0 ? (
          <EmptyState
            title={t.emptyTitle}
            description={t.emptyDesc}
            icon="🏪"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((req) => (
              <article
                key={req.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Requirement #{req.id}
                      </span>
                      <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
                        {req.riceType}
                      </h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {req.frequency}
                    </span>
                  </div>

                  <p className="mt-3 text-base font-extrabold text-slate-800 dark:text-slate-200">
                    {req.quantityKg.toLocaleString()} kg
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      placeholder="e.g. 215.00"
                      value={prices[req.id] || ""}
                      onChange={(e) =>
                        setPrices({ ...prices, [req.id]: e.target.value })
                      }
                      className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
                    />
                    <Button
                      onClick={() => handleSubmitOffer(req.id)}
                      variant="primary"
                      size="md"
                      loading={savingId === req.id}
                      className="font-bold shrink-0"
                    >
                      {t.submitQuote}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
