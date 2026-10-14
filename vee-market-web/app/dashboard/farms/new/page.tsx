"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../components/LanguageProvider";
import VeeHeader from "../../../components/VeeHeader";
import { Button, Input, Select, ErrorBanner } from "../../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

export default function NewFarmPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [form, setForm] = useState({
    farmName: "",
    location: "",
    landSize: "",
    mainCrop: "Paddy",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      title: isSinhala ? "ගොවිපළක් ලියාපදිංචි කරන්න" : "Register Farm",
      subtitle: isSinhala
        ? "ඔබේ ගොවිපළේ මූලික තොරතුරු ඇතුළත් කර වී තොග එක් කිරීමට සූදානම් වන්න."
        : "Add your agricultural land information to start creating paddy lots.",
      back: isSinhala ? "← වී තොග වෙත" : "← Back to Lots",
      farmName: isSinhala ? "ගොවිපළේ නම" : "Farm Name",
      farmNamePlaceholder: isSinhala ? "උදා: නිල්වලා ගොවිපළ" : "e.g. Nilwala Farm",
      location: isSinhala ? "පිහිටි ස්ථානය / දිස්ත්‍රික්කය" : "Location / Region",
      locationPlaceholder: isSinhala ? "උදා: අම්පාර, උහන" : "e.g. Ampara, Uhana",
      landSize: isSinhala ? "ඉඩම් ප්‍රමාණය (අක්කර)" : "Land Size (acres)",
      landSizePlaceholder: isSinhala ? "උදා: 3.5" : "e.g. 3.5",
      mainCrop: isSinhala ? "ප්‍රධාන බෝගය" : "Main Crop",
      submitBtn: isSinhala ? "ගොවිපළ සුරකින්න" : "Save Farm",
      submittingBtn: isSinhala ? "සුරකිමින් පවතී..." : "Saving Farm...",
      successMsg: isSinhala
        ? "ගොවිපළ සාර්ථකව ලියාපදිංචි කරන ලදී! තොග සෑදීමට යොමු කෙරේ..."
        : "Farm registered successfully! Redirecting...",
      validationError: isSinhala
        ? "කරුණාකර ගොවිපළේ නම සහ වලංගු ඉඩම් ප්‍රමාණයක් ඇතුළත් කරන්න."
        : "Please enter farm name and a valid land size.",
    }),
    [isSinhala]
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const land = Number(form.landSize);
    if (!form.farmName.trim() || !land || land <= 0) {
      setError(t.validationError);
      return;
    }

    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        farmName: form.farmName.trim(),
        location: form.location.trim() || null,
        landSize: land,
        mainCrop: form.mainCrop,
      };

      const res = await fetch(`${API_URL}/api/farmer/farms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || (isSinhala ? "ගොවිපළ සෑදීමට නොහැකි විය." : "Failed to register farm.")
        );
      }

      setSuccess(t.successMsg);
      setTimeout(() => {
        router.push("/dashboard/listings/new");
      }, 900);
    } catch (err) {
      console.error("Create farm error:", err);
      setError(err instanceof Error ? err.message : "Error creating farm");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "නව ගොවිපළ" : "New Farm"} roleType="FARMER" />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <div>
          <Link
            href="/dashboard/listings"
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

        {error && <ErrorBanner message={error} />}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <Input
            label={t.farmName}
            required
            placeholder={t.farmNamePlaceholder}
            value={form.farmName}
            onChange={(e) => setForm({ ...form, farmName: e.target.value })}
          />

          <Input
            label={t.location}
            placeholder={t.locationPlaceholder}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.landSize}
              required
              type="number"
              min="0.1"
              step="0.1"
              suffixText="acres"
              placeholder={t.landSizePlaceholder}
              value={form.landSize}
              onChange={(e) => setForm({ ...form, landSize: e.target.value })}
            />

            <Select
              label={t.mainCrop}
              value={form.mainCrop}
              onChange={(e) => setForm({ ...form, mainCrop: e.target.value })}
              options={[
                { value: "Paddy", label: isSinhala ? "වී (Paddy)" : "Paddy" },
                { value: "Rice", label: isSinhala ? "සහල් (Rice)" : "Rice" },
                { value: "Maize", label: isSinhala ? "බඩ ඉරිඟු (Maize)" : "Maize" },
                { value: "Vegetables", label: isSinhala ? "එළවළු (Vegetables)" : "Vegetables" },
              ]}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              className="font-extrabold text-base"
            >
              {submitting ? t.submittingBtn : t.submitBtn}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}