"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";
import { Button, Input, StatusBadge, EmptyState, ErrorBanner } from "../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type MillProfile = {
  id: number;
  millName: string;
  location?: string | null;
  registrationNumber: string;
  millingCapacityKgPerDay: number;
  verificationStatus: string;
};

type MillLot = {
  lotId: number;
  farmId: number;
  productType: string;
  riceType?: string | null;
  quantityKg: number;
  askingPricePerKg: number;
  availableDate: string;
  status: string;
  latestMoisturePercentage?: number | null;
  latestMoistureDeviceNumber?: string | null;
};

type Bid = {
  bidId: number;
  lotId: number;
  bidPricePerKg: number;
  status: string;
};

export default function MillDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [profile, setProfile] = useState<MillProfile | null>(null);
  const [lots, setLots] = useState<MillLot[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingLotId, setSubmittingLotId] = useState<number | null>(null);
  const [withdrawingBidId, setWithdrawingBidId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [bidValues, setBidValues] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<"LOTS" | "MY_BIDS" | "PROFILE">("LOTS");

  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    millName: "",
    location: "",
    registrationNumber: "",
    millingCapacityKgPerDay: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const t = useMemo(
    () => ({
      title: isSinhala ? "සහල් මෝල් පාලන පුවරුව" : "Rice Mill Procurement",
      subtitle: isSinhala
        ? "ලබාගත හැකි සියලුම ගොවි වී තොග සහ තෙතමන මට්ටම් නිරීක්ෂණය කර තරගකාරී මිල ගණන් ඉදිරිපත් කරන්න."
        : "Discover farmer paddy lots, inspect certified moisture levels, and place direct competitive bids.",
      tabs: {
        lots: isSinhala ? "ලබාගත හැකි වී තොග" : "Available Paddy Lots",
        myBids: isSinhala ? "මා ඉදිරිපත් කළ මිල ගණන්" : "My Placed Bids",
        profile: isSinhala ? "මෝල් පැතිකඩ" : "Mill Credentials",
      },
      lotCard: {
        lot: isSinhala ? "වී තොගය" : "Paddy Lot",
        quantity: isSinhala ? "ප්‍රමාණය" : "Volume",
        askingPrice: isSinhala ? "ගොවියාගේ ඉල්ලුම් මිල" : "Asking Price",
        moisture: isSinhala ? "තෙතමනය" : "Moisture Content",
        availableDate: isSinhala ? "ලබාගත හැකි දිනය" : "Available Date",
        yourBid: isSinhala ? "ඔබේ ලංසුව / kg (LKR)" : "Your Bid / kg (LKR)",
        placeBidBtn: isSinhala ? "මිල ගණන ඉදිරිපත් කරන්න" : "Place Bid",
        bidding: isSinhala ? "ඉදිරිපත් කරමින්..." : "Submitting...",
      },
      bids: {
        withdrawBtn: isSinhala ? "ලංසුව ඉවත් කරගන්න" : "Withdraw Bid",
        withdrawing: isSinhala ? "ඉවත් කරමින්..." : "Withdrawing...",
        noBidsTitle: isSinhala ? "තවමත් ලංසු ඉදිරිපත් කර නැත" : "No Bids Placed Yet",
        noBidsDesc: isSinhala
          ? "ලබාගත හැකි වී තොග පරීක්ෂා කර මිල ගණන් ඉදිරිපත් කරන්න."
          : "Browse available farmer lots and place competitive bids to secure paddy supply.",
      },
      requirementsBanner: {
        title: isSinhala ? "🏪 සාප්පු හා හෝටල් සහල් ඉල්ලුම්" : "🏪 Wholesale Buyer Requirements",
        desc: isSinhala
          ? "සුපිරි වෙළඳසැල් සහ හෝටල් විසින් පළ කර ඇති තොග සහල් අවශ්‍යතා සඳහා ඔබේ මිල ඉදිරිපත් කරන්න."
          : "View wholesale rice requirements posted by shops & restaurants and submit price quotes.",
        action: isSinhala ? "ව්‍යාපාරික ඉල්ලුම් බලන්න →" : "View Commercial Demands →",
      },
      loadingText: isSinhala ? "දත්ත ලබාගනිමින්..." : "Loading mill dashboard...",
      errorText: isSinhala ? "දත්ත ලබාගැනීමට නොහැකි විය." : "Failed to load data.",
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

      const [profileRes, lotsRes, bidsRes] = await Promise.all([
        fetch(`${API_URL}/api/mill/profile`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/mill/lots`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/mill/bids`, { headers, cache: "no-store" }),
      ]);

      if (profileRes.status === 401 || lotsRes.status === 401) {
        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (profileRes.ok) {
        const pData = (await profileRes.json()) as MillProfile;
        setProfile(pData);
        setProfileForm({
          millName: pData.millName || "",
          location: pData.location || "",
          registrationNumber: pData.registrationNumber || "",
          millingCapacityKgPerDay: String(pData.millingCapacityKgPerDay || ""),
        });
      }

      if (lotsRes.ok) {
        setLots(await lotsRes.json());
      }

      if (bidsRes.ok) {
        setBids(await bidsRes.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [router]);

  async function handlePlaceBid(lotId: number) {
    const headers = authHeaders();
    if (!headers) return;

    const val = Number(bidValues[lotId]);
    if (!val || val <= 0) {
      setError(isSinhala ? "කරුණාකර වලංගු මිලක් ඇතුළත් කරන්න." : "Please enter a valid price per kg.");
      return;
    }

    try {
      setSubmittingLotId(lotId);
      setError(null);

      const res = await fetch(`${API_URL}/api/mill/lots/${lotId}/bids`, {
        method: "POST",
        headers,
        body: JSON.stringify({ bidPricePerKg: val }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || "Failed to submit bid");
      }

      const newBid = (await res.json()) as Bid;
      setBids((prev) => [newBid, ...prev]);
      setBidValues((prev) => ({ ...prev, [lotId]: "" }));
      setNotification(isSinhala ? "මිල ගණන සාර්ථකව ඉදිරිපත් කරන ලදී!" : "Bid placed successfully!");
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting bid");
    } finally {
      setSubmittingLotId(null);
    }
  }

  async function handleWithdrawBid(bidId: number) {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setWithdrawingBidId(bidId);
      setError(null);

      const res = await fetch(`${API_URL}/api/mill/bids/${bidId}/withdraw`, {
        method: "POST",
        headers,
      });

      if (!res.ok) throw new Error("Could not withdraw bid");

      setBids((prev) =>
        prev.map((b) => (b.bidId === bidId ? { ...b, status: "WITHDRAWN" } : b))
      );
      setNotification(isSinhala ? "ලංසුව ඉවත් කරගන්නා ලදී." : "Bid withdrawn.");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error withdrawing bid");
    } finally {
      setWithdrawingBidId(null);
    }
  }

  async function handleSaveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const headers = authHeaders();
    if (!headers) return;

    try {
      setSavingProfile(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/mill/profile`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          millName: profileForm.millName.trim(),
          location: profileForm.location.trim() || null,
          registrationNumber: profileForm.registrationNumber.trim(),
          millingCapacityKgPerDay: Number(profileForm.millingCapacityKgPerDay) || 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updated = (await res.json()) as MillProfile;
      setProfile(updated);
      setNotification(isSinhala ? "මෝල් පැතිකඩ සාර්ථකව සුරකින ලදී!" : "Mill profile saved successfully!");
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "සහල් මෝල" : "Rice Mill"} roleType="MILL" />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile ? profile.millName : t.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <Link href="/dashboard/mill/requirements">
            <Button variant="secondary" size="md" className="w-full sm:w-auto font-bold">
              {t.requirementsBanner.action}
            </Button>
          </Link>
        </div>

        {error && <ErrorBanner message={error} onRetry={loadData} />}

        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ {notification}
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("LOTS")}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition select-none ${
              activeTab === "LOTS"
                ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            🌾 {t.tabs.lots} ({lots.length})
          </button>
          <button
            onClick={() => setActiveTab("MY_BIDS")}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition select-none ${
              activeTab === "MY_BIDS"
                ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            🤝 {t.tabs.myBids} ({bids.length})
          </button>
          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition select-none ${
              activeTab === "PROFILE"
                ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            🏭 {t.tabs.profile}
          </button>
        </div>

        {/* TAB 1: AVAILABLE LOTS */}
        {activeTab === "LOTS" && (
          <div className="space-y-4">
            {loading ? (
              <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
                <p className="font-semibold">{t.loadingText}</p>
              </div>
            ) : lots.length === 0 ? (
              <EmptyState
                title={isSinhala ? "දැනට ලබාගත හැකි වී තොග නොමැත" : "No Active Lots Found"}
                description={
                  isSinhala
                    ? "ගොවීන් විසින් නව වී තොග පළ කළ පසු මෙහි දිස්වනු ඇත."
                    : "Farmer lots will appear here once registered on the marketplace."
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lots.map((lot) => {
                  return (
                    <article
                      key={lot.lotId}
                      className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                              Lot #{lot.lotId}
                            </span>
                            <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
                              {lot.riceType || lot.productType}
                            </h2>
                          </div>
                          <StatusBadge status={lot.status || "ACTIVE"} size="sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-950/60">
                          <div>
                            <p className="text-[11px] font-bold text-slate-400">{t.lotCard.quantity}</p>
                            <p className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-white">
                              {lot.quantityKg?.toLocaleString()} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-400">{t.lotCard.askingPrice}</p>
                            <p className="mt-0.5 text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                              LKR {lot.askingPricePerKg}
                            </p>
                          </div>
                        </div>

                        {/* MOISTURE STATUS */}
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 dark:border-emerald-900/40 dark:bg-emerald-950/30 text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            💧 {t.lotCard.moisture}:{" "}
                          </span>
                          {lot.latestMoisturePercentage !== null &&
                          lot.latestMoisturePercentage !== undefined ? (
                            <span className="font-extrabold text-[#087f3f] dark:text-emerald-300">
                              {lot.latestMoisturePercentage}% (Verified IoT)
                            </span>
                          ) : (
                            <span className="text-slate-400">Not tested yet</span>
                          )}
                        </div>
                      </div>

                      {/* BIDDING CONTROL */}
                      <div className="border-t border-slate-100 pt-3 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            step="0.5"
                            placeholder="e.g. 125.00"
                            value={bidValues[lot.lotId] || ""}
                            onChange={(e) =>
                              setBidValues({ ...bidValues, [lot.lotId]: e.target.value })
                            }
                            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
                          />
                          <Button
                            onClick={() => handlePlaceBid(lot.lotId)}
                            variant="primary"
                            size="md"
                            loading={submittingLotId === lot.lotId}
                            className="font-bold shrink-0"
                          >
                            {t.lotCard.placeBidBtn}
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY BIDS */}
        {activeTab === "MY_BIDS" && (
          <div className="space-y-4">
            {bids.length === 0 ? (
              <EmptyState
                title={t.bids.noBidsTitle}
                description={t.bids.noBidsDesc}
                icon="🤝"
                actionLabel={isSinhala ? "වී තොග බලන්න" : "Browse Available Lots"}
                onAction={() => setActiveTab("LOTS")}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bids.map((b) => (
                  <article
                    key={b.bidId}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Bid #{b.bidId}
                          </span>
                          <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
                            Lot #{b.lotId}
                          </h2>
                        </div>
                        <StatusBadge status={b.status || "PENDING"} size="md" />
                      </div>

                      <div className="mt-3 rounded-2xl bg-emerald-50/70 p-4 dark:bg-emerald-950/40">
                        <p className="text-xs font-bold text-slate-400">Offered Price</p>
                        <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                          LKR {b.bidPricePerKg} / kg
                        </p>
                      </div>
                    </div>

                    {b.status === "PENDING" && (
                      <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Button
                          onClick={() => handleWithdrawBid(b.bidId)}
                          variant="outline"
                          size="sm"
                          fullWidth
                          loading={withdrawingBidId === b.bidId}
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                        >
                          {t.bids.withdrawBtn}
                        </Button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MILL PROFILE */}
        {activeTab === "PROFILE" && (
          <form
            onSubmit={handleSaveProfile}
            className="max-w-2xl mx-auto space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              🏭 {t.tabs.profile}
            </h2>

            <Input
              label={isSinhala ? "මෝලේ නම" : "Rice Mill Name"}
              required
              value={profileForm.millName}
              onChange={(e) =>
                setProfileForm({ ...profileForm, millName: e.target.value })
              }
            />

            <Input
              label={isSinhala ? "ස්ථානය" : "Location"}
              value={profileForm.location}
              onChange={(e) =>
                setProfileForm({ ...profileForm, location: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={isSinhala ? "ලියාපදිංචි අංකය" : "Registration Number"}
                value={profileForm.registrationNumber}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    registrationNumber: e.target.value,
                  })
                }
              />

              <Input
                label={isSinhala ? "දිනක ඇඹරුම් ධාරිතාව (kg)" : "Daily Milling Capacity (kg)"}
                type="number"
                value={profileForm.millingCapacityKgPerDay}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    millingCapacityKgPerDay: e.target.value,
                  })
                }
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={savingProfile}
                className="font-bold"
              >
                {isSinhala ? "පැතිකඩ සුරකින්න" : "Save Mill Profile"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
