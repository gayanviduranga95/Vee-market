"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

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
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const t = {
    title: isSinhala ? "පරිපාලක පාලන මධ්‍යස්ථානය" : "Admin Command Center",
    subtitle: isSinhala
      ? "පද්ධතියේ සියලුම පරිශීලකයන්, මෝල්, ගොවීන් සහ සත්‍යාපන තත්ත්වයන් මෙතැනින් කළමනාකරණය කරන්න."
      : "Manage all system users, rice mills, farmers, and identity verifications.",
    stats: {
      total: isSinhala ? "මුළු පරිශීලකයන්" : "Total Users",
      farmers: isSinhala ? "ගොවීන්" : "Farmers",
      mills: isSinhala ? "සහල් මෝල්" : "Rice Mills",
      buyers: isSinhala ? "සාප්පු / හෝටල්" : "Shops & Hotels",
      pending: isSinhala ? "සත්‍යාපනය පමා වූවන්" : "Pending Verifications",
    },
    filters: {
      all: isSinhala ? "සියල්ල" : "All",
      pending: isSinhala ? "⏳ අනුමැතිය අවශ්‍ය" : "⏳ Pending Approval",
      farmer: isSinhala ? "🌾 ගොවීන්" : "🌾 Farmers",
      mill: isSinhala ? "🏭 මෝල්" : "🏭 Rice Mills",
      buyer: isSinhala ? "🏪 සාප්පු / හෝටල්" : "🏪 Shops & Hotels",
    },
    searchPlaceholder: isSinhala
      ? "නම, ඊමේල් හෝ ව්‍යාපාරයේ නම අනුව සොයන්න..."
      : "Search by name, email, or business name...",
    actions: {
      approve: isSinhala ? "සත්‍යාපනය කරන්න" : "Approve",
      reject: isSinhala ? "ප්‍රතික්ෂේප කරන්න" : "Reject",
      resetPending: isSinhala ? "නැවත පොරොත්තු කරන්න" : "Set Pending",
      updating: isSinhala ? "යාවත්කාලීන වෙමින්..." : "Updating...",
    },
    status: {
      verified: isSinhala ? "සත්‍යාපිතයි" : "Verified",
      rejected: isSinhala ? "ප්‍රතික්ෂේපිතයි" : "Rejected",
      pending: isSinhala ? "අනුමැතිය පමායි" : "Pending Verification",
      notApplicable: isSinhala ? "සම්මත ගිණුම" : "Standard Account",
    },
    registered: isSinhala ? "ලියාපදිංචි දිනය" : "Registered",
    phone: isSinhala ? "දුරකථනය" : "Phone",
    email: isSinhala ? "විද්‍යුත් තැපෑල" : "Email",
    empty: isSinhala
      ? "පරිශීලකයන් කිසිවෙකු හමු නොවීය."
      : "No users matched your query.",
    loading: isSinhala ? "දත්ත ලබාගනිමින්..." : "Loading system users...",
    error: isSinhala
      ? "පරිපාලන දත්ත ලබාගැනීමට නොහැකි විය."
      : "Failed to load admin user data.",
    refresh: isSinhala ? "යාවත්කාලීන කරන්න" : "Refresh",
  };

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
      setError("");
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers,
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          (await response.json().catch(() => null))?.message || t.error
        );
      }

      const data = (await response.json()) as AdminUser[];
      setUsers(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateVerification(
    userId: number,
    status: "VERIFIED" | "REJECTED" | "PENDING"
  ) {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setSavingId(userId);
      setError("");
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/verification`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.json().catch(() => null))?.message || t.error
        );
      }

      const updated = (await response.json()) as AdminUser;
      setUsers((current) =>
        current.map((u) => (u.id === updated.id ? updated : u))
      );

      setNotification(
        isSinhala
          ? `පරිශීලක #${userId} ගේ තත්ත්වය ${status} ලෙස සාර්ථකව යාවත්කාලීන විය.`
          : `User #${userId} verification status updated to ${status}.`
      );
      setTimeout(() => setNotification(null), 3500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.error);
    } finally {
      setSavingId(null);
    }
  }

  // Summary counts
  const totalCount = users.length;
  const farmerCount = users.filter((u) => u.role === "FARMER").length;
  const millCount = users.filter((u) => u.role === "MILL").length;
  const buyerCount = users.filter((u) => u.role === "BUYER").length;
  const pendingCount = users.filter(
    (u) => u.verificationStatus === "PENDING"
  ).length;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filter === "PENDING_APPROVAL") {
        if (u.verificationStatus !== "PENDING") return false;
      } else if (filter !== "ALL") {
        if (u.role !== filter) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(query);
        const matchesEmail = u.email.toLowerCase().includes(query);
        const matchesProfile = (u.profileName || "")
          .toLowerCase()
          .includes(query);
        const matchesPhone = (u.phone || "").toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesEmail &&
          !matchesProfile &&
          !matchesPhone
        ) {
          return false;
        }
      }

      return true;
    });
  }, [users, filter, searchQuery]);

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-800 dark:bg-slate-950 dark:text-white">
      {/* SHARED BRAND HEADER */}
      <VeeHeader roleBadge="Admin" roleType="ADMIN" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* HERO BANNER (MATCHES VEE MARKET GREEN DESIGN) */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#04351f] via-[#063b25] to-[#087f3f] p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur">
                  👑 {isSinhala ? "පරිපාලක පුවරුව" : "Control Hub"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t.title}
              </h1>
              <p className="mt-1 text-sm text-emerald-100 max-w-2xl">
                {t.subtitle}
              </p>
            </div>

            <button
              onClick={loadUsers}
              disabled={loading}
              className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-xs font-bold text-white backdrop-blur border border-white/20 transition disabled:opacity-50"
            >
              <span>🔄</span>
              <span>{t.refresh}</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION */}
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-[#087f3f] dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-3">
            <span>✅</span>
            <span>{notification}</span>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* STATS OVERVIEW CARDS (MATCHES FARMER DASHBOARD CARDS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.stats.total}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-[#087f3f] dark:text-emerald-400 flex items-center gap-1">
              <span>🌾</span> {t.stats.farmers}
            </p>
            <p className="mt-2 text-2xl font-black text-[#063b25] dark:text-emerald-300">
              {farmerCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <span>🏭</span> {t.stats.mills}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {millCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <span>🏪</span> {t.stats.buyers}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {buyerCount}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <span>⏳</span> {t.stats.pending}
            </p>
            <p className="mt-2 text-2xl font-black text-amber-900 dark:text-amber-200">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087f3f] focus:bg-white focus:ring-4 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* FILTER PILLS */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[
              ["ALL", t.filters.all],
              ["PENDING_APPROVAL", t.filters.pending],
              ["FARMER", t.filters.farmer],
              ["MILL", t.filters.mill],
              ["BUYER", t.filters.buyer],
            ].map(([value, label]) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    active
                      ? "bg-[#087f3f] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* USERS LIST */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#087f3f] border-t-transparent mb-3" />
            <p className="font-semibold text-sm">{t.loading}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 font-bold text-slate-700 dark:text-slate-300">
              {t.empty}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredUsers.map((user) => {
              const isSaving = savingId === user.id;

              return (
                <article
                  key={user.id}
                  className="relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    {/* TOP INFO ROW */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* AVATAR MATCHING FARMER DASHBOARD */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dfeee2] text-[#08763b] font-bold text-base shadow-inner dark:bg-emerald-950 dark:text-emerald-300">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wide text-[#087f3f] dark:text-emerald-400">
                              {user.role}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-400 font-mono">
                              ID #{user.id}
                            </span>
                          </div>

                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {user.name}
                          </h2>

                          {user.profileName && (
                            <p className="text-xs font-semibold text-[#087f3f] dark:text-emerald-400">
                              🏷️ {user.profileName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* VERIFICATION BADGE */}
                      {user.verificationStatus ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.verificationStatus === "VERIFIED"
                              ? "bg-emerald-50 text-[#087f3f] border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                              : user.verificationStatus === "REJECTED"
                              ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                              : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {user.verificationStatus === "VERIFIED"
                            ? t.status.verified
                            : user.verificationStatus === "REJECTED"
                            ? t.status.rejected
                            : t.status.pending}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {t.status.notApplicable}
                        </span>
                      )}
                    </div>

                    {/* CONTACT DETAILS */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          {t.email}:
                        </span>{" "}
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {user.email}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          {t.phone}:
                        </span>{" "}
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {user.phone || "—"}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          {t.registered}:
                        </span>{" "}
                        <span className="text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString(
                            isSinhala ? "si-LK" : "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  {user.role !== "ADMIN" && (
                    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800 flex flex-wrap items-center gap-2">
                      {user.verificationStatus !== "VERIFIED" && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => updateVerification(user.id, "VERIFIED")}
                          className="flex items-center gap-1.5 rounded-xl bg-[#087f3f] hover:bg-[#076f37] px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
                        >
                          <span>✓</span>
                          <span>{t.actions.approve}</span>
                        </button>
                      )}

                      {user.verificationStatus !== "REJECTED" && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => updateVerification(user.id, "REJECTED")}
                          className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition disabled:opacity-50 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                        >
                          <span>✕</span>
                          <span>{t.actions.reject}</span>
                        </button>
                      )}

                      {user.verificationStatus && user.verificationStatus !== "PENDING" && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => updateVerification(user.id, "PENDING")}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          {t.actions.resetPending}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
