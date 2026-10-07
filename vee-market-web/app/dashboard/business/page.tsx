"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import { useLanguage } from "../../components/LanguageProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type BusinessProfile = {
  id: number;
  businessType: "SHOP" | "HOTEL";
  businessName: string;
  location?: string | null;
};

export default function BusinessDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState("");
  const si = language === "si";
  const text = si
    ? { title: "සාප්පු / හෝටල් පුවරුව", profile: "ව්‍යාපාර පැතිකඩ", location: "ස්ථානය", shop: "සාප්පුව", hotel: "හෝටලය", empty: "ව්‍යාපාර පැතිකඩක් හමු නොවීය.", error: "තොරතුරු ලබාගැනීමට නොහැකි විය.", logout: "ඉවත් වන්න" }
    : { title: "Shop / Hotel Dashboard", profile: "Business Profile", location: "Location", shop: "Shop", hotel: "Hotel", empty: "Business profile not found.", error: "Unable to load your profile.", logout: "Logout" };

  useEffect(() => {
    const authToken = localStorage.getItem("vee-market-token") || localStorage.getItem("token");
    if (!authToken) {
      router.replace("/login");
      return;
    }

    const role = localStorage.getItem("vee-market-user-role");
    if (role === "FARMER") {
      router.replace("/dashboard");
      return;
    }
    if (role === "MILL") {
      router.replace("/dashboard/mill");
      return;
    }
    if (role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }

    fetch(`${API_URL}/api/business/profile`, { headers: { Authorization: `Bearer ${authToken}`, Accept: "application/json" }, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || text.error);
        setProfile(await response.json());
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : text.error));
  }, [router, text.error]);

  function logout() {
    ["vee-market-token", "vee-market-user-id", "vee-market-user-email", "vee-market-user-role", "token"].forEach((key) => localStorage.removeItem(key));
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard/business" className="font-bold text-emerald-700 dark:text-emerald-400">Vee Market</Link>
          <div className="flex items-center gap-2"><LanguageSwitcher /><ThemeSwitcher /><button onClick={logout} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">{text.logout}</button></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">{text.title}</h1>
        <Link href="/dashboard/business/requirements" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700">
          {si ? "සහල් අවශ්‍යතා කළමනාකරණය" : "Manage Rice Requirements"}
        </Link>
        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
        {!error && !profile && <p className="mt-6 text-slate-500 dark:text-slate-400">{text.empty}</p>}
        {profile && <section className="mt-8 max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">{text.profile}</p><h2 className="mt-2 text-2xl font-bold">{profile.businessName}</h2><p className="mt-2 text-slate-600 dark:text-slate-400">{profile.businessType === "HOTEL" ? text.hotel : text.shop} · {profile.location || "—"}</p><p className="mt-8 text-sm text-slate-500 dark:text-slate-400">{si ? "ඔබේ සහල් අවශ්‍යතා ප්‍රකාශ කර සැපයුම්කරුවන් සඳහා සූදානම් කරන්න." : "Publish your rice requirements for future supplier offers."}</p></section>}
      </div>
    </main>
  );
}
