"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../../components/LanguageProvider";
import VeeHeader from "../../../components/VeeHeader";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Farm = {
  id: number;
  farmName: string;
  location?: string;
  landSize?: number;
  mainCrop?: string;
};

export default function NewPaddyLotPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [farmLoadAttempt, setFarmLoadAttempt] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    farmId: "",
    productType: "PADDY",
    riceType: "NADU",
    quantityKg: "",
    askingPricePerKg: "",
    availableDate: "",
  });

  const t = {
    en: {
      title: "Add Paddy Lot",
      subtitle: "Create a new paddy lot for mills to discover and bid on.",

      back: "Back to My Paddy Lots",

      farm: "Farm",
      selectFarm: "Select your farm",
      noFarms: "No farms found. Please create a farm first.",

      productType: "Product Type",
      paddy: "Paddy",

      riceType: "Rice Type",
      nadu: "Nadu",
      samba: "Samba",
      keeriSamba: "Keeri Samba",
      redNadu: "Red Nadu",
      rawRice: "Raw Rice",

      quantity: "Quantity",
      quantityPlaceholder: "Enter quantity",
      kg: "kg",

      askingPrice: "Asking Price",
      pricePlaceholder: "Enter your asking price",
      lkrPerKg: "LKR / kg",

      availableDate: "Available Date",

      createLot: "Create Paddy Lot",
      creating: "Creating...",

      required: "Please fill in all required fields.",
      invalidQuantity: "Quantity must be greater than zero.",
      invalidPrice: "Asking price must be greater than zero.",
      invalidDate: "Please select an available date.",

      success: "Paddy lot created successfully!",

      loadError: "Unable to load your farms.",
      createError: "Unable to create the paddy lot.",

      noFarmTitle: "You don't have a farm yet",
      noFarmDescription:
        "Create a farm before adding a paddy lot to Vee Market.",
      createFarm: "Create Farm",

      lotInfo: "Lot Information",
      pricingInfo: "Pricing",
      availabilityInfo: "Availability",

      secureTitle: "Ready for the marketplace",
      secureDescription:
        "After creating this lot, nearby mills will be able to discover it and submit bids.",
    },

    si: {
      title: "වී තොගයක් එකතු කරන්න",
      subtitle:
        "මෝල් වෙත පෙන්වා ලංසු ලබා ගැනීම සඳහා නව වී තොගයක් සාදන්න.",

      back: "මගේ වී තොග වෙත",

      farm: "ගොවිපළ",
      selectFarm: "ඔබේ ගොවිපළ තෝරන්න",
      noFarms: "ගොවිපළක් හමු නොවීය. පළමුව ගොවිපළක් සාදන්න.",

      productType: "නිෂ්පාදන වර්ගය",
      paddy: "වී",

      riceType: "වී වර්ගය",
      nadu: "නාඩු",
      samba: "සම්බා",
      keeriSamba: "කීරි සම්බා",
      redNadu: "රතු නාඩු",
      rawRice: "අමු සහල්",

      quantity: "ප්‍රමාණය",
      quantityPlaceholder: "ප්‍රමාණය ඇතුළත් කරන්න",
      kg: "කිලෝග්‍රෑම්",

      askingPrice: "ඉල්ලුම් මිල",
      pricePlaceholder: "ඔබේ ඉල්ලුම් මිල ඇතුළත් කරන්න",
      lkrPerKg: "රු. / කිලෝග්‍රෑම්",

      availableDate: "ලබා ගත හැකි දිනය",

      createLot: "වී තොගය සාදන්න",
      creating: "සාදමින්...",

      required: "අවශ්‍ය සියලු තොරතුරු ඇතුළත් කරන්න.",
      invalidQuantity: "ප්‍රමාණය ශුන්‍යයට වඩා වැඩි විය යුතුය.",
      invalidPrice: "ඉල්ලුම් මිල ශුන්‍යයට වඩා වැඩි විය යුතුය.",
      invalidDate: "ලබා ගත හැකි දිනය තෝරන්න.",

      success: "වී තොගය සාර්ථකව සාදන ලදී!",

      loadError: "ඔබගේ ගොවිපළ ලබා ගැනීමට නොහැකි විය.",
      createError: "වී තොගය සෑදීමට නොහැකි විය.",

      noFarmTitle: "ඔබට තවමත් ගොවිපළක් නොමැත",
      noFarmDescription:
        "Vee Market වෙත වී තොගයක් එකතු කිරීමට පෙර ගොවිපළක් සාදන්න.",
      createFarm: "ගොවිපළක් සාදන්න",

      lotInfo: "තොග තොරතුරු",
      pricingInfo: "මිල තොරතුරු",
      availabilityInfo: "ලබා ගැනීමේ තොරතුරු",

      secureTitle: "වෙළඳපොළට සූදානම්",
      secureDescription:
        "මෙම තොගය සෑදූ පසු අවට මෝල්වලට එය දැක ලංසු ඉදිරිපත් කළ හැක.",
    },
  };

  const text = language === "si" ? t.si : t.en;

  // ---------------------------------------------------------
  // Load farms
  // ---------------------------------------------------------
  useEffect(() => {
    const loadFarms = async () => {
      try {
        setLoadingFarms(true);
        setError("");

        const token =
          localStorage.getItem("vee-market-token") ||
          localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/farmer/farms`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("vee-market-token");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const responseText = await response.text();
          let message = text.loadError;

          try {
            const errorData = JSON.parse(responseText);
            message =
              errorData?.message ||
              errorData?.error ||
              message;
          } catch {
            if (responseText.trim()) {
              message = responseText;
            }
          }

          throw new Error(message);
        }

        const data = await response.json();

        setFarms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load farms error:", err);
        setError(text.loadError);
      } finally {
        setLoadingFarms(false);
      }
    };

    loadFarms();
  }, [router, language, farmLoadAttempt]);

  // ---------------------------------------------------------
  // Input handler
  // ---------------------------------------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.farmId ||
      !form.productType ||
      !form.riceType ||
      !form.quantityKg ||
      !form.askingPricePerKg ||
      !form.availableDate
    ) {
      setError(text.required);
      return;
    }

    const quantity = Number(form.quantityKg);
    const price = Number(form.askingPricePerKg);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError(text.invalidQuantity);
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError(text.invalidPrice);
      return;
    }

    if (!form.availableDate) {
      setError(text.invalidDate);
      return;
    }

    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("vee-market-token") ||
        localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/farmer/lots`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmId: Number(form.farmId),
          productType: form.productType,
          riceType: form.riceType,
          quantityKg: quantity,
          askingPricePerKg: price,
          availableDate: form.availableDate,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            text.createError
        );
      }

      setSuccess(text.success);

      // Give the user a moment to see the success message.
      setTimeout(() => {
        router.push("/dashboard/listings");
        router.refresh();
      }, 900);
    } catch (err) {
      console.error("Create lot error:", err);

      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(text.createError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------
  if (loadingFarms) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-900 dark:border-t-emerald-400" />

            <p className="text-sm text-slate-600 dark:text-slate-400">
              {language === "si"
                ? "ගොවිපළ තොරතුරු ලබා ගනිමින්..."
                : "Loading your farms..."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !farms.length) {
    return (
      <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <VeeHeader roleBadge={language === "si" ? "නව තොගය" : "New Lot"} roleType="FARMER" />

        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl items-start justify-center px-6 py-12">
          <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/60 dark:bg-red-950/30">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl dark:bg-red-950/60">
              ⚠️
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {text.loadError}
            </h1>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => setFarmLoadAttempt((attempt) => attempt + 1)}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {language === "si" ? "නැවත උත්සාහ කරන්න" : "Try again"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // No farms
  // ---------------------------------------------------------
  if (!farms.length) {
    return (
      <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <VeeHeader roleBadge={language === "si" ? "නව තොගය" : "New Lot"} roleType="FARMER" />

        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl items-center justify-center px-6 py-12">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-4xl dark:bg-emerald-950/50">
              🌾
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {text.noFarmTitle}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              {text.noFarmDescription}
            </p>

            <Link
              href="/dashboard/farms/new"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              + {text.createFarm}
            </Link>

            <div className="mt-4">
              <Link
                href="/dashboard/listings"
                className="text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400"
              >
                ← {text.back}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // Main form
  // ---------------------------------------------------------
  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={language === "si" ? "නව තොගය" : "New Lot"} roleType="FARMER" />

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Back */}
        <Link
          href="/dashboard/listings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
        >
          ← {text.back}
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            🌾 Vee Market
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {text.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
            {text.subtitle}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <span className="text-lg">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span className="text-lg">✓</span>
            <p>{success}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Card header */}
            <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800 sm:px-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {text.lotInfo}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {language === "si"
                  ? "ඔබේ වී තොගය පිළිබඳ තොරතුරු ඇතුළත් කරන්න."
                  : "Enter the details of the paddy you want to sell."}
              </p>
            </div>

            <div className="space-y-7 p-6 sm:p-8">
              {/* Farm */}
              <div>
                <label
                  htmlFor="farmId"
                  className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  {text.farm} <span className="text-red-500">*</span>
                </label>

                <select
                  id="farmId"
                  name="farmId"
                  value={form.farmId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">{text.selectFarm}</option>

                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.farmName}
                      {farm.location ? ` — ${farm.location}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product + rice type */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="productType"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {text.productType}
                  </label>

                  <select
                    id="productType"
                    name="productType"
                    value={form.productType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="PADDY">{text.paddy}</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="riceType"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {text.riceType} <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="riceType"
                    name="riceType"
                    value={form.riceType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="NADU">{text.nadu}</option>
                    <option value="SAMBA">{text.samba}</option>
                    <option value="KEERI_SAMBA">{text.keeriSamba}</option>
                    <option value="RED_NADU">{text.redNadu}</option>
                    <option value="RAW_RICE">{text.rawRice}</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="quantityKg"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {text.quantity} <span className="text-red-500">*</span>
                  </label>

                  <span className="text-xs text-slate-400">
                    {text.kg}
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="quantityKg"
                    name="quantityKg"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.quantityKg}
                    onChange={handleChange}
                    placeholder={text.quantityPlaceholder}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    kg
                  </span>
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="askingPricePerKg"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {text.askingPrice}{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <span className="text-xs text-slate-400">
                    {text.lkrPerKg}
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="askingPricePerKg"
                    name="askingPricePerKg"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.askingPricePerKg}
                    onChange={handleChange}
                    placeholder={text.pricePlaceholder}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-24 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    LKR/kg
                  </span>
                </div>
              </div>

              {/* Available date */}
              <div>
                <label
                  htmlFor="availableDate"
                  className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  {text.availableDate}{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="availableDate"
                  name="availableDate"
                  type="date"
                  value={form.availableDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Submit */}
              <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {text.creating}
                    </>
                  ) : (
                    <>
                      <span>🌾</span>
                      {text.createLot}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Information panel */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-slate-900">
                🌾
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white">
                {text.secureTitle}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {text.secureDescription}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {text.pricingInfo}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {language === "si"
                  ? "ඔබට ලැබීමට අවශ්‍ය කිලෝග්‍රෑමයක අවම මිල ඇතුළත් කරන්න. මෝල්වලට පසුව තම ලංසු ඉදිරිපත් කළ හැක."
                  : "Set the price you would like to receive per kilogram. Mills can submit their bids after the lot is published."}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {text.availabilityInfo}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {language === "si"
                  ? "ඔබගේ වී තොගය මෝලට ලබා දිය හැකි දිනය තෝරන්න."
                  : "Choose the date when your paddy will be available for the mill to collect or receive."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}