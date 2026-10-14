"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "../../../components/LanguageProvider";
import VeeHeader from "../../../components/VeeHeader";
import MoistureMeterModal, {
  DeviceReadingResult,
} from "../../../components/MoistureMeterModal";
import { Button, StatusBadge, EmptyState, ErrorBanner } from "../../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Lot = {
  id: number;
  farmId: number;
  farmName?: string | null;
  productType: string;
  riceType?: string | null;
  quantityKg: number;
  askingPricePerKg: number;
  availableDate?: string;
  status: string;
  createdAt?: string;
};

type Farm = {
  id: number;
  farmerId: number;
  farmName: string;
  location?: string | null;
  landSize?: number | null;
  mainCrop?: string | null;
};

type MoistureReading = {
  id: number;
  lotId?: number;
  deviceNumber: string;
  moisturePercentage: number;
  measuredAt: string;
};

type Bid = {
  bidId: number;
  lotId: number;
  millUserId: number;
  bidPricePerKg: number;
  status: string;
  createdAt: string;
};

export default function PaddyLotDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const lotId = Number(params?.id);

  const [lot, setLot] = useState<Lot | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [moisture, setMoisture] = useState<MoistureReading[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showMoistureModal, setShowMoistureModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "MOISTURE" | "OFFERS">("SUMMARY");

  const [confirmBidAction, setConfirmBidAction] = useState<{
    bidId: number;
    action: "accept" | "reject";
    price: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      back: isSinhala ? "← මගේ වී තොග වෙත" : "← Back to My Lots",
      badge: isSinhala ? "වී තොගය" : "Paddy Lot",
      title: isSinhala ? "වී තොග විස්තර" : "Paddy Lot Details",
      tabs: {
        summary: isSinhala ? "තොග විස්තර" : "Lot Summary",
        moisture: isSinhala ? "තෙතමන පරීක්ෂාව" : "Moisture Meter",
        offers: isSinhala ? "ලැබුණු මිල ගණන්" : "Buyer Offers",
      },
      lotNumber: isSinhala ? "තොග අංකය" : "Lot ID",
      quantity: isSinhala ? "ප්‍රමාණය" : "Quantity",
      askingPrice: isSinhala ? "ඉල්ලුම් මිල" : "Asking Price",
      availableDate: isSinhala ? "ලබාගත හැකි දිනය" : "Available Date",
      riceType: isSinhala ? "වී වර්ගය" : "Rice Variety",
      farm: isSinhala ? "ගොවිපළ" : "Farm",
      location: isSinhala ? "ස්ථානය" : "Location",
      landSize: isSinhala ? "ඉඩම් ප්‍රමාණය" : "Land Size",
      acres: isSinhala ? "අක්කර" : "acres",
      moistureHeader: isSinhala ? "ස්මාර්ට් තෙතමන පරීක්ෂාව" : "IoT Moisture Inspection",
      startMoistureTest: isSinhala ? "⚡ තෙතමන පරීක්ෂාව ආරම්භ කරන්න" : "⚡ Start Moisture Test",
      latestReading: isSinhala ? "නවතම තෙතමන මිනුම" : "Latest Moisture Reading",
      noMoistureTitle: isSinhala ? "තවමත් තෙතමන පරීක්ෂාවක් කර නැත" : "No Moisture Test Recorded",
      noMoistureDesc: isSinhala
        ? "ස්මාර්ට් තෙතමන මාපකය සම්බන්ධ කර පරීක්ෂා කිරීමෙන් සහතික කළ කියවීමක් ලබාගත හැක."
        : "Connect the ESP32 IoT moisture meter to record a verified moisture reading for this lot.",
      readingPercentage: isSinhala ? "තෙතමන ප්‍රතිශතය" : "Moisture Percentage",
      readingDevice: isSinhala ? "උපාංගය" : "Device",
      readingDate: isSinhala ? "මනින ලද දිනය" : "Measured Date",
      offersHeader: isSinhala ? "මෝල් වෙතින් ලැබුණු මිල ගණන්" : "Offers from Rice Mills",
      noOffersTitle: isSinhala ? "තවමත් මිල ගණන් ලැබී නැත" : "No Offers Yet",
      noOffersDesc: isSinhala
        ? "සහල් මෝල් හිමියන් ඔබේ තොගය දැක මිල ඉදිරිපත් කළ පසු මෙහි දිස්වනු ඇත."
        : "Offers submitted by rice mills will appear here in real time.",
      millBuyer: isSinhala ? "සහල් මෝල" : "Rice Mill",
      offeredPrice: isSinhala ? "ඉදිරිපත් කළ මිල" : "Offered Price",
      totalOfferValue: isSinhala ? "මුළු වටිනාකම" : "Gross Contract Value",
      acceptBtn: isSinhala ? "පිළිගන්න" : "Accept Offer",
      rejectBtn: isSinhala ? "ප්‍රතික්ෂේප කරන්න" : "Decline",
      confirmTitle: isSinhala ? "ලංසුව පිළිගැනීම තහවුරු කරන්න" : "Confirm Offer Acceptance",
      confirmDesc: isSinhala
        ? "මෙම මිල ගණන පිළිගත් පසු අනෙකුත් සියලුම පොරොත්තු ලංසු ස්වයංක්‍රීයව අවලංගු වේ. ඉදිරියට යන්නද?"
        : "Accepting this offer will create a binding deal and automatically decline all other pending bids. Proceed?",
      confirmYes: isSinhala ? "ඔව්, පිළිගන්න" : "Yes, Accept Offer",
      confirmCancel: isSinhala ? "අවලංගු කරන්න" : "Cancel",
      successAccepted: isSinhala
        ? "මිල ගණන සාර්ථකව පිළිගන්නා ලදී! ගනුදෙනු ලැයිස්තුවට ඇතුළත් විය."
        : "Offer accepted successfully! Deal created.",
      successRejected: isSinhala ? "මිල ගණන ප්‍රතික්ෂේප කරන ලදී." : "Offer was declined.",
      successMoisture: isSinhala
        ? "තෙතමන මිනුම සාර්ථකව සටහන් විය!"
        : "Moisture reading recorded successfully!",
      loadingText: isSinhala ? "තොග තොරතුරු ලබාගනිමින්..." : "Loading lot details...",
      errorText: isSinhala ? "තොරතුරු ලබාගැනීමට නොහැකි විය." : "Unable to load lot details.",
      kg: "kg",
    }),
    [isSinhala]
  );

  function getToken() {
    return (
      localStorage.getItem("vee-market-token") ||
      localStorage.getItem("token")
    );
  }

  async function loadData() {
    if (!lotId || Number.isNaN(lotId)) {
      setError(isSinhala ? "තොග අංකය හමු නොවීය." : "Invalid lot ID.");
      setLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      // 1. Fetch single lot or find in list
      let currentLot: Lot | null = null;
      try {
        const lotRes = await fetch(`${API_URL}/api/farmer/lots/${lotId}`, {
          headers,
          cache: "no-store",
        });
        if (lotRes.ok) {
          currentLot = (await lotRes.json()) as Lot;
        }
      } catch (e) {
        console.warn("Direct lot fetch failed:", e);
      }

      if (!currentLot) {
        const listRes = await fetch(`${API_URL}/api/farmer/lots`, {
          headers,
          cache: "no-store",
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          const list = Array.isArray(listData) ? listData : listData?.content || [];
          currentLot = list.find((item: Lot) => item.id === lotId) || null;
        }
      }

      if (!currentLot) {
        throw new Error(isSinhala ? "අදාළ වී තොගය හමු නොවීය." : "Paddy lot not found.");
      }
      setLot(currentLot);

      // 2. Fetch Farm info
      if (currentLot.farmId) {
        try {
          const farmsRes = await fetch(`${API_URL}/api/farmer/farms`, {
            headers,
            cache: "no-store",
          });
          if (farmsRes.ok) {
            const fData = await farmsRes.json();
            const farmList: Farm[] = Array.isArray(fData) ? fData : fData?.content || [];
            const matched = farmList.find((f) => f.id === currentLot?.farmId);
            if (matched) setFarm(matched);
          }
        } catch (fErr) {
          console.warn("Could not load farm detail:", fErr);
        }
      }

      // 3. Fetch Moisture readings
      try {
        const mRes = await fetch(`${API_URL}/api/farmer/lots/${lotId}/moisture`, {
          headers,
          cache: "no-store",
        });
        if (mRes.ok) {
          const mData = await mRes.json();
          setMoisture(Array.isArray(mData) ? mData : []);
        }
      } catch (mErr) {
        console.warn("Could not load moisture readings:", mErr);
      }

      // 4. Fetch Bids
      try {
        const bRes = await fetch(`${API_URL}/api/farmer/lots/${lotId}/bids`, {
          headers,
          cache: "no-store",
        });
        if (bRes.ok) {
          const bData = await bRes.json();
          setBids(Array.isArray(bData) ? bData : []);
        }
      } catch (bErr) {
        console.warn("Could not load bids:", bErr);
      }
    } catch (err) {
      console.error("Load lot details fatal error:", err);
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [lotId]);

  async function handleBidAction(bidId: number, action: "accept" | "reject") {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setActionLoading(bidId);
      setError(null);

      const res = await fetch(`${API_URL}/api/farmer/bids/${bidId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Failed to ${action} bid`);
      }

      setConfirmBidAction(null);
      setSuccessMessage(action === "accept" ? t.successAccepted : t.successRejected);
      setTimeout(() => setSuccessMessage(null), 4000);

      // Refresh lot and bids
      await loadData();
    } catch (err) {
      console.error(`Bid ${action} error:`, err);
      setError(err instanceof Error ? err.message : "Error performing bid action");
    } finally {
      setActionLoading(null);
    }
  }

  function handleDeviceTestComplete(reading: DeviceReadingResult) {
    setShowMoistureModal(false);
    setSuccessMessage(t.successMoisture);
    setTimeout(() => setSuccessMessage(null), 4000);

    const newReading: MoistureReading = {
      id: Date.now(),
      lotId,
      deviceNumber: reading.label || "IoT Device",
      moisturePercentage: reading.moisture_pct,
      measuredAt: reading.received_at,
    };
    setMoisture((prev) => [newReading, ...prev]);
  }

  const latestMoisture = moisture.length > 0 ? moisture[0] : null;

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={`Lot #${lotId}`} roleType="FARMER" />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* TOP BAR / BACK NAVIGATION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/dashboard/listings"
              className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              {t.back}
            </Link>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {lot?.riceType || lot?.productType || "Paddy"} #{lotId}
              </h1>
              {lot && <StatusBadge status={lot.status || "ACTIVE"} size="md" />}
            </div>
          </div>

          {/* PRIMARY CTAS */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowMoistureModal(true)}
              variant="primary"
              size="md"
              className="font-extrabold shadow-sm"
            >
              {t.startMoistureTest}
            </Button>
          </div>
        </div>

        {error && <ErrorBanner message={error} onRetry={loadData} />}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ {successMessage}
          </div>
        )}

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("SUMMARY")}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition select-none ${
              activeTab === "SUMMARY"
                ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            📋 {t.tabs.summary}
          </button>
          <button
            onClick={() => setActiveTab("MOISTURE")}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition select-none ${
              activeTab === "MOISTURE"
                ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            💧 {t.tabs.moisture} {latestMoisture ? `(${latestMoisture.moisturePercentage}%)` : ""}
          </button>
          <button
            onClick={() => setActiveTab("OFFERS")}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition select-none ${
              activeTab === "OFFERS"
                ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            🤝 {t.tabs.offers} ({bids.length})
          </button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold">{t.loadingText}</p>
          </div>
        ) : lot ? (
          <div className="space-y-6">
            {/* TAB 1: SUMMARY */}
            {activeTab === "SUMMARY" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LOT DETAILS */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
                    🌾 {t.tabs.summary}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <p className="text-xs font-bold text-slate-400">{t.quantity}</p>
                      <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                        {lot.quantityKg?.toLocaleString()} {t.kg}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                      <p className="text-xs font-bold text-slate-400">{t.askingPrice}</p>
                      <p className="mt-1 text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        LKR {lot.askingPricePerKg}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm pt-2">
                    <p className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                      <span className="text-slate-500">{t.riceType}:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {lot.riceType || lot.productType}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                      <span className="text-slate-500">{t.availableDate}:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {lot.availableDate || "Immediate"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* FARM DETAILS */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
                    🏡 {farm ? farm.farmName : t.farm}
                  </h2>
                  {farm ? (
                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                        <p className="text-xs font-bold text-slate-400">{t.location}</p>
                        <p className="mt-1 text-base font-bold text-slate-800 dark:text-slate-200">
                          {farm.location || "Sri Lanka"}
                        </p>
                      </div>
                      <p className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                        <span className="text-slate-500">{t.landSize}:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {farm.landSize || 0} {t.acres}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Farm details unavailable.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MOISTURE METER */}
            {activeTab === "MOISTURE" && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      💧 {t.moistureHeader}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isSinhala
                        ? "ESP32 තෙතමන මාපකයෙන් සත්‍යාපිත කියවීම් මෙතැනින් පරීක්ෂා කරන්න."
                        : "Verified IoT hardware readings recorded for this paddy lot."}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowMoistureModal(true)}
                    variant="primary"
                    size="md"
                    className="font-bold shadow-sm"
                  >
                    {t.startMoistureTest}
                  </Button>
                </div>

                {latestMoisture ? (
                  <div className="space-y-6">
                    {/* LATEST READING HIGHLIGHT */}
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 dark:border-emerald-800/80 dark:bg-emerald-950/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#087f3f] dark:text-emerald-400">
                          {t.latestReading}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                          ✓ Device Verified
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                          {latestMoisture.moisturePercentage}%
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          (Target safe storage: 12.0% - 14.0%)
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
                        <span>📟 {t.readingDevice}: {latestMoisture.deviceNumber}</span>
                        <span>📅 {t.readingDate}: {new Date(latestMoisture.measuredAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* HISTORY */}
                    {moisture.length > 1 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {isSinhala ? "පෙර මිනුම් ඉතිහාසය" : "Test History"}
                        </h3>
                        {moisture.slice(1).map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/50"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {m.moisturePercentage}% ({m.deviceNumber})
                            </span>
                            <span className="text-slate-400">
                              {new Date(m.measuredAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title={t.noMoistureTitle}
                    description={t.noMoistureDesc}
                    icon="💧"
                    actionLabel={t.startMoistureTest}
                    onAction={() => setShowMoistureModal(true)}
                  />
                )}
              </div>
            )}

            {/* TAB 3: OFFERS / BIDS */}
            {activeTab === "OFFERS" && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
                <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    🤝 {t.offersHeader} ({bids.length})
                  </h2>
                </div>

                {bids.length === 0 ? (
                  <EmptyState
                    title={t.noOffersTitle}
                    description={t.noOffersDesc}
                    icon="🤝"
                  />
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => {
                      const totalOffer = (bid.bidPricePerKg || 0) * (lot.quantityKg || 0);
                      const isPending = !bid.status || bid.status.toUpperCase() === "PENDING";
                      const isAccepted = bid.status && bid.status.toUpperCase() === "ACCEPTED";

                      return (
                        <div
                          key={bid.bidId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/40"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {t.millBuyer} #{bid.millUserId}
                              </span>
                              <StatusBadge status={bid.status || "PENDING"} size="sm" />
                            </div>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                              LKR {bid.bidPricePerKg}{" "}
                              <span className="text-xs font-semibold text-slate-400">/ kg</span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {t.totalOfferValue}:{" "}
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                LKR {totalOffer.toLocaleString()}
                              </span>
                            </p>
                          </div>

                          {/* ACTION CONTROLS */}
                          {isPending && lot.status?.toUpperCase() !== "SOLD" && (
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() =>
                                  setConfirmBidAction({
                                    bidId: bid.bidId,
                                    action: "accept",
                                    price: bid.bidPricePerKg,
                                  })
                                }
                                variant="primary"
                                size="sm"
                                loading={actionLoading === bid.bidId}
                                className="font-bold"
                              >
                                {t.acceptBtn}
                              </Button>
                              <Button
                                onClick={() => handleBidAction(bid.bidId, "reject")}
                                variant="outline"
                                size="sm"
                                loading={actionLoading === bid.bidId}
                                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                              >
                                {t.rejectBtn}
                              </Button>
                            </div>
                          )}

                          {isAccepted && (
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              ✓ {isSinhala ? "පිළිගත් ලංසුව" : "Winning Offer"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* CONFIRM ACCEPTANCE MODAL */}
        {confirmBidAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t.confirmTitle}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {t.confirmDesc}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  onClick={() => setConfirmBidAction(null)}
                  variant="outline"
                  size="md"
                >
                  {t.confirmCancel}
                </Button>
                <Button
                  onClick={() =>
                    handleBidAction(confirmBidAction.bidId, confirmBidAction.action)
                  }
                  variant="primary"
                  size="md"
                  loading={actionLoading === confirmBidAction.bidId}
                  className="font-bold"
                >
                  {t.confirmYes}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MOISTURE METER MODAL */}
        <MoistureMeterModal
          isOpen={showMoistureModal}
          onClose={() => setShowMoistureModal(false)}
          lotId={lotId}
          lotCode={`LOT-${lotId}`}
          onTestComplete={handleDeviceTestComplete}
          isSinhala={isSinhala}
        />
      </div>
    </main>
  );
}
