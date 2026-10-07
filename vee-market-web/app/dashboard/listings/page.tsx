"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import VeeHeader from "../../components/VeeHeader";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type PaddyLot = {
  id: number;
  productType?: string;
  riceType?: string;
  quantityKg?: number;
  askingPricePerKg?: number;
  availableDate?: string;
  status?: string;
  createdAt?: string;
};

export default function ListingsPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [lots, setLots] = useState<PaddyLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const text =
    language === "si"
      ? {
          title: "මගේ වී තොග",
          subtitle:
            "ඔබ වෙළඳපොළට එකතු කළ සියලුම වී තොග කළමනාකරණය කරන්න.",

          backDashboard: "පාලක පුවරුව",
          addLot: "වී තොගයක් එකතු කරන්න",

          all: "සියල්ල",
          active: "සක්‍රීය",
          sold: "විකුණා ඇත",

          allLots: "සියලුම වී තොග",
          activeLots: "සක්‍රීය වී තොග",
          soldLots: "විකුණූ තොග",

          quantity: "ප්‍රමාණය",
          price: "ඉල්ලුම් මිල",
          available: "ලබා ගත හැකි දිනය",
          status: "තත්ත්වය",

          viewDetails: "විස්තර බලන්න",

          noLots: "තවමත් වී තොග නොමැත",
          noLotsDescription:
            "ඔබේ පළමු වී තොගය එකතු කර මෝල් වෙතින් ලංසු ලබා ගැනීම ආරම්භ කරන්න.",

          createFirst: "පළමු වී තොගය එකතු කරන්න",

          loading: "වී තොග ලබා ගනිමින්...",

          activeStatus: "සක්‍රීය",
          soldStatus: "විකුණා ඇත",
          pendingStatus: "පොරොත්තුවෙන්",
          cancelledStatus: "අවලංගු",

          loadError: "වී තොග ලබා ගැනීමට නොහැකි විය.",

          totalValue: "මුළු ඇස්තමේන්තු වටිනාකම",
          lots: "තොග",
          kg: "kg",

          nadu: "නාඩු",
          samba: "සම්බා",
          keeriSamba: "කීරි සම්බා",
          redNadu: "රතු නාඩු",

          noDate: "දිනයක් සඳහන් කර නැත",

          retry: "නැවත උත්සාහ කරන්න",

          debugTitle: "API දෝෂය",
          apiStatus: "API තත්ත්වය",
        }
      : {
          title: "My Paddy Lots",
          subtitle:
            "Manage all the paddy lots you have added to the Vee Market.",

          backDashboard: "Dashboard",
          addLot: "Add Paddy Lot",

          all: "All",
          active: "Active",
          sold: "Sold",

          allLots: "All Paddy Lots",
          activeLots: "Active Paddy Lots",
          soldLots: "Sold Lots",

          quantity: "Quantity",
          price: "Asking Price",
          available: "Available",
          status: "Status",

          viewDetails: "View Details",

          noLots: "No paddy lots yet",
          noLotsDescription:
            "Add your first paddy lot and start receiving bids from mills.",

          createFirst: "Add Your First Lot",

          loading: "Loading paddy lots...",

          activeStatus: "Active",
          soldStatus: "Sold",
          pendingStatus: "Pending",
          cancelledStatus: "Cancelled",

          loadError: "Unable to load your paddy lots.",

          totalValue: "Estimated Total Value",
          lots: "lots",
          kg: "kg",

          nadu: "Nadu",
          samba: "Samba",
          keeriSamba: "Keeri Samba",
          redNadu: "Red Nadu",

          noDate: "No date specified",

          retry: "Retry",

          debugTitle: "API Error",
          apiStatus: "API Status",
        };

  const getToken = () => {
    return (
      localStorage.getItem("vee-market-token") ||
      localStorage.getItem("token")
    );
  };

  // =========================================================
  // LOAD FARMER LOTS
  // =========================================================

  const loadLots = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      console.log("====================================");
      console.log("VEE MARKET - LOAD FARMER LOTS");
      console.log("====================================");
      console.log("API URL:", API_URL);
      console.log("Token exists:", Boolean(token));

      if (!token) {
        console.error("No JWT token found.");

        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/farmer/lots`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // IMPORTANT:
      // Read the response as text first.
      // This allows us to see the real Spring Boot error.
      const responseText = await response.text();

      console.log("GET /api/farmer/lots");
      console.log("HTTP Status:", response.status);
      console.log("Response:", responseText);

      // -------------------------------------------------------
      // Authentication error
      // -------------------------------------------------------

      if (response.status === 401 || response.status === 403) {
        console.error(
          "Authentication/authorization failed:",
          response.status
        );

        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("vee-market-user-id");
        localStorage.removeItem("vee-market-user-email");
        localStorage.removeItem("vee-market-user-role");
        localStorage.removeItem("token");

        router.push("/login");
        return;
      }

      // -------------------------------------------------------
      // Any other API error
      // -------------------------------------------------------

      if (!response.ok) {
        let backendMessage = responseText;

        try {
          const errorJson = JSON.parse(responseText);

          backendMessage =
            errorJson?.message ||
            errorJson?.error ||
            errorJson?.detail ||
            responseText;
        } catch {
          // Response wasn't JSON.
          // Keep the original response text.
        }

        console.error("====================================");
        console.error("FARMER LOT API ERROR");
        console.error("Status:", response.status);
        console.error("Message:", backendMessage);
        console.error("====================================");

        throw new Error(
          `${text.debugTitle}: HTTP ${response.status}${
            backendMessage ? ` — ${backendMessage}` : ""
          }`
        );
      }

      // -------------------------------------------------------
      // Successful response
      // -------------------------------------------------------

      let data: unknown = [];

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse API response:", parseError);

          throw new Error(
            language === "si"
              ? "සේවාදායකයෙන් ලැබුණු දත්ත කියවීමට නොහැකි විය."
              : "Unable to read the data returned by the server."
          );
        }
      }

      console.log("Successfully loaded farmer lots:", data);

      if (Array.isArray(data)) {
        setLots(data);
      } else if (
        data &&
        typeof data === "object" &&
        "content" in data &&
        Array.isArray(
          (data as { content?: unknown }).content
        )
      ) {
        setLots(
          (data as { content: PaddyLot[] }).content
        );
      } else if (
        data &&
        typeof data === "object" &&
        "data" in data &&
        Array.isArray(
          (data as { data?: unknown }).data
        )
      ) {
        setLots(
          (data as { data: PaddyLot[] }).data
        );
      } else {
        console.warn(
          "Unexpected lots response format:",
          data
        );

        setLots([]);
      }
    } catch (err) {
      console.error("====================================");
      console.error("LOAD LOTS FAILED");
      console.error(err);
      console.error("====================================");

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(text.loadError);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadLots();
  }, []);

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const activeLots = useMemo(() => {
    return lots.filter(
      (lot) =>
        (lot.status || "").toUpperCase() === "ACTIVE"
    );
  }, [lots]);

  const soldLots = useMemo(() => {
    return lots.filter(
      (lot) =>
        (lot.status || "").toUpperCase() === "SOLD"
    );
  }, [lots]);

  const totalQuantity = useMemo(() => {
    return lots.reduce((sum, lot) => {
      return sum + Number(lot.quantityKg || 0);
    }, 0);
  }, [lots]);

  const totalValue = useMemo(() => {
    return lots.reduce((sum, lot) => {
      return (
        sum +
        Number(lot.quantityKg || 0) *
          Number(lot.askingPricePerKg || 0)
      );
    }, 0);
  }, [lots]);

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return text.noDate;
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      language === "si" ? "si-LK" : "en-LK",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const getRiceType = (riceType?: string) => {
    const type = (riceType || "").toUpperCase();

    switch (type) {
      case "NADU":
        return text.nadu;

      case "SAMBA":
        return text.samba;

      case "KEERI_SAMBA":
        return text.keeriSamba;

      case "RED_NADU":
        return text.redNadu;

      default:
        return riceType || "-";
    }
  };

  const getStatus = (status?: string) => {
    const value = (status || "ACTIVE").toUpperCase();

    switch (value) {
      case "ACTIVE":
        return {
          label: text.activeStatus,
          className:
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
        };

      case "SOLD":
        return {
          label: text.soldStatus,
          className:
            "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
        };

      case "PENDING":
        return {
          label: text.pendingStatus,
          className:
            "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
        };

      case "CANCELLED":
        return {
          label: text.cancelledStatus,
          className:
            "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
        };

      default:
        return {
          label: status || "-",
          className:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-900 dark:border-t-emerald-400" />

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {text.loading}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={language === "si" ? "වී තොග" : "Paddy Lots"} roleType="FARMER" />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">

        {/* Back */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
        >
          ← {text.backDashboard}
        </Link>

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              🌾 Farmer Marketplace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {text.title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              {text.subtitle}
            </p>
          </div>

          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <span className="text-lg">+</span>
            {text.addLot}
          </Link>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">

            <div className="flex items-start justify-between gap-4">

              <div className="flex min-w-0 items-start gap-3">

                <span className="text-lg">
                  ⚠️
                </span>

                <div className="min-w-0">

                  <p className="font-semibold text-red-700 dark:text-red-300">
                    {text.loadError}
                  </p>

                  <p className="mt-2 break-words font-mono text-xs leading-5 text-red-600 dark:text-red-400">
                    {error}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={loadLots}
                className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/50"
              >
                {text.retry}
              </button>

            </div>

            {/* Debug information */}
            <div className="mt-4 border-t border-red-200 pt-3 dark:border-red-900/50">

              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500 dark:text-red-400">
                {text.debugTitle}
              </p>

              <p className="mt-1 break-all font-mono text-xs text-red-600 dark:text-red-400">
                GET {API_URL}/api/farmer/lots
              </p>

            </div>
          </div>
        )}

        {/* ===================================================
            STATS
        =================================================== */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* Total lots */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-4 flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl dark:bg-emerald-950/40">
                🌾
              </div>

              <span className="text-xs font-medium text-slate-400">
                {text.lots}
              </span>

            </div>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {lots.length}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {text.allLots}
            </p>

          </div>

          {/* Active */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-4 flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-xl dark:bg-green-950/40">
                🟢
              </div>

              <span className="text-xs font-medium text-slate-400">
                {text.active}
              </span>

            </div>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeLots.length}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {text.activeLots}
            </p>

          </div>

          {/* Quantity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-4 flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950/40">
                ⚖️
              </div>

              <span className="text-xs font-medium text-slate-400">
                {text.kg}
              </span>

            </div>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatNumber(totalQuantity)}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {text.quantity}
            </p>

          </div>

          {/* Total value */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-4 flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl dark:bg-amber-950/40">
                💰
              </div>

              <span className="text-xs font-medium text-slate-400">
                LKR
              </span>

            </div>

            <p className="text-lg font-bold text-slate-900 dark:text-white sm:text-2xl">
              {formatCurrency(totalValue)}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {text.totalValue}
            </p>

          </div>

        </div>

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {lots.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-4xl dark:bg-emerald-950/40">
              🌾
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {text.noLots}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {text.noLotsDescription}
            </p>

            <Link
              href="/dashboard/listings/new"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <span>+</span>
              {text.createFirst}
            </Link>

          </div>

        ) : (

          /* =================================================
             LOT LIST
          ================================================= */

          <div className="space-y-4">

            {lots.map((lot) => {

              const status = getStatus(lot.status);

              return (
                <div
                  key={lot.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900 sm:p-6"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* LEFT */}
                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl dark:bg-emerald-950/40">
                        🌾
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {getRiceType(lot.riceType)}
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>

                        </div>

                        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                          {lot.productType || "PADDY"} • LOT #{lot.id}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">

                          <div>
                            <p className="text-xs text-slate-400">
                              {text.quantity}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {formatNumber(
                                Number(lot.quantityKg || 0)
                              )}{" "}
                              kg
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              {text.price}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {formatCurrency(
                                Number(
                                  lot.askingPricePerKg || 0
                                )
                              )}{" "}
                              / kg
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              {text.available}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {formatDate(
                                lot.availableDate
                              )}
                            </p>
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}
                    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 lg:border-0 lg:pt-0">

                      <div className="hidden text-right sm:block">

                        <p className="text-xs text-slate-400">
                          {text.status}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {status.label}
                        </p>

                      </div>

                      <Link
                        href={`/dashboard/listings/${lot.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
                      >
                        {text.viewDetails}
                        <span>→</span>
                      </Link>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* ===================================================
            BOTTOM CTA
        =================================================== */}

        {lots.length > 0 && (

          <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {language === "si"
                    ? "තවත් වී තොගයක් තිබේද?"
                    : "Have more paddy to sell?"}
                </h3>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {language === "si"
                    ? "නව තොගයක් එකතු කර තවත් මෝල් වෙත ළඟා වන්න."
                    : "Add another lot and reach more mills."}
                </p>

              </div>

              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                + {text.addLot}
              </Link>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}