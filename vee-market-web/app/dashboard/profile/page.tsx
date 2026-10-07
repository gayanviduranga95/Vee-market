"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type FarmerProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  deviceNumber?: string;
  verificationStatus?: string;
};

export default function FarmerProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const isSinhala = language === "si";

  const t = {
    title: isSinhala ? "මගේ පැතිකඩ" : "My Profile",
    subtitle: isSinhala
      ? "ඔබගේ ගිණුමේ විස්තර, සම්බන්ධතා තොරතුරු සහ සම්බන්ධිත උපාංග මෙතැනින් පරීක්ෂා කරන්න."
      : "View and manage your account credentials, verified contact info, and IoT meter ID.",
    back: isSinhala ? "← පුවරුව වෙත" : "← Back to Dashboard",
    name: isSinhala ? "සම්පූර්ණ නම" : "Full Name",
    email: isSinhala ? "විද්‍යුත් තැපෑල" : "Email Address",
    phone: isSinhala ? "දුරකථන අංකය" : "Mobile Phone",
    role: isSinhala ? "භූමිකාව" : "Account Role",
    device: isSinhala ? "ඩිජිටල් තෙතමන මාපක අංකය" : "Digital Moisture Meter ID",
    deviceHint: isSinhala
      ? "ස්මාර්ට් මීටරය මඟින් තෙතමන කියවීම් ස්වයංක්‍රීයව සහතික කෙරේ."
      : "Enables verified IoT moisture readings on your paddy lots.",
    quickLinks: isSinhala ? "ඉක්මන් ප්‍රවේශයන්" : "Quick Actions",
    myLots: isSinhala ? "මගේ වී තොග" : "My Paddy Lots",
    addFarm: isSinhala ? "නව ගොවිපළක් එක් කරන්න" : "Add Farm",
    myOrders: isSinhala ? "ඇණවුම් සහ ගනුදෙනු" : "Orders & Deals",
    payments: isSinhala ? "ගෙවීම් ලෙජරය" : "Payments",
    logout: isSinhala ? "ගිණුමෙන් ඉවත් වන්න" : "Sign Out",
    loadingText: isSinhala ? "පැතිකඩ පූරණය වෙමින්..." : "Loading profile...",
    errorText: isSinhala ? "පැතිකඩ ලබාගැනීමට නොහැකි විය." : "Unable to load your profile.",
  };

  useEffect(() => {
    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    fetch(`${API_URL}/api/farmer/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            (await response.json().catch(() => null))?.message || t.errorText
          );
        setProfile(await response.json());
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : t.errorText))
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    [
      "vee-market-token",
      "vee-market-user-id",
      "vee-market-user-email",
      "vee-market-user-role",
      "token",
    ].forEach((k) => localStorage.removeItem(k));
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "පැතිකඩ" : "Profile"} roleType="FARMER" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10 space-y-8">
        <div>
          <Link
            href="/dashboard"
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

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold text-sm">{t.loadingText}</p>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* AVATAR & OVERVIEW CARD */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 text-3xl font-extrabold dark:bg-emerald-950 dark:text-emerald-300">
                🌾
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {profile.role}
                  </span>
                  <span className="text-xs text-slate-400">• Farmer ID #{profile.id}</span>
                </div>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* DETAILS SPECIFICATION */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                  <p className="text-xs font-semibold text-slate-400">{t.name}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {profile.name}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                  <p className="text-xs font-semibold text-slate-400">{t.email}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {profile.email}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                  <p className="text-xs font-semibold text-slate-400">{t.phone}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {profile.phone || "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                  <p className="text-xs font-semibold text-slate-400">{t.role}</p>
                  <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {profile.role}
                  </p>
                </div>

                <div className="sm:col-span-2 rounded-2xl bg-emerald-50/70 p-4 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📟</span>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      {t.device}
                    </p>
                  </div>
                  <p className="mt-1 text-lg font-mono font-black text-emerald-900 dark:text-emerald-200">
                    {profile.deviceNumber || "None Assigned"}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-400/80">
                    {t.deviceHint}
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                {t.quickLinks}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href="/dashboard/listings"
                  className="rounded-2xl border border-slate-200 p-4 text-center hover:border-emerald-300 hover:bg-emerald-50/50 transition dark:border-slate-800 dark:hover:border-emerald-800"
                >
                  <span className="text-2xl">🌾</span>
                  <p className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.myLots}
                  </p>
                </Link>

                <Link
                  href="/dashboard/farms/new"
                  className="rounded-2xl border border-slate-200 p-4 text-center hover:border-emerald-300 hover:bg-emerald-50/50 transition dark:border-slate-800 dark:hover:border-emerald-800"
                >
                  <span className="text-2xl">🚜</span>
                  <p className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.addFarm}
                  </p>
                </Link>

                <Link
                  href="/dashboard/orders"
                  className="rounded-2xl border border-slate-200 p-4 text-center hover:border-emerald-300 hover:bg-emerald-50/50 transition dark:border-slate-800 dark:hover:border-emerald-800"
                >
                  <span className="text-2xl">📦</span>
                  <p className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.myOrders}
                  </p>
                </Link>

                <Link
                  href="/dashboard/payments"
                  className="rounded-2xl border border-slate-200 p-4 text-center hover:border-emerald-300 hover:bg-emerald-50/50 transition dark:border-slate-800 dark:hover:border-emerald-800"
                >
                  <span className="text-2xl">💳</span>
                  <p className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.payments}
                  </p>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
