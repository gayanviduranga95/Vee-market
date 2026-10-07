"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type BusinessProfile = {
  id: number;
  businessType: "SHOP" | "HOTEL";
  businessName: string;
  location?: string | null;
};

type Requirement = {
  id: number;
  riceType: string;
  quantityKg: number;
  frequency: "WEEKLY" | "ONE_TIME";
  status: string;
  createdAt?: string;
};

type Offer = {
  id: number;
  requirementId: number;
  millName: string;
  pricePerKg: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt?: string;
};

export default function BusinessDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [offers, setOffers] = useState<Record<number, Offer[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // New requirement form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [riceType, setRiceType] = useState("Nadu");
  const [quantityKg, setQuantityKg] = useState("1000");
  const [frequency, setFrequency] = useState<"WEEKLY" | "ONE_TIME">("WEEKLY");
  const [submittingReq, setSubmittingReq] = useState(false);
  const [offerActionId, setOfferActionId] = useState<number | null>(null);

  const t = {
    title: isSinhala
      ? "සාප්පු සහ හෝටල් තොග ප්‍රසම්පාදන පුවරුව"
      : "Shop & Hotel Procurement Hub",
    subtitle: isSinhala
      ? "සෘජුවම සහල් මෝල් වෙතින් තොග සහල් අවශ්‍යතා පළ කර තරගකාරී මිල ගණන් ලබාගන්න."
      : "Post bulk rice requirements and receive competitive wholesale offers directly from certified mills.",
    profileCard: {
      type: isSinhala ? "ව්‍යාපාර වර්ගය" : "Business Type",
      hotel: isSinhala ? "🏨 හෝටලය / අවන්හල" : "🏨 Hotel & Restaurant",
      shop: isSinhala ? "🏪 තොග / සිල්ලර වෙළඳසැල" : "🏪 Wholesale & Retail Shop",
      location: isSinhala ? "ස්ථානය" : "Location",
      status: isSinhala ? "සත්‍යාපිත ගැනුම්කරු" : "Verified Buyer",
    },
    stats: {
      activeRequirements: isSinhala ? "සක්‍රීය අවශ්‍යතා" : "Active Requirements",
      totalOffers: isSinhala ? "ලැබුණු මෝල් මිල ගණන්" : "Mill Offers Received",
      acceptedOrders: isSinhala ? "පිළිගත් සැපයුම් ඇණවුම්" : "Accepted Supply Orders",
      totalVolumeKg: isSinhala ? "මුළු සහල් ඉල්ලුම (kg)" : "Total Volume (kg)",
    },
    postRequirement: isSinhala ? "+ නව සහල් අවශ්‍යතාවක් පළ කරන්න" : "+ Post Rice Requirement",
    form: {
      modalTitle: isSinhala ? "නව සහල් තොග අවශ්‍යතාවක් පළ කරන්න" : "Post Bulk Rice Requirement",
      modalSubtitle: isSinhala
        ? "ඔබගේ ප්‍රමාණය සහ වාර ගණන සඳහන් කරන්න. ලියාපදිංචි මෝල් වෙතින් මිල ගණන් ඉදිරිපත් කරනු ඇත."
        : "Specify your variety, volume, and schedule. Certified mills will submit direct price quotes.",
      riceType: isSinhala ? "සහල් වර්ගය" : "Rice Variety",
      quantity: isSinhala ? "අවශ්‍ය ප්‍රමාණය (කිලෝග්‍රෑම්)" : "Quantity (kg)",
      frequency: isSinhala ? "සැපයුම් වාරය" : "Supply Schedule",
      weekly: isSinhala ? "සතිපතා (Weekly Recurring)" : "Weekly Recurring",
      oneTime: isSinhala ? "එක් වරක් (One-time Batch)" : "One-time Batch",
      submit: isSinhala ? "අවශ්‍යතාව පළ කරන්න" : "Publish Requirement",
      submitting: isSinhala ? "පළ කරමින්..." : "Publishing...",
      cancel: isSinhala ? "අවලංගු කරන්න" : "Cancel",
      presets: isSinhala ? "ඉක්මන් ප්‍රමාණයන්:" : "Quick volumes:",
    },
    requirementsSection: {
      title: isSinhala ? "ඔබේ සහල් අවශ්‍යතා සහ ලැබුණු මිල ගණන්" : "Your Requirements & Mill Quotes",
      noRequirements: isSinhala
        ? "ඔබ තවමත් සහල් අවශ්‍යතාවක් පළ කර නොමැත. මෝල් වෙතින් මිල ගණන් ලබා ගැනීමට අවශ්‍යතාවක් පළ කරන්න."
        : "You haven't posted any rice requirements yet. Post one now to receive direct mill offers.",
      offersForThis: isSinhala ? "ලැබී ඇති මෝල් මිල ගණන්:" : "Received Mill Quotes:",
      noOffersYet: isSinhala
        ? "⏳ සහල් මෝල් වෙතින් මිල ගණන් ඉදිරිපත් වන තෙක් රැඳී සිටින්න..."
        : "⏳ Awaiting competitive quotes from certified rice mills...",
      accept: isSinhala ? "මිල පිළිගන්න" : "Accept Quote",
      reject: isSinhala ? "ප්‍රතික්ෂේප කරන්න" : "Decline",
      accepted: isSinhala ? "පිළිගත්" : "Accepted",
      rejected: isSinhala ? "ප්‍රතික්ෂේපිත" : "Declined",
      pending: isSinhala ? "පොරොත්තුවෙන්" : "Pending Decision",
      perKg: isSinhala ? "කිලෝවක් සඳහා" : "per kg",
      totalCost: isSinhala ? "ඇස්තමේන්තුගත මුළු වියදම:" : "Estimated Total Cost:",
    },
    marketGuide: {
      title: isSinhala ? "ශ්‍රී ලංකා තොග සහල් වෙළඳපොළ මිල මඟපෙන්වීම" : "National Wholesale Price Benchmark",
      nadu: "Nadu (නාඩු) ~ LKR 210 - 220/kg",
      samba: "Samba (සම්බා) ~ LKR 225 - 240/kg",
      keeriSamba: "Keeri Samba (කීරි සම්බා) ~ LKR 270 - 295/kg",
      redRaw: "Red Raw Rice (රතු කැකුළු) ~ LKR 200 - 215/kg",
      whiteRaw: "White Raw Rice (සුදු කැකුළු) ~ LKR 205 - 220/kg",
    },
    loading: isSinhala ? "දත්ත පූරණය වෙමින්..." : "Loading commercial dashboard...",
    error: isSinhala ? "දත්ත ලබාගැනීමට නොහැකි විය." : "Failed to load dashboard data.",
  };

  function authHeaders() {
    const token =
      localStorage.getItem("vee-market-token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("vee_market_token");
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
      setError("");

      // 1. Fetch Profile
      const profRes = await fetch(`${API_URL}/api/business/profile`, {
        headers,
        cache: "no-store",
      });
      if (profRes.status === 401 || profRes.status === 403) {
        router.replace("/login");
        return;
      }
      if (profRes.ok) {
        setProfile(await profRes.json());
      }

      // 2. Fetch Requirements
      const reqRes = await fetch(`${API_URL}/api/business/requirements`, {
        headers,
        cache: "no-store",
      });
      if (reqRes.ok) {
        const reqList = (await reqRes.json()) as Requirement[];
        setRequirements(reqList);

        // 3. Fetch Offers for each requirement
        const offerPromises = reqList.map(async (r) => {
          try {
            const oRes = await fetch(
              `${API_URL}/api/business/requirements/${r.id}/offers`,
              { headers, cache: "no-store" }
            );
            return [r.id, oRes.ok ? ((await oRes.json()) as Offer[]) : []] as const;
          } catch {
            return [r.id, []] as const;
          }
        });
        const pairs = await Promise.all(offerPromises);
        setOffers(Object.fromEntries(pairs));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Post Requirement
  async function handleCreateRequirement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const headers = authHeaders();
    if (!headers) return;

    if (!quantityKg || Number(quantityKg) <= 0) {
      setError(
        isSinhala
          ? "කරුණාකර වලංගු සහල් ප්‍රමාණයක් ඇතුළත් කරන්න."
          : "Please enter a valid quantity."
      );
      return;
    }

    try {
      setSubmittingReq(true);
      setError("");
      const response = await fetch(`${API_URL}/api/business/requirements`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          riceType: riceType.trim(),
          quantityKg: Number(quantityKg),
          frequency,
        }),
      });

      if (!response.ok) {
        throw new Error(
          (await response.json().catch(() => null))?.message ||
            (isSinhala
              ? "අවශ්‍යතාව පළ කිරීමට නොහැකි විය."
              : "Failed to post requirement.")
        );
      }

      const created = (await response.json()) as Requirement;
      setRequirements((prev) => [created, ...prev]);
      setOffers((prev) => ({ ...prev, [created.id]: [] }));
      setShowAddModal(false);
      setNotification(
        isSinhala
          ? `${created.riceType} (${created.quantityKg} kg) අවශ්‍යතාව සාර්ථකව පළ කරන ලදී!`
          : `Requirement for ${created.riceType} (${created.quantityKg} kg) published successfully!`
      );
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setSubmittingReq(false);
    }
  }

  // Update offer status (Accept / Reject)
  async function handleUpdateOffer(
    requirementId: number,
    offerId: number,
    newStatus: "ACCEPTED" | "REJECTED"
  ) {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setOfferActionId(offerId);
      setError("");
      const response = await fetch(
        `${API_URL}/api/business/offers/${offerId}?status=${newStatus}`,
        {
          method: "PATCH",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.json().catch(() => null))?.message ||
            (isSinhala
              ? "මිල ගණන යාවත්කාලීන කිරීමට නොහැකි විය."
              : "Failed to update offer.")
        );
      }

      const updated = (await response.json()) as Offer;

      setOffers((prev) => {
        const currentReqOffers = prev[requirementId] || [];
        const nextReqOffers = currentReqOffers.map((o) => {
          if (o.id === updated.id) return updated;
          if (newStatus === "ACCEPTED" && o.status === "PENDING") {
            return { ...o, status: "REJECTED" as const };
          }
          return o;
        });
        return { ...prev, [requirementId]: nextReqOffers };
      });

      setNotification(
        newStatus === "ACCEPTED"
          ? isSinhala
            ? `මිල යෝජනාව පිළිගන්නා ලදී! සහල් මෝල වෙත දැනුම් දී ඇත.`
            : `Offer accepted! The rice mill has been notified for fulfillment.`
          : isSinhala
          ? `මිල යෝජනාව ප්‍රතික්ෂේප කරන ලදී.`
          : `Offer declined.`
      );
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setOfferActionId(null);
    }
  }

  // Stats calculation
  const activeReqsCount = requirements.filter(
    (r) => !r.status || r.status.toUpperCase() === "ACTIVE"
  ).length;

  const totalOffersCount = useMemo(() => {
    return Object.values(offers).reduce((acc, curr) => acc + curr.length, 0);
  }, [offers]);

  const acceptedOrdersCount = useMemo(() => {
    return Object.values(offers).reduce(
      (acc, curr) => acc + curr.filter((o) => o.status === "ACCEPTED").length,
      0
    );
  }, [offers]);

  const totalVolumeKg = useMemo(() => {
    return requirements.reduce((acc, r) => acc + Number(r.quantityKg || 0), 0);
  }, [requirements]);

  const badgeText = profile?.businessType === "HOTEL" ? "Hotel" : "Shop";

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-800 dark:bg-slate-950 dark:text-white">
      {/* SHARED BRAND HEADER */}
      <VeeHeader roleBadge={badgeText} roleType="BUYER" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* BANNER / BUSINESS HEADER (MATCHES VEE MARKET GREEN HERO) */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#04351f] via-[#063b25] to-[#087f3f] p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {profile?.businessType === "HOTEL"
                    ? t.profileCard.hotel
                    : t.profileCard.shop}
                </span>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200 backdrop-blur border border-emerald-400/30">
                  ✓ {t.profileCard.status}
                </span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                {profile?.businessName || "Commercial Rice Buyer"}
              </h1>
              <p className="mt-1 text-sm text-emerald-100 flex items-center gap-2">
                <span>📍</span>
                <span>{profile?.location || "Sri Lanka"}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#087f3f] shadow-lg transition hover:bg-emerald-50 hover:shadow-xl"
              >
                <span>➕</span>
                <span>{t.postRequirement}</span>
              </button>
            </div>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-[#087f3f] dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-3">
            <span>🎉</span>
            <span>{notification}</span>
          </div>
        )}

        {/* ERROR BANNER */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.stats.activeRequirements}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-[#087f3f] dark:text-emerald-400">
              {activeReqsCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.stats.totalOffers}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {totalOffersCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.stats.acceptedOrders}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-[#087f3f] dark:text-emerald-400">
              {acceptedOrdersCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.stats.totalVolumeKg}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalVolumeKg.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span>
            </p>
          </div>
        </div>

        {/* MARKET PRICE BENCHMARK CARD */}
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 dark:border-emerald-950 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-[#063b25] dark:text-emerald-300 font-extrabold text-sm mb-3">
            <span>📈</span>
            <span>{t.marketGuide.title}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-emerald-900 dark:text-emerald-200">
            <span className="rounded-xl bg-white px-3 py-1.5 shadow-sm dark:bg-slate-900">
              🌾 {t.marketGuide.nadu}
            </span>
            <span className="rounded-xl bg-white px-3 py-1.5 shadow-sm dark:bg-slate-900">
              🌾 {t.marketGuide.samba}
            </span>
            <span className="rounded-xl bg-white px-3 py-1.5 shadow-sm dark:bg-slate-900">
              🌾 {t.marketGuide.keeriSamba}
            </span>
            <span className="rounded-xl bg-white px-3 py-1.5 shadow-sm dark:bg-slate-900">
              🌾 {t.marketGuide.redRaw}
            </span>
            <span className="rounded-xl bg-white px-3 py-1.5 shadow-sm dark:bg-slate-900">
              🌾 {t.marketGuide.whiteRaw}
            </span>
          </div>
        </div>

        {/* REQUIREMENTS LIST & OFFERS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.requirementsSection.title}
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-xl bg-[#087f3f] hover:bg-[#076f37] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              {t.postRequirement}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#087f3f] border-t-transparent mb-3" />
              <p className="font-semibold text-sm">{t.loading}</p>
            </div>
          ) : requirements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <span className="text-4xl">🌾</span>
              <p className="mt-3 font-bold text-slate-800 dark:text-slate-200">
                {t.requirementsSection.noRequirements}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-5 rounded-2xl bg-[#087f3f] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#076f37] transition"
              >
                {t.postRequirement}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {requirements.map((req) => {
                const reqOffers = offers[req.id] || [];

                return (
                  <article
                    key={req.id}
                    className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    {/* REQUIREMENT SUMMARY HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dfeee2] text-[#08763b] text-xl font-bold dark:bg-emerald-950 dark:text-emerald-300">
                          🌾
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              {req.riceType}
                            </h3>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#087f3f] border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                              {req.frequency === "WEEKLY"
                                ? isSinhala
                                  ? "සතිපතා"
                                  : "Weekly"
                                : isSinhala
                                ? "එක් වරක්"
                                : "One-time"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Demand #{req.id} • {Number(req.quantityKg).toLocaleString()} kg
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#087f3f] dark:bg-emerald-950 dark:text-emerald-300">
                          {req.status || "ACTIVE"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {reqOffers.length} {isSinhala ? "මිල ගණන්" : "Offers"}
                        </span>
                      </div>
                    </div>

                    {/* OFFERS CONTAINER */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t.requirementsSection.offersForThis}
                      </p>

                      {reqOffers.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/30">
                          {t.requirementsSection.noOffersYet}
                        </div>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                          {reqOffers.map((offer) => {
                            const isActioning = offerActionId === offer.id;
                            const totalCost = req.quantityKg * offer.pricePerKg;

                            return (
                              <div
                                key={offer.id}
                                className={`rounded-2xl border p-4 transition ${
                                  offer.status === "ACCEPTED"
                                    ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30"
                                    : offer.status === "REJECTED"
                                    ? "border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-950/40"
                                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/60"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">🏭</span>
                                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                                        {offer.millName || "Rice Mill Partner"}
                                      </p>
                                    </div>
                                    <p className="mt-2 text-xl font-black text-[#087f3f] dark:text-emerald-400">
                                      LKR {Number(offer.pricePerKg).toFixed(2)}{" "}
                                      <span className="text-xs font-normal text-slate-400">
                                        / kg
                                      </span>
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {t.requirementsSection.totalCost}{" "}
                                      <span className="font-bold text-slate-700 dark:text-slate-300">
                                        LKR {totalCost.toLocaleString()}
                                      </span>
                                    </p>
                                  </div>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                      offer.status === "ACCEPTED"
                                        ? "bg-[#087f3f] text-white"
                                        : offer.status === "REJECTED"
                                        ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                    }`}
                                  >
                                    {offer.status === "ACCEPTED"
                                      ? t.requirementsSection.accepted
                                      : offer.status === "REJECTED"
                                      ? t.requirementsSection.rejected
                                      : t.requirementsSection.pending}
                                  </span>
                                </div>

                                {offer.status === "PENDING" && (
                                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                                    <button
                                      type="button"
                                      disabled={isActioning}
                                      onClick={() =>
                                        handleUpdateOffer(
                                          req.id,
                                          offer.id,
                                          "ACCEPTED"
                                        )
                                      }
                                      className="flex-1 rounded-xl bg-[#087f3f] hover:bg-[#076f37] py-2 px-3 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
                                    >
                                      ✓ {t.requirementsSection.accept}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isActioning}
                                      onClick={() =>
                                        handleUpdateOffer(
                                          req.id,
                                          offer.id,
                                          "REJECTED"
                                        )
                                      }
                                      className="rounded-xl border border-red-200 bg-red-50 py-2 px-3 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                                    >
                                      ✕ {t.requirementsSection.reject}
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* MODAL: POST RICE REQUIREMENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-r from-[#04351f] via-[#063b25] to-[#087f3f] p-6 text-white">
              <h3 className="text-xl font-bold">{t.form.modalTitle}</h3>
              <p className="mt-1 text-xs text-emerald-100">{t.form.modalSubtitle}</p>
            </div>

            <form onSubmit={handleCreateRequirement} className="p-6 space-y-5">
              {/* RICE VARIETY */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  {t.form.riceType}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Nadu",
                    "Samba",
                    "Keeri Samba",
                    "Red Raw Rice",
                    "White Raw Rice",
                    "Basmati",
                  ].map((variety) => (
                    <button
                      key={variety}
                      type="button"
                      onClick={() => setRiceType(variety)}
                      className={`rounded-xl border p-2.5 text-xs font-bold transition text-center ${
                        riceType === variety
                          ? "border-[#087f3f] bg-emerald-50 text-[#087f3f] dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                      }`}
                    >
                      {variety}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUANTITY */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t.form.quantity}
                </label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="1000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                {/* PRESET CHIPS */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">
                    {t.form.presets}
                  </span>
                  {[250, 500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setQuantityKg(String(amt))}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {amt.toLocaleString()} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* FREQUENCY */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t.form.frequency}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFrequency("WEEKLY")}
                    className={`rounded-xl border p-3 text-left transition ${
                      frequency === "WEEKLY"
                        ? "border-[#087f3f] bg-emerald-50/80 font-bold text-[#063b25] dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "border-slate-200 bg-slate-50 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    <p className="text-sm font-bold">📅 {t.form.weekly}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {isSinhala
                        ? "සතිපතා නිතිපතා ලැබෙන සැපයුම්"
                        : "Weekly regular recurring deliveries"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFrequency("ONE_TIME")}
                    className={`rounded-xl border p-3 text-left transition ${
                      frequency === "ONE_TIME"
                        ? "border-[#087f3f] bg-emerald-50/80 font-bold text-[#063b25] dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "border-slate-200 bg-slate-50 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    <p className="text-sm font-bold">📦 {t.form.oneTime}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {isSinhala
                        ? "එක්වරක් පමණක් ලබාගන්නා තොගය"
                        : "Single order fulfillment batch"}
                    </p>
                  </button>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  {t.form.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="rounded-xl bg-[#087f3f] hover:bg-[#076f37] px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                >
                  {submittingReq ? t.form.submitting : t.form.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
