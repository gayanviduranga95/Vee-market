"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";
import { Button, ErrorBanner } from "../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

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
  const isSinhala = language === "si";

  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const t = useMemo(
    () => ({
      title: isSinhala ? "මගේ පැතිකඩ" : "My Account Profile",
      subtitle: isSinhala
        ? "ඔබගේ ගිණුමේ තොරතුරු, දුරකථන අංකය සහ සම්බන්ධිත IoT තෙතමන මාපක අංකය මෙතැනින් පරීක්ෂා කරන්න."
        : "View and manage your account identity, verified contact details, and paired IoT meter ID.",
      back: isSinhala ? "← පුවරුව වෙත" : "← Back to Dashboard",
      name: isSinhala ? "සම්පූර්ණ නම" : "Full Name",
      email: isSinhala ? "විද්‍යුත් තැපෑල" : "Email Address",
      phone: isSinhala ? "දුරකථන අංකය" : "Mobile Phone",
      role: isSinhala ? "ගිණුම් භූමිකාව" : "Account Role",
      deviceNumber: isSinhala ? "ස්මාර්ට් තෙතමන මාපක අංකය" : "Paired IoT Moisture Meter ID",
      deviceHint: isSinhala
        ? "මෙම අංකය මඟින් ඔබගේ වී තොග සඳහා ඩිජිටල් කියවීම් සෘජුවම සටහන් කරගත හැක."
        : "Used by the ESP32 meter integration to coordinate automated moisture testing.",
      quickActions: isSinhala ? "ඉක්මන් ප්‍රවේශයන්" : "Quick Navigation",
      myLots: isSinhala ? "📦 මගේ වී තොග" : "📦 My Paddy Lots",
      offers: isSinhala ? "🤝 ලැබුණු මිල ගණන්" : "🤝 Received Offers",
      addFarm: isSinhala ? "🏡 නව ගොවිපළක් එක් කරන්න" : "🏡 Add a New Farm",
      orders: isSinhala ? "🚚 ඇණවුම් සහ ගනුදෙනු" : "🚚 Deals & Orders",
      payments: isSinhala ? "💳 ගෙවීම් වාර්තා" : "💳 Payment Ledger",
      logout: isSinhala ? "🚪 ගිණුමෙන් ඉවත් වන්න" : "🚪 Sign Out",
      loadingText: isSinhala ? "පැතිකඩ තොරතුරු පූරණය වෙමින්..." : "Loading profile...",
      errorText: isSinhala ? "පැතිකඩ ලබාගැනීමට නොහැකි විය." : "Failed to load profile.",
    }),
    [isSinhala]
  );

  useEffect(() => {
    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    fetch(`${API_URL}/api/farmer/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(t.errorText);
        const data = await res.json();
        setProfile(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t.errorText))
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    [
      "vee-market-token",
      "vee-market-user-id",
      "vee-market-user-email",
      "vee-market-user-role",
      "token",
      "vee_market_token",
      "vee_market_email",
    ].forEach((k) => localStorage.removeItem(k));
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "පැතිකඩ" : "Profile"} roleType="FARMER" />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <div>
          <Link
            href="/dashboard"
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

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold">{t.loadingText}</p>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* FARMER IDENTITY CARD */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-3xl sm:text-4xl dark:bg-emerald-950/60">
                🌾
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                    {profile.role || "FARMER"}
                  </span>
                  <span className="text-xs text-slate-400">Farmer ID #{profile.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {isSinhala ? "ගිණුමේ තොරතුරු" : "Account Credentials"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                  <p className="text-xs font-bold text-slate-400">{t.name}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                    {profile.name}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                  <p className="text-xs font-bold text-slate-400">{t.email}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                    {profile.email}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                  <p className="text-xs font-bold text-slate-400">{t.phone}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                    {profile.phone || "Not set"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
                  <p className="text-xs font-bold text-slate-400">{t.deviceNumber}</p>
                  <p className="mt-1 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    {profile.deviceNumber || "None configured"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{t.deviceHint}</p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {t.quickActions}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Link href="/dashboard/listings">
                  <Button variant="outline" size="sm" fullWidth>
                    {t.myLots}
                  </Button>
                </Link>
                <Link href="/dashboard/bids">
                  <Button variant="outline" size="sm" fullWidth>
                    {t.offers}
                  </Button>
                </Link>
                <Link href="/dashboard/farms/new">
                  <Button variant="outline" size="sm" fullWidth>
                    {t.addFarm}
                  </Button>
                </Link>
                <Link href="/dashboard/orders">
                  <Button variant="outline" size="sm" fullWidth>
                    {t.orders}
                  </Button>
                </Link>
                <Link href="/dashboard/payments">
                  <Button variant="outline" size="sm" fullWidth>
                    {t.payments}
                  </Button>
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={logout}
                  variant="outline"
                  size="md"
                  fullWidth
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                >
                  {t.logout}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
