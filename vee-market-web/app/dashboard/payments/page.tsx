"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";
import { Button, StatusBadge, EmptyState, ErrorBanner } from "../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Deal = {
  dealId: number;
  bidId: number;
  lotId: number;
  farmerUserId: number;
  millUserId: number;
  agreedPricePerKg: number;
  quantityKg: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
};

export default function PaymentsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const t = useMemo(
    () => ({
      title: isSinhala ? "ගෙවීම් සහ මුදල් ලැබීම්" : "Payments & Ledger",
      subtitle: isSinhala
        ? "ඔබගේ වී අලෙවි ගනුදෙනු වලින් ලැබුණු සහ පොරොත්තු ගෙවීම් වාර්තා."
        : "Financial tracking and payment confirmations from verified buyer deals.",
      back: isSinhala ? "← පුවරුව වෙත" : "← Back to Dashboard",
      deal: isSinhala ? "ගනුදෙනුව" : "Deal",
      buyer: isSinhala ? "ගැනුම්කරු" : "Buyer",
      unitPrice: isSinhala ? "ඒකක මිල" : "Unit Price",
      volume: isSinhala ? "ප්‍රමාණය" : "Volume",
      grossTotal: isSinhala ? "මුළු මුදල" : "Total Amount",
      paymentStatus: isSinhala ? "ගෙවීම් තත්ත්වය" : "Payment Status",
      markPaid: isSinhala ? "මුදල් ලැබුණු බව සලකුණු කරන්න" : "Confirm Payment Received",
      emptyTitle: isSinhala ? "තවමත් ගෙවීම් වාර්තා නොමැත" : "No Payment Records Yet",
      emptyDesc: isSinhala
        ? "මෝල් වෙතින් වී තොග සඳහා ලංසු පිළිගත් පසු ගෙවීම් මෙහි දිස්වනු ඇත."
        : "Settlements from accepted buyer lots will appear here.",
      loadingText: isSinhala ? "ගෙවීම් දත්ත ලබාගනිමින්..." : "Loading payments...",
      errorText: isSinhala ? "ගෙවීම් ලබාගැනීමට නොහැකි විය." : "Failed to load payment records.",
    }),
    [isSinhala]
  );

  async function loadPayments() {
    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/farmer/deals`, {
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

      if (!res.ok) throw new Error(t.errorText);

      const data = await res.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMarkPaid(dealId: number) {
    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");
    if (!token) return;

    try {
      setUpdatingId(dealId);
      const res = await fetch(`${API_URL}/api/farmer/deals/${dealId}/payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "PAID" }),
      });

      if (!res.ok) throw new Error("Could not update payment");

      const updated = (await res.json()) as Deal;
      setDeals((prev) => prev.map((d) => (d.dealId === updated.dealId ? updated : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating payment");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "ගෙවීම්" : "Payments"} roleType="FARMER" />

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

        {error && <ErrorBanner message={error} onRetry={loadPayments} />}

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold">{t.loadingText}</p>
          </div>
        ) : deals.length === 0 ? (
          <EmptyState
            title={t.emptyTitle}
            description={t.emptyDesc}
            icon="💳"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal) => {
              const totalVal = (deal.agreedPricePerKg || 0) * (deal.quantityKg || 0);

              return (
                <article
                  key={deal.dealId}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          {t.deal} #{deal.dealId}
                        </span>
                        <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
                          {t.buyer} #{deal.millUserId}
                        </h2>
                      </div>
                      <StatusBadge status={deal.paymentStatus || "PENDING"} size="md" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-950/60">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400">{t.unitPrice}</p>
                        <p className="mt-0.5 text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                          LKR {deal.agreedPricePerKg}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400">{t.volume}</p>
                        <p className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-white">
                          {deal.quantityKg?.toLocaleString()} kg
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">{t.grossTotal}:</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        LKR {totalVal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {deal.paymentStatus !== "PAID" && (
                    <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                      <Button
                        onClick={() => handleMarkPaid(deal.dealId)}
                        variant="secondary"
                        size="md"
                        fullWidth
                        loading={updatingId === deal.dealId}
                        className="font-bold"
                      >
                        ✓ {t.markPaid}
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
