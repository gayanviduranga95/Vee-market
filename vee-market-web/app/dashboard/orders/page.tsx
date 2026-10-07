"use client";

import { useEffect, useState } from "react";
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

export default function OrdersPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const t = {
    title: isSinhala ? "ගනුදෙනු සහ ඇණවුම්" : "Deals & Orders",
    subtitle: isSinhala
      ? "පිළිගත් ලංසු වලින් නිර්මාණය වූ ගනුදෙනු, ගෙවීම් සහ බෙදාහැරීම් මෙතැනින් කළමනාකරණය කරන්න."
      : "Manage confirmed deals, escrow payments, and delivery tracking from accepted bids.",
    back: isSinhala ? "← පුවරුව වෙත" : "← Back to Dashboard",
    empty: isSinhala
      ? "තවමත් ක්‍රියාකාරී ඇණවුම් නොමැත."
      : "No confirmed deals or orders yet.",
    emptyDesc: isSinhala
      ? "ඔබගේ වී තොග සඳහා ලැබෙන මිල ගණන් පිළිගත් පසු ගනුදෙනු මෙහි පෙන්වනු ඇත."
      : "Once you accept a mill's bid on your paddy lots, active deals will appear here.",
    dealNumber: isSinhala ? "ගනුදෙනුව" : "Deal",
    lotNumber: isSinhala ? "වී තොගය" : "Lot",
    millBuyer: isSinhala ? "මිලදී ගන්නා මෝල" : "Buyer Mill",
    agreedPrice: isSinhala ? "එකඟ වූ මිල" : "Agreed Price",
    quantity: isSinhala ? "ප්‍රමාණය" : "Quantity",
    totalValue: isSinhala ? "මුළු වටිනාකම" : "Total Value",
    dealStatus: isSinhala ? "ගනුදෙනු තත්ත්වය" : "Deal Status",
    paymentStatus: isSinhala ? "ගෙවීම් තත්ත්වය" : "Payment Status",
    deliveryStatus: isSinhala ? "බෙදාහැරීම" : "Delivery Status",
    actions: {
      confirmDeal: isSinhala ? "ගනුදෙනුව තහවුරු කරන්න" : "Confirm Deal",
      markPaid: isSinhala ? "ගෙවීම ලැබුණු බව සලකුණු කරන්න" : "Mark Payment Received",
      markDelivered: isSinhala ? "භාණ්ඩ ලබාදුන් බව සලකුණු කරන්න" : "Mark Delivered",
      markInTransit: isSinhala ? "ගමන් කරමින් ලෙස සලකුණු කරන්න" : "Mark In Transit",
    },
    loadingText: isSinhala ? "ඇණවුම් දත්ත පූරණය වෙමින්..." : "Loading orders...",
    errorText: isSinhala ? "ඇණවුම් ලබාගැනීමට නොහැකි විය." : "Failed to load orders.",
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

  async function loadDeals() {
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
    loadDeals();
  }, []);

  async function handleConfirmDeal(dealId: number) {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setActionLoadingId(dealId);
      const res = await fetch(`${API_URL}/api/farmer/deals/${dealId}/confirm`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.message ||
            (isSinhala
              ? "ගනුදෙනුව තහවුරු කිරීමට නොහැකි විය."
              : "Failed to confirm deal.")
        );
      }

      const updated = (await res.json()) as Deal;
      setDeals((prev) => prev.map((d) => (d.dealId === updated.dealId ? updated : d)));
      setNotification(
        isSinhala
          ? `ගනුදෙනු #${dealId} සාර්ථකව තහවුරු කරන ලදී!`
          : `Deal #${dealId} successfully confirmed!`
      );
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleUpdatePayment(dealId: number, status: string) {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setActionLoadingId(dealId);
      const res = await fetch(`${API_URL}/api/farmer/deals/${dealId}/payment`, {
        method: "POST",
        headers,
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.message ||
            (isSinhala
              ? "ගෙවීම් තත්ත්වය යාවත්කාලීන කිරීමට නොහැකි විය."
              : "Failed to update payment.")
        );
      }

      const updated = (await res.json()) as Deal;
      setDeals((prev) => prev.map((d) => (d.dealId === updated.dealId ? updated : d)));
      setNotification(
        isSinhala
          ? `ගෙවීම් තත්ත්වය '${status}' ලෙස යාවත්කාලීන විය.`
          : `Payment status updated to ${status}.`
      );
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleUpdateDelivery(dealId: number, status: string) {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setActionLoadingId(dealId);
      const res = await fetch(`${API_URL}/api/farmer/deals/${dealId}/delivery`, {
        method: "POST",
        headers,
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.message ||
            (isSinhala
              ? "බෙදාහැරීම් තත්ත්වය යාවත්කාලීන කිරීමට නොහැකි විය."
              : "Failed to update delivery.")
        );
      }

      const updated = (await res.json()) as Deal;
      setDeals((prev) => prev.map((d) => (d.dealId === updated.dealId ? updated : d)));
      setNotification(
        isSinhala
          ? `බෙදාහැරීම් තත්ත්වය '${status}' ලෙස යාවත්කාලීන විය.`
          : `Delivery status updated to ${status}.`
      );
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-800 dark:bg-slate-950 dark:text-white">
      {/* SHARED BRAND HEADER */}
      <VeeHeader roleBadge="Orders" roleType="FARMER" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {t.back}
          </Link>
          <button
            onClick={loadDeals}
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

        {/* NOTIFICATION */}
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-3">
            <span>✅</span>
            <span>{notification}</span>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold text-sm">{t.loadingText}</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <span className="text-4xl">📦</span>
            <p className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-200">
              {t.empty}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t.emptyDesc}
            </p>
            <Link
              href="/dashboard/listings"
              className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
            >
              {isSinhala ? "වී තොග බලන්න" : "View Paddy Lots"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {deals.map((deal) => {
              const isBusy = actionLoadingId === deal.dealId;
              const totalAmount = deal.quantityKg * deal.agreedPricePerKg;

              return (
                <article
                  key={deal.dealId}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {t.dealNumber} #{deal.dealId}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                        <Link
                          href={`/dashboard/listings/${deal.lotId}`}
                          className="hover:underline text-emerald-700 dark:text-emerald-400"
                        >
                          {t.lotNumber} #{deal.lotId}
                        </Link>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.millBuyer}: Mill User #{deal.millUserId}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        deal.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : deal.status === "CONFIRMED"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {deal.status}
                    </span>
                  </div>

                  {/* NUMERICAL METRICS */}
                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-950/60 text-center">
                    <div>
                      <p className="text-[11px] text-slate-400">{t.agreedPrice}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        LKR {Number(deal.agreedPricePerKg).toFixed(2)}/kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">{t.quantity}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {Number(deal.quantityKg).toLocaleString()} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">{t.totalValue}</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        LKR {totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* STATUS PILLS */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {t.paymentStatus}:
                    </span>
                    <span
                      className={`rounded-lg px-2 py-0.5 font-bold ${
                        deal.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {deal.paymentStatus || "UNPAID"}
                    </span>

                    <span className="ml-2 font-semibold text-slate-500 dark:text-slate-400">
                      {t.deliveryStatus}:
                    </span>
                    <span
                      className={`rounded-lg px-2 py-0.5 font-bold ${
                        deal.deliveryStatus === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : deal.deliveryStatus === "IN_TRANSIT"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {deal.deliveryStatus || "PENDING"}
                    </span>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {deal.status !== "CONFIRMED" && deal.status !== "COMPLETED" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleConfirmDeal(deal.dealId)}
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        ✓ {t.actions.confirmDeal}
                      </button>
                    )}

                    {deal.paymentStatus !== "PAID" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdatePayment(deal.dealId, "PAID")}
                        className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        💳 {t.actions.markPaid}
                      </button>
                    )}

                    {deal.deliveryStatus !== "DELIVERED" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleUpdateDelivery(deal.dealId, "DELIVERED")
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        🚚 {t.actions.markDelivered}
                      </button>
                    )}

                    {deal.deliveryStatus !== "IN_TRANSIT" &&
                      deal.deliveryStatus !== "DELIVERED" && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            handleUpdateDelivery(deal.dealId, "IN_TRANSIT")
                          }
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          📦 {t.actions.markInTransit}
                        </button>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
