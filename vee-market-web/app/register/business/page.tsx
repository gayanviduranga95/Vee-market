"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeSwitcher from "../../components/ThemeSwitcher";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://172.18.228.12:8080";

export default function BusinessRegistrationPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    businessType: "SHOP",
    businessName: "",
    businessLocation: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const text = isSinhala
    ? {
        title: "සාප්පු / හෝටල් ලියාපදිංචිය",
        subtitle: "Vee Market වෙතින් සහල් සැපයුම්කරුවන් සමඟ සම්බන්ධ වන්න.",
        name: "ඔබේ නම",
        email: "ඊමේල් ලිපිනය",
        phone: "දුරකථන අංකය",
        password: "මුරපදය",
        businessType: "ව්‍යාපාර වර්ගය",
        shop: "සාප්පුව",
        hotel: "හෝටලය",
        businessName: "ව්‍යාපාරයේ නම",
        location: "ස්ථානය",
        submit: "ලියාපදිංචි වන්න",
        submitting: "ලියාපදිංචි කරමින්...",
        login: "දැනට ගිණුමක් තිබේද? ඇතුළු වන්න",
        error: "ලියාපදිංචිය අසාර්ථක විය",
      }
    : {
        title: "Shop / Hotel Registration",
        subtitle: "Connect with rice suppliers through Vee Market.",
        name: "Your Name",
        email: "Email Address",
        phone: "Phone Number",
        password: "Password",
        businessType: "Business Type",
        shop: "Shop",
        hotel: "Hotel",
        businessName: "Business Name",
        location: "Location",
        submit: "Register Business",
        submitting: "Registering...",
        login: "Already have an account? Login",
        error: "Registration failed",
      };

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          password: form.password,
          role: "BUYER",
          businessType: form.businessType,
          businessName: form.businessName.trim(),
          businessLocation: form.businessLocation.trim() || null,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || text.error);
      }

      localStorage.setItem("vee-market-user-role", "BUYER");
      localStorage.setItem("vee-market-user-email", form.email.trim());
      router.push("/login");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text.error);
    } finally {
      setSubmitting(false);
    }
  }

  const fields = [
    ["name", text.name, "text"],
    ["email", text.email, "email"],
    ["phone", text.phone, "tel"],
    ["businessName", text.businessName, "text"],
    ["businessLocation", text.location, "text"],
  ] as const;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <header className="mx-auto mb-8 flex max-w-2xl items-center justify-between">
        <Link href="/" className="font-bold text-emerald-700 dark:text-emerald-400">Vee Market</Link>
        <div className="flex items-center gap-2"><LanguageSwitcher /><ThemeSwitcher /></div>
      </header>
      <form onSubmit={submit} className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h1 className="text-3xl font-bold">{text.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{text.subtitle}</p>
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {fields.map(([name, label, type]) => (
            <label key={name} className="text-sm font-semibold">
              {label}
              <input required={name !== "phone"} type={type} value={form[name]} onChange={(event) => update(name, event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950" />
            </label>
          ))}
          <label className="text-sm font-semibold">
            {text.password}
            <input required minLength={6} type="password" value={form.password} onChange={(event) => update("password", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="text-sm font-semibold">
            {text.businessType}
            <select value={form.businessType} onChange={(event) => update("businessType", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950">
              <option value="SHOP">{text.shop}</option>
              <option value="HOTEL">{text.hotel}</option>
            </select>
          </label>
        </div>
        <button disabled={submitting} className="mt-7 w-full rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-60">{submitting ? text.submitting : text.submit}</button>
        <Link href="/login" className="mt-5 block text-center text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">{text.login}</Link>
      </form>
    </main>
  );
}
