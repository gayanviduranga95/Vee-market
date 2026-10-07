"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import { useLanguage } from "../../components/LanguageProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: "FARMER" | "MILL" | "BUYER" | "ADMIN";
  profileName?: string | null;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED" | null;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState("");
  const si = language === "si";
  const text = si
    ? { title: "පරිපාලන පුවරුව", subtitle: "පරිශීලකයන්, මෝල් සහ ගොවි සත්‍යාපනය කළමනාකරණය කරන්න.", users: "පරිශීලකයන්", all: "සියල්ල", farmer: "ගොවීන්", mill: "මෝල්", buyer: "සාප්පු / හෝටල්", pending: "පොරොත්තුවෙන්", verified: "සත්‍යාපිත", rejected: "ප්‍රතික්ෂේපිත", approve: "සත්‍යාපනය කරන්න", reject: "ප්‍රතික්ෂේප කරන්න", saving: "සුරකිමින්...", empty: "පරිශීලකයන් හමු නොවීය.", loading: "පූරණය වෙමින්...", error: "පරිපාලන දත්ත ලබාගැනීමට නොහැකි විය.", logout: "ඉවත් වන්න" }
    : { title: "Admin Dashboard", subtitle: "Manage users, mills, farmers, and verification status.", users: "Users", all: "All", farmer: "Farmers", mill: "Mills", buyer: "Shops / Hotels", pending: "Pending", verified: "Verified", rejected: "Rejected", approve: "Verify", reject: "Reject", saving: "Saving...", empty: "No users found.", loading: "Loading...", error: "Unable to load admin data.", logout: "Logout" };

  function authHeaders() {
    const token = localStorage.getItem("vee-market-token") || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" } : null;
  }

  async function loadUsers() {
    const headers = authHeaders();
    if (!headers) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, { headers, cache: "no-store" });
      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || text.error);
      setUsers(await response.json());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, [language]);

  async function updateVerification(userId: number, status: "VERIFIED" | "REJECTED") {
    const headers = authHeaders();
    if (!headers) return;
    try {
      setSaving(userId);
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/verification`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || text.error);
      const updated = (await response.json()) as AdminUser;
      setUsers((current) => current.map((user) => user.id === updated.id ? updated : user));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text.error);
    } finally {
      setSaving(null);
    }
  }

  function logout() {
    ["vee-market-token", "vee-market-user-id", "vee-market-user-email", "vee-market-user-role", "token"].forEach((key) => localStorage.removeItem(key));
    router.replace("/login");
  }

  const visibleUsers = useMemo(() => filter === "ALL" ? users : users.filter((user) => user.role === filter), [filter, users]);
  const roleLabel = (role: AdminUser["role"]) => role === "FARMER" ? text.farmer : role === "MILL" ? text.mill : role === "BUYER" ? text.buyer : "Admin";
  const statusLabel = (status?: AdminUser["verificationStatus"]) => status === "VERIFIED" ? text.verified : status === "REJECTED" ? text.rejected : text.pending;

  return <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white"><header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6"><Link href="/dashboard/admin" className="font-bold text-emerald-700 dark:text-emerald-400">Vee Market</Link><div className="flex items-center gap-2"><LanguageSwitcher /><ThemeSwitcher /><button onClick={logout} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">{text.logout}</button></div></div></header><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10"><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{text.title}</h1><p className="mt-2 text-slate-600 dark:text-slate-400">{text.subtitle}</p><div className="mt-8 flex flex-wrap gap-2"><span className="mr-2 self-center text-sm font-semibold">{text.users}:</span>{[["ALL", text.all], ["FARMER", text.farmer], ["MILL", text.mill], ["BUYER", text.buyer]].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filter === value ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-emerald-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"}`}>{label}</button>)}</div>{error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}{loading ? <p className="mt-8 text-slate-500 dark:text-slate-400">{text.loading}</p> : visibleUsers.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><p className="font-semibold">{text.empty}</p></div> : <div className="mt-8 grid gap-4 lg:grid-cols-2">{visibleUsers.map((user) => <article key={user.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{roleLabel(user.role)}</p><h2 className="mt-1 text-xl font-bold">{user.profileName || user.name}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p><p className="text-sm text-slate-500 dark:text-slate-400">{user.phone || "—"}</p></div>{user.verificationStatus && <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.verificationStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : user.verificationStatus === "REJECTED" ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"}`}>{statusLabel(user.verificationStatus)}</span>}</div>{user.verificationStatus && user.role !== "ADMIN" && <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-800"><button type="button" disabled={saving === user.id} onClick={() => updateVerification(user.id, "VERIFIED")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">{saving === user.id ? text.saving : text.approve}</button><button type="button" disabled={saving === user.id} onClick={() => updateVerification(user.id, "REJECTED")} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30">{text.reject}</button></div>}</article>)}</div>}</div></main>;
}
