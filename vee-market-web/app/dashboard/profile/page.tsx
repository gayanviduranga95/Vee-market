"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import { useLanguage } from "../../components/LanguageProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type FarmerProfile = { id: number; name: string; email: string; role: string; deviceNumber: string };

export default function FarmerProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [error, setError] = useState("");
  const si = language === "si";
  const text = si ? { title: "මගේ පැතිකඩ", name: "නම", email: "ඊමේල්", role: "භූමිකාව", device: "උපාංගය", back: "පුවරුව වෙත", loading: "පූරණය වෙමින්...", error: "පැතිකඩ ලබාගැනීමට නොහැකි විය." } : { title: "My Profile", name: "Name", email: "Email", role: "Role", device: "Device", back: "Back to Dashboard", loading: "Loading...", error: "Unable to load your profile." };

  useEffect(() => {
    const token = localStorage.getItem("vee-market-token") || localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetch(`${API_URL}/api/farmer/me`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || text.error);
        setProfile(await response.json());
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : text.error));
  }, [router, text.error]);

  return <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white"><header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6"><Link href="/dashboard" className="font-bold text-emerald-700 dark:text-emerald-400">Vee Market</Link><div className="flex gap-2"><LanguageSwitcher /><ThemeSwitcher /></div></div></header><div className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><Link href="/dashboard" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">← {text.back}</Link><h1 className="mt-6 text-3xl font-bold">{text.title}</h1>{error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}{!error && !profile && <p className="mt-6 text-slate-500 dark:text-slate-400">{text.loading}</p>}{profile && <dl className="mt-8 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900"><div className="flex justify-between gap-6 py-4"><dt className="text-slate-500 dark:text-slate-400">{text.name}</dt><dd className="font-semibold">{profile.name}</dd></div><div className="flex justify-between gap-6 py-4"><dt className="text-slate-500 dark:text-slate-400">{text.email}</dt><dd className="font-semibold">{profile.email}</dd></div><div className="flex justify-between gap-6 py-4"><dt className="text-slate-500 dark:text-slate-400">{text.role}</dt><dd className="font-semibold">{profile.role}</dd></div><div className="flex justify-between gap-6 py-4"><dt className="text-slate-500 dark:text-slate-400">{text.device}</dt><dd className="font-semibold">{profile.deviceNumber || "—"}</dd></div></dl>}</div></main>;
}
