"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";
import { Button, StatusBadge, EmptyState, ErrorBanner } from "../../components/ui/SharedUI";

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
  const isSinhala = language === "si";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      title: isSinhala ? "පරිපාලක පාලන මධ්‍යස්ථානය" : "System Administration",
      subtitle: isSinhala
        ? "පද්ධතියේ සියලුම ගොවීන්, සහල් මෝල් සහ ගැනුම්කරුවන්ගේ සත්‍යාපන තත්ත්වයන් මෙතැනින් කළමනාකරණය කරන්න."
        : "Manage users, verify rice mills and wholesale businesses, and audit platform accounts.",
      filters: {
        all: isSinhala ? "සියල්ල" : "All",
        pending: isSinhala ? "අනුමැතිය අවශ්‍ය" : "Pending Approval",
        farmer: isSinhala ? "ගොවීන්" : "Farmers",
        mill: isSinhala ? "මෝල්" : "Rice Mills",
        buyer: isSinhala ? "සාප්පු / හෝටල්" : "Wholesale Buyers",
      },
      searchPlaceholder: isSinhala
        ? "නම, විද්‍යුත් තැපෑල හෝ ව්‍යාපාරය සොයන්න..."
        : "Search by name, email, or role...",
      approveBtn: isSinhala ? "සත්‍යාපනය කරන්න" : "Approve",
      rejectBtn: isSinhala ? "ප්‍රතික්ෂේප කරන්න" : "Reject",
      loadingText: isSinhala ? "පරිශීලකයන් ලබාගනිමින්..." : "Loading system users...",
      errorText: isSinhala ? "දත්ත ලබාගැනීමට නොහැකි විය." : "Failed to load users.",
      emptyTitle: isSinhala ? "පරිශීලකයන් කිසිවෙකු හමු නොවීය" : "No Users Found",
      emptyDesc: isSinhala
        ? "ඔබ සෙවූ නිර්ණායක වලට අදාළ කිසිදු ගිණුමක් හමු නොවීය."
        : "No registered accounts matched your search and filter criteria.",
    }),
    [isSinhala]
  );

  function authHeaders() {
    const token =
      localStorage.getItem("vee-market-token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("vee_market_token");
    return token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        }
      : null;
  }

  async function loadUsers() {
    const headers = authHeaders();
    if (!headers) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers,
        cache: "no-store",
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!res.ok) throw new Error(t.errorText);

      const data = (await res.json()) as AdminUser[];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateVerification(
    userId: number,
    status: "VERIFIED" | "REJECTED" | "PENDING"
  ) {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setSavingId(userId);
      setError(null);

      const res = await fetch(
        `${API_URL}/api/admin/users/${userId}/verification?status=${status}`,
        {
          method: "PATCH",
          headers,
        }
      );

      if (!res.ok) throw new Error("Could not update verification status");

      const updated = (await res.json()) as AdminUser;
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setNotification(`User #${userId} status updated to ${status}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating verification");
    } finally {
      setSavingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filter === "PENDING" && u.verificationStatus !== "PENDING") return false;
      if (filter === "FARMER" && u.role !== "FARMER") return false;
      if (filter === "MILL" && u.role !== "MILL") return false;
      if (filter === "BUYER" && u.role !== "BUYER") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.profileName && u.profileName.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [users, filter, searchQuery]);

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge="Admin" roleType="ADMIN" />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        {error && <ErrorBanner message={error} onRetry={loadUsers} />}

        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ {notification}
          </div>
        )}

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
            {(["ALL", "PENDING", "FARMER", "MILL", "BUYER"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilter(m)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap select-none ${
                  filter === m
                    ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {t.filters[m.toLowerCase() as keyof typeof t.filters] || m}
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* USERS LIST: RESPONSIVE CARDS */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold">{t.loadingText}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title={t.emptyTitle}
            description={t.emptyDesc}
            icon="👥"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <article
                key={u.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {u.role} #{u.id}
                      </span>
                      <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
                        {u.name}
                      </h2>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    {u.verificationStatus && (
                      <StatusBadge status={u.verificationStatus} size="sm" />
                    )}
                  </div>

                  {u.profileName && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/60 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Business: {u.profileName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center gap-2">
                  <Button
                    onClick={() => updateVerification(u.id, "VERIFIED")}
                    variant="primary"
                    size="sm"
                    loading={savingId === u.id}
                    className="font-bold flex-1"
                  >
                    ✓ {t.approveBtn}
                  </Button>
                  <Button
                    onClick={() => updateVerification(u.id, "REJECTED")}
                    variant="outline"
                    size="sm"
                    loading={savingId === u.id}
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 flex-1"
                  >
                    ✕ {t.rejectBtn}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
