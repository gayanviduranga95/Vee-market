"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useLanguage } from "../../../components/LanguageProvider";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import ThemeSwitcher from "../../../components/ThemeSwitcher";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

export default function NewFarmPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    farmName: "",
    location: "",
    landSize: "",
    mainCrop: "Paddy",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const text =
    language === "si"
      ? {
          title: "ගොවිපළක් සාදන්න",
          subtitle:
            "ඔබේ ගොවිපළේ තොරතුරු ඇතුළත් කර Vee Market වෙත එක් කරන්න.",

          back: "වී තොග වෙත",

          farmInformation: "ගොවිපළ තොරතුරු",
          farmInformationDescription:
            "ඔබේ ගොවිපළ පිළිබඳ මූලික තොරතුරු ඇතුළත් කරන්න.",

          farmName: "ගොවිපළේ නම",
          farmNamePlaceholder: "උදා: ගයාන් ගොවිපළ",

          location: "ස්ථානය",
          locationPlaceholder: "උදා: ගාල්ල, අක්මීමන",

          landSize: "ඉඩම් ප්‍රමාණය",
          landSizePlaceholder: "උදා: 2.5",

          landUnit: "අක්කර",

          mainCrop: "ප්‍රධාන බෝගය",
          paddy: "වී",
          rice: "සහල්",
          maize: "බඩ ඉරිඟු",
          vegetables: "එළවළු",
          other: "වෙනත්",

          createFarm: "ගොවිපළ සාදන්න",
          creating: "සාදමින්...",

          required: "කරුණාකර ගොවිපළේ නම ඇතුළත් කරන්න.",
          invalidLandSize:
            "ඉඩම් ප්‍රමාණය ශුන්‍යයට වඩා වැඩි විය යුතුය.",

          success: "ගොවිපළ සාර්ථකව සාදන ලදී!",

          createError: "ගොවිපළ සෑදීමට නොහැකි විය.",

          marketplaceTitle: "ඔබේ ගොවිපළ සූදානම් කරන්න",
          marketplaceDescription:
            "ගොවිපළක් එකතු කළ පසු එයට අදාළ වී තොග Vee Market වෙත එකතු කළ හැක.",

          nextStep: "ඊළඟ පියවර",
          nextStepDescription:
            "ගොවිපළ නිර්මාණය කිරීමෙන් පසු ඔබට වී තොගයක් එකතු කළ හැක.",

          requiredMark: "අවශ්‍ය",
        }
      : {
          title: "Create Farm",
          subtitle:
            "Add your farm information to Vee Market.",

          back: "Back to Paddy Lots",

          farmInformation: "Farm Information",
          farmInformationDescription:
            "Enter the basic information about your farm.",

          farmName: "Farm Name",
          farmNamePlaceholder: "e.g. Gayan Farm",

          location: "Location",
          locationPlaceholder: "e.g. Galle, Akmeemana",

          landSize: "Land Size",
          landSizePlaceholder: "e.g. 2.5",

          landUnit: "acres",

          mainCrop: "Main Crop",
          paddy: "Paddy",
          rice: "Rice",
          maize: "Maize",
          vegetables: "Vegetables",
          other: "Other",

          createFarm: "Create Farm",
          creating: "Creating...",

          required: "Please enter the farm name.",
          invalidLandSize:
            "Land size must be greater than zero.",

          success: "Farm created successfully!",

          createError: "Unable to create the farm.",

          marketplaceTitle: "Get your farm ready",
          marketplaceDescription:
            "After creating your farm, you can add paddy lots associated with it to Vee Market.",

          nextStep: "Next Step",
          nextStepDescription:
            "After creating the farm, you can create your first paddy lot.",

          requiredMark: "Required",
        };

  // =========================================================
  // Handle input changes
  // =========================================================

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

  // =========================================================
  // Submit farm
  // =========================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validate farm name
    if (!form.farmName.trim()) {
      setError(text.required);
      return;
    }

    // Validate land size if provided
    if (form.landSize.trim()) {
      const landSize = Number(form.landSize);

      if (!Number.isFinite(landSize) || landSize <= 0) {
        setError(text.invalidLandSize);
        return;
      }
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

      const requestBody = {
        farmName: form.farmName.trim(),
        location: form.location.trim() || null,
        landSize: form.landSize
          ? Number(form.landSize)
          : null,
        mainCrop: form.mainCrop,
      };

      console.log("Creating farm...");
      console.log("API:", `${API_URL}/api/farmer/farms`);
      console.log("Request:", requestBody);

      const response = await fetch(
        `${API_URL}/api/farmer/farms`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify(requestBody),
        }
      );

      const responseText = await response.text();

      console.log(
        "POST /api/farmer/farms status:",
        response.status
      );

      console.log(
        "POST /api/farmer/farms response:",
        responseText
      );

      // =====================================================
      // Authentication error
      // =====================================================

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("vee-market-user-id");
        localStorage.removeItem("vee-market-user-email");
        localStorage.removeItem("vee-market-user-role");
        localStorage.removeItem("token");

        router.push("/login");
        return;
      }

      // =====================================================
      // API error
      // =====================================================

      if (!response.ok) {
        let message = responseText;

        try {
          const errorJson = JSON.parse(responseText);

          message =
            errorJson?.message ||
            errorJson?.error ||
            errorJson?.detail ||
            responseText;
        } catch {
          // Keep response text
        }

        throw new Error(
          message || text.createError
        );
      }

      // =====================================================
      // Success
      // =====================================================

      setSuccess(text.success);

      /*
       * The farmer can now create a paddy lot.
       *
       * We return to the Add Paddy Lot page so that
       * the newly-created farm will be available in
       * the farm dropdown.
       */
      setTimeout(() => {
        router.push("/dashboard/listings/new");
        router.refresh();
      }, 800);
    } catch (err) {
      console.error("Create farm error:", err);

      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(text.createError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-sm">
              🌿
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Vee Market
              </p>

              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                Farmer Marketplace
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>

        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">

        {/* Back */}
        <Link
          href="/dashboard/listings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
        >
          ← {text.back}
        </Link>

        {/* Page heading */}
        <div className="mb-8">

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

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">

            <span className="text-lg">
              ⚠️
            </span>

            <div>
              <p className="font-semibold">
                {text.createError}
              </p>

              <p className="mt-1 break-words">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ===================================================
            SUCCESS
        =================================================== */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">

            <span className="text-lg">
              ✓
            </span>

            <p className="font-semibold">
              {success}
            </p>

          </div>
        )}

        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >

            {/* Form header */}
            <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800 sm:px-8">

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {text.farmInformation}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {text.farmInformationDescription}
              </p>

            </div>

            <div className="space-y-6 p-6 sm:p-8">

              {/* =================================================
                  FARM NAME
              ================================================= */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="farmName"
                    className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {text.farmName}

                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <span className="text-xs text-slate-400">
                    {text.requiredMark}
                  </span>

                </div>

                <input
                  id="farmName"
                  name="farmName"
                  type="text"
                  value={form.farmName}
                  onChange={handleChange}
                  placeholder={text.farmNamePlaceholder}
                  maxLength={150}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

              </div>

              {/* =================================================
                  LOCATION
              ================================================= */}

              <div>

                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  {text.location}
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleChange}
                  placeholder={text.locationPlaceholder}
                  maxLength={255}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

              </div>

              {/* =================================================
                  LAND SIZE + MAIN CROP
              ================================================= */}

              <div className="grid gap-6 sm:grid-cols-2">

                {/* Land size */}
                <div>

                  <label
                    htmlFor="landSize"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {text.landSize}
                  </label>

                  <div className="relative">

                    <input
                      id="landSize"
                      name="landSize"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.landSize}
                      onChange={handleChange}
                      placeholder={text.landSizePlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      {text.landUnit}
                    </span>

                  </div>

                </div>

                {/* Main crop */}
                <div>

                  <label
                    htmlFor="mainCrop"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {text.mainCrop}
                  </label>

                  <select
                    id="mainCrop"
                    name="mainCrop"
                    value={form.mainCrop}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Paddy">
                      {text.paddy}
                    </option>

                    <option value="Rice">
                      {text.rice}
                    </option>

                    <option value="Maize">
                      {text.maize}
                    </option>

                    <option value="Vegetables">
                      {text.vegetables}
                    </option>

                    <option value="Other">
                      {text.other}
                    </option>
                  </select>

                </div>

              </div>

              {/* =================================================
                  SUBMIT
              ================================================= */}

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
                      <span>
                        🌾
                      </span>

                      {text.createFarm}
                    </>
                  )}

                </button>

              </div>

            </div>
          </form>

          {/* =================================================
              INFORMATION SIDEBAR
          ================================================= */}

          <aside className="space-y-6">

            {/* Marketplace */}
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-slate-900">
                🌾
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white">
                {text.marketplaceTitle}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {text.marketplaceDescription}
              </p>

            </div>

            {/* Next step */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="mb-3 flex items-center gap-2">

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm dark:bg-emerald-950/40">
                  2
                </span>

                <h3 className="font-bold text-slate-900 dark:text-white">
                  {text.nextStep}
                </h3>

              </div>

              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {text.nextStepDescription}
              </p>

            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}