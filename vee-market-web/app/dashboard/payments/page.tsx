"use client";

import Link from "next/link";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import { useLanguage } from "../../components/LanguageProvider";

export default function PaymentsPage() {
  const { language } = useLanguage();
  const si = language === "si";
  const text = si ? { title: "ගෙවීම්", empty: "තවමත් ගෙවීම් වාර්තා නොමැත.", back: "පුවරුව වෙත", note: "ගනුදෙනු ගෙවීම් තත්ත්වයන් මෙහි පෙන්වනු ඇත." } : { title: "Payments", empty: "No payment records yet.", back: "Back to Dashboard", note: "Payment statuses from your deals will appear here." };
  return <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white"><header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6"><Link href="/dashboard" className="font-bold text-emerald-700 dark:text-emerald-400">Vee Market</Link><div className="flex gap-2"><LanguageSwitcher /><ThemeSwitcher /></div></div></header><div className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><Link href="/dashboard" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">← {text.back}</Link><div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><h1 className="text-3xl font-bold">{text.title}</h1><p className="mt-4 font-semibold">{text.empty}</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{text.note}</p></div></div></main>;
}
