"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../components/LanguageProvider";
import VeeHeader from "../components/VeeHeader";
import { Button, StatusBadge, EmptyState, ErrorBanner } from "../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Farmer = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  deviceNumber?: string;
};

type Farm = {
  id: number;
  farmName?: string;
  location?: string;
  landSize?: number;
  mainCrop?: string;
};

type Lot = {
  id: number;
  productType?: string;
  riceType?: string;
  quantityKg?: number;
  askingPricePerKg?: number;
  availableDate?: string;
  status?: string;
  createdAt?: string;
};

type Bid = {
  id: number;
  bidId?: number;
  lotId?: number;
  millUserId?: number;
  bidPricePerKg?: number;
  status?: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      greeting: isSinhala ? "සුභ උදෑසනක්" : "Good morning",
      farmerBadge: isSinhala ? "ගොවි මහතා" : "Farmer Account",
      subtitle: isSinhala
        ? "Vee Market සමඟ එක්ව වර්ධනය වෙමු."
        : "Let's grow together with Vee Market.",
      stats: {
        activeLots: isSinhala ? "සක්‍රීය වී තොග" : "Active Lots",
        totalVolume: isSinhala ? "මුළු වී ප්‍රමාණය" : "Total Volume",
        newOffers: isSinhala ? "ලැබුණු මිල ගණන්" : "Received Offers",
        farmsCount: isSinhala ? "ගොවිපළවල්" : "Registered Farms",
      },
      actions: {
        addLot: isSinhala ? "+ නව වී තොගයක් එකතු කරන්න" : "+ Add Paddy Lot",
        viewAllLots: isSinhala ? "සියලුම තොග බලන්න" : "View All Lots",
        viewOffers: isSinhala ? "මිල ගණන් බලන්න" : "Review Offers",
        addFarm: isSinhala ? "ගොවිපළක් එකතු කරන්න" : "Add Farm",
        manageFarms: isSinhala ? "මගේ ගොවිපළ" : "My Farms",
        orders: isSinhala ? "ඇණවුම් සහ ගනුදෙනු" : "Orders & Deals",
        payments: isSinhala ? "ගෙවීම් වාර්තා" : "Payment Ledger",
      },
      recentLotsTitle: isSinhala ? "මගේ නවතම වී තොග" : "Your Recent Paddy Lots",
      recentOffersTitle: isSinhala ? "අවධානය අවශ්‍ය මිල ගණන්" : "Offers Requiring Attention",
      noLotsTitle: isSinhala ? "තවමත් වී තොග එකතු කර නැත" : "No Paddy Lots Yet",
      noLotsDesc: isSinhala
        ? "ඔබේ පළමු වී තොගය වෙළඳපොළට එකතු කර මෝල් වෙතින් තරගකාරී මිල ගණන් ලබාගන්න."
        : "Create your first paddy lot to attract bids from certified rice mills.",
      noBidsTitle: isSinhala ? "තවමත් නව මිල ගණන් නොමැත" : "No Offers Received Yet",
      noBidsDesc: isSinhala
        ? "මෝල් හිමියන් ඔබේ වී තොග සඳහා මිල ඉදිරිපත් කළ පසු මෙහි දිස්වනු ඇත."
        : "Offers from buyers will appear here once they inspect your lots.",
      lotCard: {
        askingPrice: isSinhala ? "ඉල්ලුම් මිල" : "Asking Price",
        quantity: isSinhala ? "ප්‍රමාණය" : "Quantity",
        available: isSinhala ? "ලබාගත හැකි දිනය" : "Available Date",
        viewDetails: isSinhala ? "විස්තර සහ මිල බලන්න →" : "View Details & Offers →",
      },
      kg: "kg",
      rsPerKg: isSinhala ? "රු. / kg" : "LKR / kg",
    }),
    [isSinhala]
  );

  async function loadDashboard(token: string) {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [farmerRes, farmsRes, lotsRes] = await Promise.all([
        fetch(`${API_URL}/api/farmer/me`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/farmer/farms`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/farmer/lots`, { headers, cache: "no-store" }),
      ]);

      if (farmerRes.status === 401 || lotsRes.status === 401) {
        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (farmerRes.ok) {
        const farmerData = await farmerRes.json();
        setFarmer(farmerData);
      }

      if (farmsRes.ok) {
        const farmsData = await farmsRes.json();
        setFarms(Array.isArray(farmsData) ? farmsData : farmsData?.content || []);
      }

      let allLots: Lot[] = [];
      if (lotsRes.ok) {
        const lotsData = await lotsRes.json();
        allLots = Array.isArray(lotsData) ? lotsData : lotsData?.content || [];
        setLots(allLots);
      }

      // Load offers for farmer lots
      try {
        const bidsRes = await fetch(`${API_URL}/api/farmer/bids`, {
          headers,
          cache: "no-store",
        });
        if (bidsRes.ok) {
          const bidsData = await bidsRes.json();
          setBids(Array.isArray(bidsData) ? bidsData : []);
        } else if (allLots.length > 0) {
          // Fallback per-lot bids
          const firstLotBids = await fetch(
            `${API_URL}/api/farmer/lots/${allLots[0].id}/bids`,
            { headers, cache: "no-store" }
          );
          if (firstLotBids.ok) {
            const fbData = await firstLotBids.json();
            setBids(Array.isArray(fbData) ? fbData : []);
          }
        }
      } catch (bidErr) {
        console.warn("Could not load bids list:", bidErr);
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        isSinhala
          ? "දත්ත ලබාගැනීමේදී ගැටළුවක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න."
          : "Failed to connect to server. Please verify your connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const role = (
      localStorage.getItem("vee-market-user-role") || ""
    ).toUpperCase();

    if (role === "MILL") {
      router.replace("/dashboard/mill");
      return;
    }
    if (role === "BUYER" || role === "SHOP" || role === "HOTEL") {
      router.replace("/dashboard/business");
      return;
    }
    if (role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }

    loadDashboard(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeLots = lots.filter(
    (lot) => !lot.status || lot.status.toUpperCase() === "ACTIVE"
  );
  const totalVolumeKg = lots.reduce((acc, lot) => acc + (lot.quantityKg || 0), 0);
  const pendingBids = bids.filter(
    (bid) => !bid.status || bid.status.toUpperCase() === "PENDING"
  );

  const [clientEmail, setClientEmail] = useState("");
  useEffect(() => {
    setClientEmail(localStorage.getItem("vee-market-user-email")?.split("@")[0] || "");
  }, []);
  const farmerName = farmer?.name || clientEmail || "Welcome";

  // Formatted date for Sri Lanka / Local agricultural weather card
  const formattedDate = useMemo(() => {
    try {
      const d = new Date();
      return d.toLocaleDateString(isSinhala ? "si-LK" : "en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Thu, 15 Oct 2026";
    }
  }, [isSinhala]);

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={t.farmerBadge} roleType="FARMER" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
        {/* HERO / WELCOME BANNER MATCHING VISUAL REFERENCE */}
        <section className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] shadow-lg border border-slate-200/50 dark:border-slate-800/80 min-h-[220px] sm:min-h-[250px] lg:min-h-[260px] flex items-center">
          {/* Panoramic Agricultural Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center sm:bg-left-bottom transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/vee-market-hero.png')` }}
            aria-hidden="true"
          />

          {/* Dark readable gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 sm:via-black/45 sm:to-black/15 pointer-events-none" />

          {/* Banner Content Container */}
          <div className="relative z-10 w-full px-6 py-6 sm:px-10 sm:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left Column: Greeting, Display Name, Subtitle */}
            <div className="space-y-1 sm:space-y-1.5 max-w-xl text-white">
              <p className="text-xs sm:text-sm font-medium text-emerald-100/90 tracking-wide">
                {t.greeting},
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black tracking-tight text-white drop-shadow-sm break-words">
                {farmerName}!
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-white/90 font-normal pt-1">
                {t.subtitle}
              </p>
            </div>

            {/* Right Column: Compact Weather Card */}
            <div className="self-start md:self-center shrink-0">
              <div className="flex items-center gap-3.5 rounded-2xl bg-[#193522]/85 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 border border-white/15 shadow-xl text-white">
                {/* Weather Icon (Sun) */}
                <div className="text-3xl sm:text-4xl select-none" aria-label="Sunny weather">
                  ☀️
                </div>
                {/* Weather details */}
                <div className="flex flex-col">
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                    28°C
                  </div>
                  <div className="text-[11px] sm:text-xs font-medium text-emerald-100/90 mt-1 leading-snug">
                    {isSinhala ? "ගාල්ල, ශ්‍රී ලංකාව" : "Galle, Sri Lanka"}
                  </div>
                  <div className="text-[10px] text-emerald-200/70 font-normal leading-tight">
                    {formattedDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTION BAR */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isSinhala ? "ගොවි උපකරණ පුවරුව" : "Farmer Overview"}
          </div>
          <div className="w-full sm:w-auto">
            <Link href="/dashboard/listings/new" className="block w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                fullWidth
                className="shadow-sm font-bold flex items-center justify-center gap-2"
              >
                <span>🌾</span>
                <span>{t.actions.addLot}</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <ErrorBanner
            message={error}
            onRetry={() => {
              const token =
                localStorage.getItem("vee-market-token") ||
                localStorage.getItem("token");
              if (token) loadDashboard(token);
            }}
          />
        )}

        {/* STATS OVERVIEW CARDS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/dashboard/listings"
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t.stats.activeLots}
              </span>
              <span className="text-xl">📦</span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? "..." : activeLots.length}
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {t.actions.viewAllLots} →
            </p>
          </Link>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t.stats.totalVolume}
              </span>
              <span className="text-xl">⚖️</span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? "..." : totalVolumeKg.toLocaleString()}
              <span className="text-xs font-bold ml-1 text-slate-400">{t.kg}</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {lots.length} {isSinhala ? "මුළු තොග" : "total lots recorded"}
            </p>
          </div>

          <Link
            href="/dashboard/bids"
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t.stats.newOffers}
              </span>
              <span className="text-xl">🤝</span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? "..." : bids.length}
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {t.actions.viewOffers} →
            </p>
          </Link>

          <Link
            href="/dashboard/farms/new"
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t.stats.farmsCount}
              </span>
              <span className="text-xl">🏡</span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? "..." : farms.length}
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              + {t.actions.addFarm}
            </p>
          </Link>
        </section>

        {/* QUICK SECONDARY SHORTCUTS */}
        <section className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm">
              📦 {t.actions.viewAllLots}
            </Button>
          </Link>
          <Link href="/dashboard/bids">
            <Button variant="outline" size="sm">
              🤝 {t.actions.viewOffers}
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm">
              🚚 {t.actions.orders}
            </Button>
          </Link>
          <Link href="/dashboard/payments">
            <Button variant="outline" size="sm">
              💳 {t.actions.payments}
            </Button>
          </Link>
          <Link href="/dashboard/farms/new">
            <Button variant="outline" size="sm">
              🏡 {t.actions.addFarm}
            </Button>
          </Link>
        </section>

        {/* RECENT LOTS & OFFERS SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RECENT LOTS */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {t.recentLotsTitle}
              </h2>
              <Link
                href="/dashboard/listings"
                className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                {t.actions.viewAllLots} →
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              </div>
            ) : lots.length === 0 ? (
              <EmptyState
                title={t.noLotsTitle}
                description={t.noLotsDesc}
                actionLabel={t.actions.addLot}
                onAction={() => router.push("/dashboard/listings/new")}
              />
            ) : (
              <div className="space-y-3">
                {lots.slice(0, 4).map((lot) => (
                  <Link
                    key={lot.id}
                    href={`/dashboard/listings/${lot.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          #{lot.id} {lot.riceType || lot.productType}
                        </span>
                        <StatusBadge status={lot.status || "ACTIVE"} size="sm" />
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t.lotCard.quantity}:{" "}
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {lot.quantityKg?.toLocaleString()} {t.kg}
                        </span>
                        {" · "}
                        {t.lotCard.askingPrice}:{" "}
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          LKR {lot.askingPricePerKg}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {t.lotCard.viewDetails}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* OFFERS ATTENTION */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {t.recentOffersTitle}
              </h2>
              <Link
                href="/dashboard/bids"
                className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                {t.actions.viewOffers} →
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              </div>
            ) : bids.length === 0 ? (
              <EmptyState
                title={t.noBidsTitle}
                description={t.noBidsDesc}
                icon="🤝"
              />
            ) : (
              <div className="space-y-3">
                {bids.slice(0, 4).map((bid) => {
                  const bidLotId = bid.lotId || bid.id;
                  return (
                    <Link
                      key={bid.bidId || bid.id}
                      href={`/dashboard/listings/${bidLotId}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                            Lot #{bidLotId}
                          </span>
                          <StatusBadge status={bid.status || "PENDING"} size="sm" />
                        </div>
                        <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                          LKR {bid.bidPricePerKg}
                          <span className="text-xs font-semibold text-slate-400 ml-1">
                            / kg
                          </span>
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {isSinhala ? "ලංසුව පිළිගන්න →" : "Review Offer →"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}