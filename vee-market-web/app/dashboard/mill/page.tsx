"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://172.18.228.12:8080";

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

type Deal = {
  dealId: number;
  bidId: number;
  lotId: number;
  agreedPricePerKg: number;
  quantityKg: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
};

export default function MillDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [profile, setProfile] = useState<MillProfile | null>(null);
  const [lots, setLots] = useState<MillLot[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingLot, setSubmittingLot] = useState<number | null>(null);
  const [withdrawingBid, setWithdrawingBid] = useState<number | null>(null);
  const [confirmingDeal, setConfirmingDeal] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [profileForm, setProfileForm] = useState({
    millName: "",
    location: "",
    registrationNumber: "",
    millingCapacityKgPerDay: "",
  });
  const [bidValues, setBidValues] = useState<Record<number, string>>({});

  const text = isSinhala
    ? {
        title: "මෝල් පුවරුව",
        subtitle: "ගොවිපළවල වී තොග සොයා මිල ගණන් ඉදිරිපත් කරන්න.",
        profile: "මෝල් පැතිකඩ",
        millName: "මෝලේ නම",
        location: "ස්ථානය",
        registration: "ලියාපදිංචි අංකය",
        capacity: "දිනකට ඇඹරුම් ධාරිතාව (කිලෝග්‍රෑම්)",
        saveProfile: "පැතිකඩ සුරකින්න",
        saving: "සුරකිමින්...",
        availableLots: "ලබාගත හැකි වී තොග",
        noLots: "දැනට ලබාගත හැකි වී තොග නොමැත.",
        quantity: "ප්‍රමාණය",
        askingPrice: "ඉල්ලුම් මිල",
        moisture: "තෙතමනය",
        available: "ලබාගත හැකි දිනය",
        activeLots: "සක්‍රීය තොග",
        pending: "පොරොත්තුවෙන්",
        accepted: "පිළිගත්",
        rejected: "ප්‍රතික්ෂේප කළ",
        withdrawn: "ඉවත් කර ඇත",
        bid: "ඔබේ මිල ගණන / කිලෝග්‍රෑම්",
        placeBid: "මිල ගණන ඉදිරිපත් කරන්න",
        bidding: "ඉදිරිපත් කරමින්...",
        myBids: "මගේ මිල ගණන්",
        noBids: "ඔබ තවමත් මිල ගණනක් ඉදිරිපත් කර නැත.",
        withdraw: "ඉවත් කරන්න",
        withdrawing: "ඉවත් කරමින්...",
        deals: "ගනුදෙනු",
        noDeals: "තවමත් ගනුදෙනු නොමැත.",
        confirm: "තහවුරු කරන්න",
        confirming: "තහවුරු කරමින්...",
        payment: "ගෙවීම",
        delivery: "බෙදාහැරීම",
        markPaid: "ගෙවූ බව සලකුණු කරන්න",
        confirmPayment: "ගෙවීම තහවුරු කරන්න",
        scheduleDelivery: "බෙදාහැරීම සැලසුම් කරන්න",
        markInTransit: "ගමන් කරමින් ලෙස සලකුණු කරන්න",
        markDelivered: "ලබාදුන් ලෙස සලකුණු කරන්න",
        profileRequired: "පළමුව ඔබේ මෝල් පැතිකඩ සම්පූර්ණ කරන්න.",
        loading: "පූරණය වෙමින්...",
        retry: "නැවත උත්සාහ කරන්න",
        logout: "ඉවත් වන්න",
        error: "දෝෂයක් සිදුවිය",
      }
    : {
        title: "Mill Dashboard",
        subtitle: "Find farmer lots and submit competitive offers.",
        profile: "Mill Profile",
        millName: "Mill Name",
        location: "Location",
        registration: "Registration Number",
        capacity: "Daily Milling Capacity (kg)",
        saveProfile: "Save Profile",
        saving: "Saving...",
        availableLots: "Available Paddy Lots",
        noLots: "No active paddy lots are available right now.",
        quantity: "Quantity",
        askingPrice: "Asking Price",
        moisture: "Moisture",
        available: "Available",
        activeLots: "active lots",
        pending: "Pending",
        accepted: "Accepted",
        rejected: "Rejected",
        withdrawn: "Withdrawn",
        bid: "Your bid per kilogram",
        placeBid: "Place Bid",
        bidding: "Submitting...",
        myBids: "My Bids",
        noBids: "You have not placed any bids yet.",
        withdraw: "Withdraw",
        withdrawing: "Withdrawing...",
        deals: "Deals",
        noDeals: "No deals yet.",
        confirm: "Confirm",
        confirming: "Confirming...",
        payment: "Payment",
        delivery: "Delivery",
        markPaid: "Mark Paid",
        confirmPayment: "Confirm Payment",
        scheduleDelivery: "Schedule Delivery",
        markInTransit: "Mark In Transit",
        markDelivered: "Mark Delivered",
        profileRequired: "Complete your mill profile before browsing lots.",
        loading: "Loading...",
        retry: "Retry",
        logout: "Logout",
        error: "Something went wrong",
      };

  function token() {
    return (
      localStorage.getItem("vee-market-token") ||
      localStorage.getItem("token")
    );
  }

  async function apiError(response: Response) {
    const raw = await response.text();
    try {
      const data = JSON.parse(raw);
      return data?.message || data?.error || `HTTP ${response.status}`;
    } catch {
      return raw || `HTTP ${response.status}`;
    }
  }

  async function loadWorkspace() {
    const authToken = token();
    if (!authToken) {
      router.replace("/login");
      return;
    }

    const role = localStorage.getItem("vee-market-user-role");
    if (role === "FARMER") {
      router.replace("/dashboard");
      return;
    }
    if (role === "BUYER") {
      router.replace("/dashboard/business");
      return;
    }
    if (role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }

    setLoading(true);
    setError("");
    const headers = {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    };

    try {
      const profileResponse = await fetch(`${API_URL}/api/mill/profile`, {
        headers,
        cache: "no-store",
      });

      if (profileResponse.status === 401 || profileResponse.status === 403) {
        router.replace("/login");
        return;
      }

      if (profileResponse.status === 404) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!profileResponse.ok) {
        throw new Error(await apiError(profileResponse));
      }

      const profileData = (await profileResponse.json()) as MillProfile;
      setProfile(profileData);

      const [lotsResponse, bidsResponse, dealsResponse] = await Promise.all([
        fetch(`${API_URL}/api/mill/lots`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/mill/bids`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/mill/deals`, { headers, cache: "no-store" }),
      ]);

      if (!lotsResponse.ok) {
        throw new Error(await apiError(lotsResponse));
      }
      if (!bidsResponse.ok) {
        throw new Error(await apiError(bidsResponse));
      }
      if (!dealsResponse.ok) {
        throw new Error(await apiError(dealsResponse));
      }

      setLots((await lotsResponse.json()) as MillLot[]);
      setBids((await bidsResponse.json()) as Bid[]);
      setDeals((await dealsResponse.json()) as Deal[]);
    } catch (cause) {
      console.error("Mill workspace error:", cause);
      setError(cause instanceof Error ? cause.message : text.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspace();
    // The workspace should reload when the selected language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const authToken = token();
    if (!authToken) {
      router.replace("/login");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      const response = await fetch(`${API_URL}/api/mill/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          millName: profileForm.millName.trim(),
          location: profileForm.location.trim() || null,
          registrationNumber: profileForm.registrationNumber.trim(),
          millingCapacityKgPerDay: Number(profileForm.millingCapacityKgPerDay),
        }),
      });

      if (!response.ok) {
        throw new Error(await apiError(response));
      }

      await loadWorkspace();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text.error);
    } finally {
      setSavingProfile(false);
    }
  }

  async function placeBid(event: FormEvent<HTMLFormElement>, lotId: number) {
    event.preventDefault();
    const authToken = token();
    const bidPrice = Number(bidValues[lotId]);

    if (!authToken) {
      router.replace("/login");
      return;
    }
    if (!Number.isFinite(bidPrice) || bidPrice <= 0) {
      setError(text.bid);
      return;
    }

    try {
      setSubmittingLot(lotId);
      setError("");
      const response = await fetch(`${API_URL}/api/mill/lots/${lotId}/bids`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bidPricePerKg: bidPrice }),
      });

      if (!response.ok) {
        throw new Error(await apiError(response));
      }

      const createdBid = (await response.json()) as Bid;
      setBids((current) => [...current, createdBid]);
      setBidValues((current) => ({ ...current, [lotId]: "" }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text.error);
    } finally {
      setSubmittingLot(null);
    }
  }

  async function withdrawBid(bidId: number) {
    const authToken = token();
    if (!authToken) {
      router.replace("/login");
      return;
    }

    try {
      setWithdrawingBid(bidId);
      setError("");
      const response = await fetch(`${API_URL}/api/mill/bids/${bidId}/withdraw`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await apiError(response));
      }

      const updatedBid = (await response.json()) as Bid;
      setBids((current) =>
        current.map((bid) =>
          bid.bidId === updatedBid.bidId ? updatedBid : bid
        )
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text.error);
    } finally {
      setWithdrawingBid(null);
    }
  }

  async function confirmDeal(dealId: number) {
    const authToken = token();
    if (!authToken) {
      router.replace("/login");
      return;
    }

    try {
      setConfirmingDeal(dealId);
      const response = await fetch(`${API_URL}/api/mill/deals/${dealId}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, Accept: "application/json" },
      });
      if (!response.ok) throw new Error(await apiError(response));
      const updated = (await response.json()) as Deal;
      setDeals((current) => current.map((deal) => deal.dealId === updated.dealId ? updated : deal));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text.error);
    } finally {
      setConfirmingDeal(null);
    }
  }

  async function updateDealStatus(
    dealId: number,
    kind: "payment" | "delivery",
    status: string
  ) {
    const authToken = token();
    if (!authToken) {
      router.replace("/login");
      return;
    }

    try {
      setConfirmingDeal(dealId);
      const response = await fetch(`${API_URL}/api/mill/deals/${dealId}/${kind}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(await apiError(response));
      const updated = (await response.json()) as Deal;
      setDeals((current) => current.map((deal) => deal.dealId === updated.dealId ? updated : deal));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text.error);
    } finally {
      setConfirmingDeal(null);
    }
  }

  function logout() {
    [
      "vee-market-token",
      "vee-market-user-id",
      "vee-market-user-email",
      "vee-market-user-role",
      "token",
    ].forEach((key) => localStorage.removeItem(key));
    router.replace("/login");
  }

  function statusLabel(status: string) {
    return {
      PENDING: text.pending,
      ACCEPTED: text.accepted,
      REJECTED: text.rejected,
      WITHDRAWN: text.withdrawn,
    }[status] || status;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f3] text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <p>{text.loading}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "මෝල් පුවරුව" : "Rice Mill"} roleType="MILL" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">{text.profile}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{text.title}</h1>
          <Link href="/dashboard/mill/requirements" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700">
            {isSinhala ? "ව්‍යාපාර අවශ්‍යතා බලන්න" : "Browse Business Requirements"}
          </Link>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{text.subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button onClick={loadWorkspace} className="font-bold underline">{text.retry}</button>
          </div>
        )}

        {!profile ? (
          <form onSubmit={saveProfile} className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="text-xl font-bold">{text.profile}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{text.profileRequired}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {([
                ["millName", text.millName, "text"],
                ["location", text.location, "text"],
                ["registrationNumber", text.registration, "text"],
                ["millingCapacityKgPerDay", text.capacity, "number"],
              ] as const).map(([name, label, type]) => (
                <label key={name} className="text-sm font-semibold">
                  {label}
                  <input
                    required={name !== "location"}
                    type={type}
                    min={type === "number" ? "0.01" : undefined}
                    value={profileForm[name]}
                    onChange={(event) => setProfileForm((current) => ({ ...current, [name]: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
              ))}
            </div>
            <button disabled={savingProfile} className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
              {savingProfile ? text.saving : text.saveProfile}
            </button>
          </form>
        ) : (
          <>
            <section className="mb-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{profile.millName}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{profile.location || "—"} · {profile.registrationNumber}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                  {profile.verificationStatus}
                </span>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{text.availableLots}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lots.length} {text.activeLots}</p>
                </div>
              </div>

              {lots.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                  <p className="font-semibold">{text.noLots}</p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {lots.map((lot) => {
                    const existingBid = bids.find((bid) => bid.lotId === lot.lotId);
                    return (
                      <article key={lot.lotId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{lot.productType}</p>
                            <h3 className="mt-1 text-xl font-bold">{lot.riceType || "Paddy"}</h3>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">{lot.status}</span>
                        </div>
                        <dl className="mt-5 space-y-3 text-sm">
                          <div className="flex justify-between gap-3"><dt className="text-slate-500 dark:text-slate-400">{text.quantity}</dt><dd className="font-semibold">{lot.quantityKg} kg</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500 dark:text-slate-400">{text.askingPrice}</dt><dd className="font-semibold">LKR {lot.askingPricePerKg}/kg</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500 dark:text-slate-400">{text.moisture}</dt><dd className="font-semibold">{lot.latestMoisturePercentage ?? "—"}%</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500 dark:text-slate-400">{text.available}</dt><dd className="font-semibold">{lot.availableDate}</dd></div>
                        </dl>
                        {existingBid ? (
                          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            {statusLabel(existingBid.status)}: LKR {existingBid.bidPricePerKg}/kg
                          </div>
                        ) : (
                          <form onSubmit={(event) => placeBid(event, lot.lotId)} className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                            <label className="text-sm font-semibold">
                              {text.bid}
                              <input
                                required
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={bidValues[lot.lotId] || ""}
                                onChange={(event) => setBidValues((current) => ({ ...current, [lot.lotId]: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950"
                              />
                            </label>
                            <button disabled={submittingLot === lot.lotId} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                              {submittingLot === lot.lotId ? text.bidding : text.placeBid}
                            </button>
                          </form>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-bold">{text.myBids}</h2>
              {bids.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{text.noBids}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bids.map((bid) => (
                    <div key={bid.bidId} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Lot #{bid.lotId}</p>
                        <p className="mt-1 text-xl font-bold">LKR {bid.bidPricePerKg}/kg</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          {statusLabel(bid.status)}
                        </span>
                        {bid.status === "PENDING" && (
                          <button
                            type="button"
                            disabled={withdrawingBid === bid.bidId}
                            onClick={() => withdrawBid(bid.bidId)}
                            className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
                          >
                            {withdrawingBid === bid.bidId ? text.withdrawing : text.withdraw}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-bold">{text.deals}</h2>
              {deals.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{text.noDeals}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {deals.map((deal) => (
                    <div key={deal.dealId} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Lot #{deal.lotId}</p>
                        <p className="mt-1 font-bold">LKR {deal.agreedPricePerKg}/kg · {deal.quantityKg} kg</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">{deal.status}</span>
                        {deal.status !== "CONFIRMED" && (
                          <button type="button" onClick={() => confirmDeal(deal.dealId)} disabled={confirmingDeal === deal.dealId} className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                            {confirmingDeal === deal.dealId ? text.confirming : text.confirm}
                          </button>
                        )}
                      </div>
                      <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4 text-xs dark:border-slate-800 sm:grid-cols-2">
                        <div>
                          <p className="font-semibold">{text.payment}: {deal.paymentStatus}</p>
                          {deal.paymentStatus === "PENDING" && <button type="button" onClick={() => updateDealStatus(deal.dealId, "payment", "MARKED_PAID")} className="mt-2 font-bold text-emerald-700 hover:underline dark:text-emerald-400">{text.markPaid}</button>}
                          {deal.paymentStatus === "MARKED_PAID" && <button type="button" onClick={() => updateDealStatus(deal.dealId, "payment", "CONFIRMED")} className="mt-2 font-bold text-emerald-700 hover:underline dark:text-emerald-400">{text.confirmPayment}</button>}
                        </div>
                        <div>
                          <p className="font-semibold">{text.delivery}: {deal.deliveryStatus}</p>
                          {deal.deliveryStatus === "PENDING" && <button type="button" onClick={() => updateDealStatus(deal.dealId, "delivery", "SCHEDULED")} className="mt-2 font-bold text-emerald-700 hover:underline dark:text-emerald-400">{text.scheduleDelivery}</button>}
                          {deal.deliveryStatus === "SCHEDULED" && <button type="button" onClick={() => updateDealStatus(deal.dealId, "delivery", "IN_TRANSIT")} className="mt-2 font-bold text-emerald-700 hover:underline dark:text-emerald-400">{text.markInTransit}</button>}
                          {deal.deliveryStatus === "IN_TRANSIT" && <button type="button" onClick={() => updateDealStatus(deal.dealId, "delivery", "DELIVERED")} className="mt-2 font-bold text-emerald-700 hover:underline dark:text-emerald-400">{text.markDelivered}</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
