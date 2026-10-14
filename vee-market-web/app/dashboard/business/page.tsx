"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";
import { Button, Input, Select, StatusBadge, EmptyState, ErrorBanner } from "../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

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
};

type Offer = {
  id: number;
  requirementId: number;
  millName: string;
  pricePerKg: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
};

export default function BusinessDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [offers, setOffers] = useState<Record<number, Offer[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New requirement modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [riceType, setRiceType] = useState("Nadu");
  const [quantityKg, setQuantityKg] = useState("1000");
  const [frequency, setFrequency] = useState<"WEEKLY" | "ONE_TIME">("WEEKLY");
  const [submittingReq, setSubmittingReq] = useState(false);
  const [offerActionId, setOfferActionId] = useState<number | null>(null);

  const t = useMemo(
    () => ({
      title: isSinhala
        ? "තොග සහල් ප්‍රසම්පාදන මධ්‍යස්ථානය"
        : "Commercial Rice Procurement",
      subtitle: isSinhala
        ? "සෘජුවම සහල් මෝල් වෙතින් තොග සහල් අවශ්‍යතා පළ කර තරගකාරී මිල ගණන් ලබාගන්න."
        : "Post bulk commercial rice requirements and receive competitive wholesale offers directly from certified mills.",
      postBtn: isSinhala ? "+ නව සහල් අවශ්‍යතාවක් පළ කරන්න" : "+ Post Rice Requirement",
      demandsTitle: isSinhala ? "ඔබේ සහල් අවශ්‍යතා සහ ලැබුණු මිල ගණන්" : "Your Demands & Received Quotes",
      noDemandsTitle: isSinhala ? "තවමත් සහල් අවශ්‍යතා පළ කර නැත" : "No Rice Demands Posted Yet",
      noDemandsDesc: isSinhala
        ? "මෝල් වෙතින් තොග මිල ගණන් ලබා ගැනීමට පළමු අවශ්‍යතාව පළ කරන්න."
        : "Post a recurring or one-time batch requirement to start receiving quotes from mills.",
      offersTitle: isSinhala ? "ලැබුණු මෝල් මිල ගණන්:" : "Received Quotes:",
      noOffersYet: isSinhala
        ? "⏳ සහල් මෝල් වෙතින් මිල ගණන් ඉදිරිපත් වන තෙක් රැඳී සිටින්න..."
        : "⏳ Awaiting competitive quotes from certified rice mills...",
      acceptQuote: isSinhala ? "මිල පිළිගන්න" : "Accept Quote",
      rejectQuote: isSinhala ? "ප්‍රතික්ෂේප කරන්න" : "Decline",
      loadingText: isSinhala ? "දත්ත ලබාගනිමින්..." : "Loading commercial hub...",
      errorText: isSinhala ? "දත්ත ලබාගැනීමට නොහැකි විය." : "Failed to load data.",
    }),
    [isSinhala]
  );

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
      setError(null);

      const [profileRes, reqRes] = await Promise.all([
        fetch(`${API_URL}/api/business`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/business/requirements`, { headers, cache: "no-store" }),
      ]);

      if (profileRes.status === 401 || reqRes.status === 401) {
        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (profileRes.ok) setProfile(await profileRes.json());

      if (reqRes.ok) {
        const reqList = (await reqRes.json()) as Requirement[];
        setRequirements(reqList);

        // Fetch offers for each requirement
        const pairs = await Promise.all(
          reqList.map(async (r) => {
            try {
              const ofRes = await fetch(
                `${API_URL}/api/business/requirements/${r.id}/offers`,
                { headers, cache: "no-store" }
              );
              return [r.id, ofRes.ok ? await ofRes.json() : []] as const;
            } catch {
              return [r.id, []] as const;
            }
          })
        );
        setOffers(Object.fromEntries(pairs));
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

  async function handleAddRequirement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const headers = authHeaders();
    if (!headers) return;

    try {
      setSubmittingReq(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/business/requirements`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          riceType: riceType.trim(),
          quantityKg: Number(quantityKg),
          frequency,
        }),
      });

      if (!res.ok) throw new Error("Could not publish requirement");

      const created = (await res.json()) as Requirement;
      setRequirements((prev) => [created, ...prev]);
      setOffers((prev) => ({ ...prev, [created.id]: [] }));
      setShowAddModal(false);
      setNotification(isSinhala ? "අවශ්‍යතාව සාර්ථකව පළ කරන ලදී!" : "Demand posted!");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error posting demand");
    } finally {
      setSubmittingReq(false);
    }
  }

  async function handleUpdateOffer(offerId: number, status: "ACCEPTED" | "REJECTED") {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setOfferActionId(offerId);
      const res = await fetch(
        `${API_URL}/api/business/offers/${offerId}?status=${status}`,
        { method: "PATCH", headers }
      );

      if (!res.ok) throw new Error("Could not update offer");

      const updated = (await res.json()) as Offer;
      setOffers((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([k, list]) => [
            k,
            list.map((o) =>
              o.id === updated.id
                ? updated
                : status === "ACCEPTED" && o.status === "PENDING"
                ? { ...o, status: "REJECTED" }
                : o
            ),
          ])
        )
      );
      setNotification(status === "ACCEPTED" ? "Quote accepted!" : "Quote declined.");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating offer");
    } finally {
      setOfferActionId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "තොග ගැනුම්කරු" : "Wholesale Buyer"} roleType="BUYER" />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile ? profile.businessName : t.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="md"
            className="w-full sm:w-auto font-bold shadow-sm"
          >
            {t.postBtn}
          </Button>
        </div>

        {error && <ErrorBanner message={error} onRetry={loadData} />}

        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ {notification}
          </div>
        )}

        {/* DEMANDS LIST */}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {t.demandsTitle}
          </h2>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
              <p className="font-semibold">{t.loadingText}</p>
            </div>
          ) : requirements.length === 0 ? (
            <EmptyState
              title={t.noDemandsTitle}
              description={t.noDemandsDesc}
              icon="🏪"
              actionLabel={t.postBtn}
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <div className="space-y-4">
              {requirements.map((req) => {
                const reqOffers = offers[req.id] || [];

                return (
                  <article
                    key={req.id}
                    className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Demand #{req.id}
                        </span>
                        <h3 className="mt-0.5 text-xl font-extrabold text-slate-900 dark:text-white">
                          {req.riceType}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          {req.quantityKg.toLocaleString()} kg ·{" "}
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {req.frequency}
                          </span>
                        </p>
                      </div>
                      <StatusBadge status={req.status || "ACTIVE"} size="md" />
                    </div>

                    {/* OFFERS RECEIVED */}
                    <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t.offersTitle}
                      </h4>

                      {reqOffers.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2">{t.noOffersYet}</p>
                      ) : (
                        <div className="space-y-2">
                          {reqOffers.map((o) => (
                            <div
                              key={o.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                            >
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                  {o.millName}
                                </span>
                                <p className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                                  LKR {o.pricePerKg} / kg
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <StatusBadge status={o.status || "PENDING"} size="sm" />
                                {o.status === "PENDING" && (
                                  <>
                                    <Button
                                      onClick={() => handleUpdateOffer(o.id, "ACCEPTED")}
                                      variant="primary"
                                      size="sm"
                                      loading={offerActionId === o.id}
                                      className="font-bold"
                                    >
                                      {t.acceptQuote}
                                    </Button>
                                    <Button
                                      onClick={() => handleUpdateOffer(o.id, "REJECTED")}
                                      variant="outline"
                                      size="sm"
                                      loading={offerActionId === o.id}
                                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                                    >
                                      {t.rejectQuote}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ADD REQUIREMENT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t.postBtn}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleAddRequirement} className="space-y-4">
                <Input
                  label="Rice Variety"
                  required
                  value={riceType}
                  onChange={(e) => setRiceType(e.target.value)}
                />

                <Input
                  label="Required Volume (kg)"
                  type="number"
                  required
                  min="1"
                  suffixText="kg"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                />

                <Select
                  label="Delivery Schedule"
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as "WEEKLY" | "ONE_TIME")
                  }
                  options={[
                    { value: "WEEKLY", label: "Weekly Recurring (සතිපතා)" },
                    { value: "ONE_TIME", label: "One-time Batch (එක් වරක්)" },
                  ]}
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    variant="outline"
                    size="md"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={submittingReq}
                    className="font-bold"
                  >
                    Publish Requirement
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
