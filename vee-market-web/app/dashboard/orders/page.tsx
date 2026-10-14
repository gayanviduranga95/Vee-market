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
  updatedAt?: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      title: isSinhala ? "ගනුදෙනු සහ ඇණවුම්" : "Deals & Orders",
      subtitle: isSinhala
        ? "පිළිගත් ලංසු වලින් නිර්මාණය වූ ගනුදෙනු, ගෙවීම් තත්ත්වයන් සහ භාණ්ඩ බෙදාහැරීම මෙතැනින් පරීක්ෂා කරන්න."
        : "Track settled contracts, escrow payment status, and delivery milestones from accepted bids.",
      back: isSinhala ? "← පුවරුව වෙත" : "← Back to Dashboard",
      deal: isSinhala ? "ගනුදෙනුව" : "Deal",
      lot: isSinhala ? "වී තොගය" : "Lot",
      buyer: isSinhala ? "මිලදී ගන්නා මෝල" : "Buyer Mill",
      agreedPrice: isSinhala ? "එකඟ වූ මිල" : "Agreed Price",
      quantity: isSinhala ? "ප්‍රමාණය" : "Quantity",
      totalValue: isSinhala ? "මුළු වටිනාකම" : "Gross Contract Value",
      paymentStatus: isSinhala ? "ගෙවීම" : "Payment",
      deliveryStatus: isSinhala ? "බෙදාහැරීම" : "Delivery",
      confirmDeal: isSinhala ? "ගනුදෙනුව තහවුරු කරන්න" : "Confirm Deal",
      markDelivered: isSinhala ? "ලබාදුන් බව සලකුණු කරන්න" : "Mark Delivered",
      emptyTitle: isSinhala ? "තවමත් සක්‍රීය ඇණවුම් නොමැත" : "No Confirmed Deals Yet",
      emptyDesc: isSinhala
        ? "ඔබගේ වී තොග සඳහා ලැබුණු මිල ගණනක් පිළිගත් පසු ගනුදෙනු මෙහි දිස්වනු ඇත."
        : "Once you accept a mill's offer on your paddy lot, active deals will appear here.",
      loadingText: isSinhala ? "ඇණවුම් දත්ත ලබාගනිමින්..." : "Loading orders...",
      errorText: isSinhala ? "ඇණවුම් ලබාගැනීමට නොහැකි විය." : "Failed to load orders.",
      kg: "kg",
    }),
    [isSinhala]
  );

  async function loadDeals() {
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

      if (!res.ok) {
        throw new Error(t.errorText);
      }

      const data = await res.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load deals error:", err);
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeals();
  }, [router]);

  async function handleConfirmDeal(dealId: number) {
    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");
    if (!token) return;

    try {
      setActionLoadingId(dealId);
      const res = await fetch(`${API_URL}/api/farmer/deals/${dealId}/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Could not confirm deal");

      const updated = (await res.json()) as Deal;
      setDeals((prev) => prev.map((d) => (d.dealId === updated.dealId ? updated : d)));
      setNotification(`Deal #${dealId} confirmed!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error confirming deal");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "ඇණවුම්" : "Orders"} roleType="FARMER" />

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

        {error && <ErrorBanner message={error} onRetry={loadDeals} />}

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
        ) : deals.length === 0 ? (
          <EmptyState
            title={t.emptyTitle}
            description={t.emptyDesc}
            icon="🚚"
            actionLabel={isSinhala ? "මගේ වී තොග බලන්න" : "Check Paddy Lots"}
            onAction={() => router.push("/dashboard/listings")}
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
                          {t.deal} #{deal.dealId} · {t.lot} #{deal.lotId}
                        </span>
                        <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
                          {t.buyer} #{deal.millUserId}
                        </h2>
                      </div>
                      <StatusBadge status={deal.status || "CONFIRMED"} size="md" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-950/60">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400">{t.agreedPrice}</p>
                        <p className="mt-0.5 text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                          LKR {deal.agreedPricePerKg} / kg
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400">{t.quantity}</p>
                        <p className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-white">
                          {deal.quantityKg?.toLocaleString()} {t.kg}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">{t.totalValue}:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        LKR {totalVal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-500">{t.paymentStatus}:</span>
                      <StatusBadge status={deal.paymentStatus || "PENDING"} size="sm" />
                      <span className="text-xs text-slate-500 ml-2">{t.deliveryStatus}:</span>
                      <StatusBadge status={deal.deliveryStatus || "PENDING"} size="sm" />
                    </div>
                  </div>

                  {deal.status === "PENDING" && (
                    <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                      <Button
                        onClick={() => handleConfirmDeal(deal.dealId)}
                        variant="primary"
                        size="md"
                        fullWidth
                        loading={actionLoadingId === deal.dealId}
                        className="font-bold"
                      >
                        {t.confirmDeal}
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
