"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

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
  updatedAt: string;
};

export default function PaymentsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const t = {
    title: isSinhala ? "ගෙවීම් සහ මුදල් ලැබීම්" : "Payments & Escrow Ledger",
    subtitle: isSinhala
      ? "ඔබගේ වී අලෙවි ගනුදෙනු වලින් ලැබුණු සහ පොරොත්තු ගෙවීම් වාර්තා."
      : "Financial tracking, settled revenue, and pending payments from verified mill deals.",
    back: isSinhala ? "← පුවරුව වෙත" : "← Back to Dashboard",
    metrics: {
      totalRevenue: isSinhala ? "මුළු ගනුදෙනු වටිනාකම" : "Gross Contract Value",
      settled: isSinhala ? "ලැබුණු ගෙවීම්" : "Settled Payments",
      pending: isSinhala ? "ලැබීමට ඇති මුදල්" : "Pending Settlements",
    },
    table: {
      deal: isSinhala ? "ගනුදෙනුව" : "Deal",
      lot: isSinhala ? "වී තොගය" : "Paddy Lot",
      buyer: isSinhala ? "ගැනුම්කරු" : "Buyer",
      quantity: isSinhala ? "ප්‍රමාණය" : "Volume",
      unitPrice: isSinhala ? "ඒකක මිල" : "Unit Price",
      totalAmount: isSinhala ? "මුළු මුදල" : "Total Amount",
      status: isSinhala ? "ගෙවීම් තත්ත්වය" : "Status",
      action: isSinhala ? "ක්‍රියාව" : "Action",
      markPaid: isSinhala ? "ගෙවීම සලකුණු කරන්න" : "Confirm Received",
    },
    empty: isSinhala
      ? "තවමත් ගෙවීම් වාර්තා නොමැත."
      : "No payment records found yet.",
    emptyDesc: isSinhala
      ? "මෝල් වෙතින් වී තොග සඳහා ලංසු පිළිගත් පසු ගෙවීම් මෙහි දිස්වනු ඇත."
      : "Payments from accepted buyer lots will appear here.",
    loadingText: isSinhala ? "ගෙවීම් දත්ත පූරණය වෙමින්..." : "Loading payments...",
    errorText: isSinhala ? "ගෙවීම් ලබාගැනීමට නොහැකි විය." : "Failed to load payment records.",
    refresh: isSinhala ? "යාවත්කාලීන කරන්න" : "Refresh",
  };

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

  async function loadPayments() {
    const headers = authHeaders();
    if (!headers) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/farmer/deals`, {
        headers,
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          (await response.json().catch(() => null))?.message || t.errorText
        );
      }

      setDeals(await response.json());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function handleMarkPaid(dealId: number) {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setUpdatingId(dealId);
      const res = await fetch(`${API_URL}/api/farmer/deals/${dealId}/payment`, {
        method: "POST",
        headers,
        body: JSON.stringify({ status: "PAID" }),
      });

      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.message ||
            (isSinhala
              ? "ගෙවීම් තත්ත්වය යාවත්කාලීන කිරීමට නොහැකි විය."
              : "Failed to update payment status.")
        );
      }

      const updated = (await res.json()) as Deal;
      setDeals((prev) => prev.map((d) => (d.dealId === updated.dealId ? updated : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setUpdatingId(null);
    }
  }

  // Financial aggregates
  const totalRevenue = useMemo(() => {
    return deals.reduce(
      (acc, d) => acc + Number(d.quantityKg || 0) * Number(d.agreedPricePerKg || 0),
      0
    );
  }, [deals]);

  const settledRevenue = useMemo(() => {
    return deals
      .filter((d) => d.paymentStatus === "PAID")
      .reduce(
        (acc, d) => acc + Number(d.quantityKg || 0) * Number(d.agreedPricePerKg || 0),
        0
      );
  }, [deals]);

  const pendingRevenue = useMemo(() => {
    return totalRevenue - settledRevenue;
  }, [totalRevenue, settledRevenue]);

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "ගෙවීම්" : "Payments"} roleType="FARMER" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {t.back}
          </Link>
          <button
            onClick={loadPayments}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <span>🔄</span>
            <span>{t.refresh}</span>
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {t.subtitle}
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.metrics.totalRevenue}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              LKR {totalRevenue.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {deals.length} {isSinhala ? "ගනුදෙනු" : "deals"}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm dark:border-emerald-950 dark:bg-emerald-950/20">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
              <span>💳</span> {t.metrics.settled}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">
              LKR {settledRevenue.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
              {deals.filter((d) => d.paymentStatus === "PAID").length}{" "}
              {isSinhala ? "සම්පූර්ණයි" : "settled"}
            </p>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-6 shadow-sm dark:border-amber-950 dark:bg-amber-950/20">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1">
              <span>⏳</span> {t.metrics.pending}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300">
              LKR {pendingRevenue.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
              {deals.filter((d) => d.paymentStatus !== "PAID").length}{" "}
              {isSinhala ? "පොරොත්තුවෙන්" : "in progress"}
            </p>
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold text-sm">{t.loadingText}</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <span className="text-4xl">💰</span>
            <p className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-200">
              {t.empty}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => {
              const totalAmount = deal.quantityKg * deal.agreedPricePerKg;
              const isPaid = deal.paymentStatus === "PAID";
              const isUpdating = updatingId === deal.dealId;

              return (
                <div
                  key={deal.dealId}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold dark:bg-slate-800">
                      🌾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          DEAL #{deal.dealId}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <Link
                          href={`/dashboard/listings/${deal.lotId}`}
                          className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                        >
                          LOT #{deal.lotId}
                        </Link>
                      </div>
                      <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {Number(deal.quantityKg).toLocaleString()} kg @ LKR{" "}
                        {Number(deal.agreedPricePerKg).toFixed(2)}/kg
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Mill Buyer #{deal.millUserId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        LKR {totalAmount.toLocaleString()}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {deal.paymentStatus || "UNPAID"}
                      </span>
                    </div>

                    {!isPaid && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleMarkPaid(deal.dealId)}
                        className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        ✓ {t.table.markPaid}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
