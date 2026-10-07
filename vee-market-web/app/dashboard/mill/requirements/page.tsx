"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import ThemeSwitcher from "../../../components/ThemeSwitcher";
import { useLanguage } from "../../../components/LanguageProvider";
import VeeHeader from "../../../components/VeeHeader";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Requirement = {
  id: number;
  riceType: string;
  quantityKg: number;
  frequency: string;
};

type MillOffer = {
  id: number;
  requirementId: number;
  millName: string;
  pricePerKg: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
};

export default function MillRequirementsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [myOffers, setMyOffers] = useState<MillOffer[]>([]);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    title: isSinhala
      ? "සාප්පු සහ හෝටල් සහල් ඉල්ලුම්"
      : "Shop & Hotel Rice Demands",
    subtitle: isSinhala
      ? "වෙළඳසැල් සහ හෝටල් විසින් ඉදිරිපත් කර ඇති තොග සහල් අවශ්‍යතා සඳහා ඔබේ මිල ගණන් ඉදිරිපත් කරන්න."
      : "Submit competitive wholesale quotes for bulk rice requirements posted by shops and hotels.",
    back: isSinhala ? "← මෝල් පුවරුව" : "← Back to Mill Dashboard",
    priceLabel: isSinhala ? "ඔබේ මිල / කිලෝග්‍රෑම් (LKR)" : "Your Quote / kg (LKR)",
    pricePlaceholder: "e.g. 215.00",
    submitOffer: isSinhala ? "මිල ගණන ඉදිරිපත් කරන්න" : "Submit Price Quote",
    submitting: isSinhala ? "ඉදිරිපත් කරමින්..." : "Submitting...",
    empty: isSinhala
      ? "දැනට සක්‍රීය ව්‍යාපාර සහල් අවශ්‍යතා නොමැත."
      : "No active commercial rice requirements found.",
    loadingText: isSinhala ? "අවශ්‍යතා ලබාගනිමින්..." : "Loading requirements...",
    errorText: isSinhala
      ? "අවශ්‍යතා ලබාගැනීමට නොහැකි විය."
      : "Unable to load business requirements.",
    myOffersTitle: isSinhala ? "ඔබ ඉදිරිපත් කළ මිල ගණන්" : "My Submitted Quotes",
    status: {
      PENDING: isSinhala ? "පොරොත්තුවෙන්" : "Pending Decision",
      ACCEPTED: isSinhala ? "පිළිගත් (Accepted!)" : "Accepted!",
      REJECTED: isSinhala ? "ප්‍රතික්ෂේපිත" : "Declined",
    },
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

  async function loadData() {
    const headers = authHeaders();
    if (!headers) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [reqRes, offersRes] = await Promise.all([
        fetch(`${API_URL}/api/mill/requirements`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/mill/requirements/offers`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (reqRes.status === 401 || reqRes.status === 403) {
        router.replace("/login");
        return;
      }

      if (reqRes.ok) {
        setRequirements(await reqRes.json());
      }
      if (offersRes.ok) {
        setMyOffers(await offersRes.json());
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmitOffer(
    event: FormEvent<HTMLFormElement>,
    requirementId: number
  ) {
    event.preventDefault();
    const headers = authHeaders();
    if (!headers) return;

    const price = prices[requirementId];
    if (!price || Number(price) <= 0) {
      setError(
        isSinhala
          ? "කරුණාකර වලංගු මිලක් ඇතුළත් කරන්න."
          : "Please enter a valid price."
      );
      return;
    }

    try {
      setSavingId(requirementId);
      setError("");
      const response = await fetch(
        `${API_URL}/api/mill/requirements/${requirementId}/offers`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ pricePerKg: Number(price) }),
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.json().catch(() => null))?.message ||
            (isSinhala
              ? "මිල ගණන ඉදිරිපත් කිරීමට නොහැකි විය."
              : "Failed to submit quote.")
        );
      }

      const created = (await response.json()) as MillOffer;
      setMyOffers((prev) => [created, ...prev]);
      setPrices((prev) => ({ ...prev, [requirementId]: "" }));
      setNotification(
        isSinhala
          ? `අවශ්‍යතා #${requirementId} සඳහා LKR ${created.pricePerKg}/kg මිල ගණන සාර්ථකව ඉදිරිපත් කරන ලදී!`
          : `Quote of LKR ${created.pricePerKg}/kg submitted successfully for requirement #${requirementId}!`
      );
      setTimeout(() => setNotification(null), 4000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.errorText);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-800 dark:bg-slate-950 dark:text-white">
      {/* SHARED BRAND HEADER */}
      <VeeHeader roleBadge="Mill" roleType="MILL" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10 space-y-8">
        <div>
          <Link
            href="/dashboard/mill"
            className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {t.back}
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* NOTIFICATION */}
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-3">
            <span>🎉</span>
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

        {/* ACTIVE DEMANDS GRID */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent mb-3" />
            <p className="font-semibold text-sm">{t.loadingText}</p>
          </div>
        ) : requirements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <span className="text-4xl">🏪</span>
            <p className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-200">
              {t.empty}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {requirements.map((req) => {
              const myExistingOffer = myOffers.find(
                (o) => o.requirementId === req.id
              );
              const isSubmitting = savingId === req.id;

              return (
                <article
                  key={req.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl dark:bg-amber-950/50">
                        🌾
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Demand #{req.id}
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {req.riceType}
                        </h2>
                      </div>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {req.frequency}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Volume Required:
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      {Number(req.quantityKg).toLocaleString()} kg
                    </p>
                  </div>

                  {myExistingOffer ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            Your Quote:
                          </p>
                          <p className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                            LKR {Number(myExistingOffer.pricePerKg).toFixed(2)}/kg
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            myExistingOffer.status === "ACCEPTED"
                              ? "bg-emerald-600 text-white"
                              : myExistingOffer.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {t.status[myExistingOffer.status]}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => handleSubmitOffer(e, req.id)}
                      className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3"
                    >
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.priceLabel}
                        <input
                          required
                          min="1"
                          step="0.01"
                          type="number"
                          value={prices[req.id] || ""}
                          onChange={(e) =>
                            setPrices((prev) => ({
                              ...prev,
                              [req.id]: e.target.value,
                            }))
                          }
                          placeholder={t.pricePlaceholder}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-[#087f3f] py-3 px-4 text-xs font-bold text-white shadow-md hover:bg-[#076f37] transition disabled:opacity-50"
                      >
                        {isSubmitting ? t.submitting : t.submitOffer}
                      </button>
                    </form>
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
