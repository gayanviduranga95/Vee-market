"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../components/LanguageProvider";
import VeeHeader from "../../../components/VeeHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Requirement = { id: number; riceType: string; quantityKg: number; frequency: "WEEKLY" | "ONE_TIME"; status: string };
type Offer = { id: number; requirementId: number; millName: string; pricePerKg: number; status: "PENDING" | "ACCEPTED" | "REJECTED" };

export default function BusinessRequirementsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const si = language === "si";
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [offers, setOffers] = useState<Record<number, Offer[]>>({});
  const [riceType, setRiceType] = useState("Nadu");
  const [quantityKg, setQuantityKg] = useState("");
  const [frequency, setFrequency] = useState<Requirement["frequency"]>("WEEKLY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offerSaving, setOfferSaving] = useState<number | null>(null);
  const [error, setError] = useState("");

  const text = si ? {
    title: "සහල් අවශ්‍යතා", subtitle: "ඔබේ සතිපතා සහල් අවශ්‍යතාව ප්‍රකාශ කරන්න.", rice: "වී / සහල් වර්ගය", quantity: "ප්‍රමාණය (කිලෝග්‍රෑම්)", frequency: "අවශ්‍යතා වාරය", weekly: "සතිපතා", oneTime: "එක් වරක්", save: "අවශ්‍යතාව එක් කරන්න", saving: "සුරකිමින්...", empty: "තවමත් අවශ්‍යතා නොමැත.", back: "ව්‍යාපාර පුවරුව", errorText: "අවශ්‍යතා ලබාගැනීමට නොහැකි විය.", offers: "ලැබුණු මිල ගණන්", accept: "පිළිගන්න", reject: "ප්‍රතික්ෂේප කරන්න", pending: "පොරොත්තුවෙන්", accepted: "පිළිගත්", rejected: "ප්‍රතික්ෂේපිත"
  } : {
    title: "Rice Requirements", subtitle: "Publish your weekly rice requirement for future supplier offers.", rice: "Rice Type", quantity: "Quantity (kg)", frequency: "Requirement Frequency", weekly: "Weekly", oneTime: "One time", save: "Add Requirement", saving: "Saving...", empty: "No requirements yet.", back: "Business Dashboard", errorText: "Unable to load requirements.", offers: "Offers received", accept: "Accept", reject: "Reject", pending: "Pending", accepted: "Accepted", rejected: "Rejected"
  };

  function getHeaders() {
    const token = localStorage.getItem("vee-market-token") || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" } : null;
  }

  async function loadRequirements() {
    const requestHeaders = getHeaders();
    if (!requestHeaders) { router.replace("/login"); return; }
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/business/requirements`, { headers: requestHeaders, cache: "no-store" });
      if (response.status === 401 || response.status === 403) { router.replace("/login"); return; }
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || text.errorText);
      const data = await response.json() as Requirement[];
      setRequirements(data);
      const pairs = await Promise.all(data.map(async (requirement) => {
        const offersResponse = await fetch(`${API_URL}/api/business/requirements/${requirement.id}/offers`, { headers: requestHeaders, cache: "no-store" });
        return [requirement.id, offersResponse.ok ? await offersResponse.json() as Offer[] : []] as const;
      }));
      setOffers(Object.fromEntries(pairs));
    } catch (cause) { setError(cause instanceof Error ? cause.message : text.errorText); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadRequirements(); }, [language]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requestHeaders = getHeaders();
    if (!requestHeaders) { router.replace("/login"); return; }
    try {
      setSaving(true); setError("");
      const response = await fetch(`${API_URL}/api/business/requirements`, { method: "POST", headers: requestHeaders, body: JSON.stringify({ riceType: riceType.trim(), quantityKg: Number(quantityKg), frequency }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || text.errorText);
      const created = await response.json() as Requirement;
      setRequirements((current) => [created, ...current]);
      setOffers((current) => ({ ...current, [created.id]: [] }));
      setQuantityKg("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : text.errorText); }
    finally { setSaving(false); }
  }

  async function updateOffer(offerId: number, status: "ACCEPTED" | "REJECTED") {
    const requestHeaders = getHeaders();
    if (!requestHeaders) { router.replace("/login"); return; }
    try {
      setOfferSaving(offerId);
      const response = await fetch(`${API_URL}/api/business/offers/${offerId}?status=${status}`, { method: "PATCH", headers: requestHeaders });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || text.errorText);
      const updated = await response.json() as Offer;
      setOffers((current) => Object.fromEntries(Object.entries(current).map(([key, items]) => [key, items.map((offer) => offer.id === updated.id ? updated : status === "ACCEPTED" && offer.status === "PENDING" ? { ...offer, status: "REJECTED" } : offer)])));
    } catch (cause) { setError(cause instanceof Error ? cause.message : text.errorText); }
    finally { setOfferSaving(null); }
  }

  const statusLabel = (status: Offer["status"]) => status === "PENDING" ? text.pending : status === "ACCEPTED" ? text.accepted : text.rejected;

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={si ? "සහල් අවශ්‍යතා" : "Requirements"} roleType="BUYER" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/dashboard/business" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">← {text.back}</Link>
        <h1 className="mt-6 text-3xl font-bold">{text.title}</h1><p className="mt-2 text-slate-600 dark:text-slate-400">{text.subtitle}</p>
        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
        <form onSubmit={submit} className="mt-8 grid gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3"><label className="text-sm font-semibold">{text.rice}<input required value={riceType} onChange={(event) => setRiceType(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-sm font-semibold">{text.quantity}<input required min="0.01" step="0.01" type="number" value={quantityKg} onChange={(event) => setQuantityKg(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-sm font-semibold">{text.frequency}<select value={frequency} onChange={(event) => setFrequency(event.target.value as Requirement["frequency"])} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950"><option value="WEEKLY">{text.weekly}</option><option value="ONE_TIME">{text.oneTime}</option></select></label><button disabled={saving} className="rounded-xl bg-[#087f3f] px-5 py-3 font-bold text-white hover:bg-[#066833] transition disabled:opacity-60 sm:col-span-3">{saving ? text.saving : text.save}</button></form>
        <section className="mt-8 space-y-4">{loading ? <p className="text-slate-500 dark:text-slate-400">{text.saving}</p> : requirements.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><p className="font-semibold">{text.empty}</p></div> : requirements.map((requirement) => <article key={requirement.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">{requirement.riceType}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{requirement.quantityKg} kg · {requirement.frequency === "WEEKLY" ? text.weekly : text.oneTime}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">{requirement.status}</span></div><div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800"><h3 className="text-sm font-bold">{text.offers}</h3>{(offers[requirement.id] || []).length === 0 ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{text.empty}</p> : <div className="mt-3 space-y-2">{offers[requirement.id].map((offer) => <div key={offer.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{offer.millName}</p><p className="text-sm text-emerald-700 dark:text-emerald-400">LKR {offer.pricePerKg} / kg</p></div><div className="flex items-center gap-2"><span className="text-xs font-bold">{statusLabel(offer.status)}</span>{offer.status === "PENDING" && <><button type="button" disabled={offerSaving === offer.id} onClick={() => updateOffer(offer.id, "ACCEPTED")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{text.accept}</button><button type="button" disabled={offerSaving === offer.id} onClick={() => updateOffer(offer.id, "REJECTED")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-60 dark:border-red-900/50 dark:text-red-400">{text.reject}</button></>}</div></div>)}</div>}</div></article>)}</section>
      </div>
    </main>
  );
}
