"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../components/LanguageProvider";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeSwitcher from "../components/ThemeSwitcher";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type RoleType = "FARMER" | "MILL" | "BUSINESS";

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [role, setRole] = useState<RoleType>("FARMER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role-specific fields
  const [farmLocation, setFarmLocation] = useState("");
  const [millName, setMillName] = useState("");
  const [millLocation, setMillLocation] = useState("");
  const [millRegNo, setMillRegNo] = useState("");
  const [businessType, setBusinessType] = useState<"SHOP" | "HOTEL">("SHOP");
  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessRegNo, setBusinessRegNo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const t = {
    brand: {
      name: isSinhala ? "වී මාර්කට්" : "Vee Market",
      tagline: isSinhala ? "ගොවිපළේ සිට අනාගතයට" : "From Farm to Future",
    },
    heroTitle: isSinhala
      ? "ශ්‍රී ලංකාවේ කෘෂිකාර්මික වෙළඳ ජාලයට එක්වන්න"
      : "Join Sri Lanka's Modern Agricultural Network",
    heroDescription: isSinhala
      ? "ගොවීන්, සහල් මෝල් සහ ව්‍යාපාර සෘජුව සම්බන්ධ කරන ජාතික වෙළඳපොළ."
      : "A unified platform connecting farmers, rice mills, and wholesale businesses across the island.",
    fairMarket: isSinhala ? "සාධාරණ වෙළඳපොළ" : "Fair Market",
    trustedNetwork: isSinhala ? "විශ්වාසදායක ජාලය" : "Trusted Network",
    reliableSupply: isSinhala ? "විශ්වාසදායක සැපයුම" : "Reliable Supply",

    title: isSinhala ? "ගිණුම සාදන්න" : "Create Account",
    subtitle: isSinhala
      ? "ඔබගේ භූමිකාව තෝරා ලියාපදිංචි වන්න"
      : "Select your role to start using Vee Market",

    roles: {
      FARMER: {
        title: isSinhala ? "ගොවියා" : "Farmer",
        desc: isSinhala ? "වී අස්වැන්න විකුණන්න" : "Sell paddy directly",
        badge: "🌾",
      },
      MILL: {
        title: isSinhala ? "සහල් මෝල" : "Rice Mill",
        desc: isSinhala ? "වී මිලදී ගෙන සහල් සපයන්න" : "Procure & mill rice",
        badge: "🏭",
      },
      BUSINESS: {
        title: isSinhala ? "ව්‍යාපාරික ගැනුම්කරු" : "Business / Buyer",
        desc: isSinhala ? "හෝටල්, වෙළඳසැල් හා තොග ගැනුම්කරුවන්" : "Hotels, shops & wholesale buyers",
        badge: "🏪",
      },
    },

    common: {
      name: isSinhala ? "සම්පූර්ණ නම" : "Full Name",
      namePlaceholder: isSinhala ? "ඔබගේ සම්පූර්ණ නම" : "Enter your full name",
      phone: isSinhala ? "දුරකථන අංකය" : "Phone Number",
      phonePlaceholder: "07XXXXXXXX",
      email: isSinhala ? "විද්‍යුත් තැපෑල ලිපිනය" : "Email Address",
      emailPlaceholder: "example@gmail.com",
      password: isSinhala ? "මුරපදය" : "Password",
      passwordPlaceholder: isSinhala ? "මුරපදයක් ඇතුළත් කරන්න" : "Create a password",
      confirmPassword: isSinhala ? "මුරපදය තහවුරු කරන්න" : "Confirm Password",
      confirmPasswordPlaceholder: isSinhala ? "මුරපදය නැවත ඇතුළත් කරන්න" : "Re-enter your password",
    },

    farmerFields: {
      location: isSinhala ? "ගොවිපළ දිස්ත්‍රික්කය" : "Farm District / Region",
      locationPlaceholder: isSinhala ? "උදා: පොළොන්නරුව / අම්පාර" : "e.g. Polonnaruwa, Ampara",
    },

    millFields: {
      name: isSinhala ? "සහල් මෝලේ නම" : "Rice Mill Name",
      namePlaceholder: isSinhala ? "උදා: රජරට සහල් මෝල" : "e.g. Rajarata Rice Mill",
      location: isSinhala ? "මෝල පිහිටි ස්ථානය" : "Mill Location / District",
      locationPlaceholder: isSinhala ? "උදා: පොළොන්නරුව" : "e.g. Polonnaruwa Industrial Zone",
      regNo: isSinhala ? "මෝල් ලියාපදිංචි අංකය" : "Mill Registration No",
      regNoPlaceholder: "e.g. ML-2024-001 (Optional)",
    },

    businessFields: {
      type: isSinhala ? "ව්‍යාපාර වර්ගය" : "Business Category",
      shopOption: isSinhala ? "🏪 තොග හෝ සිල්ලර වෙළඳසැල" : "🏪 Wholesale or Retail Shop",
      hotelOption: isSinhala ? "🏨 හෝටලය හෝ අවන්හල" : "🏨 Hotel or Restaurant",
      name: isSinhala ? "ව්‍යාපාරයේ නම" : "Business Name",
      namePlaceholder: isSinhala ? "උදා: ලංකා තොග වෙළඳුන්" : "e.g. Lanka Wholesale Traders",
      location: isSinhala ? "ව්‍යාපාර ස්ථානය / නගරය" : "Business Location / City",
      locationPlaceholder: isSinhala ? "උදා: පිටකොටුව, කොළඹ" : "e.g. Pettah, Colombo",
      regNo: isSinhala ? "ව්‍යාපාර ලියාපදිංචි අංකය (විකල්ප)" : "Business Reg No (Optional)",
      regNoPlaceholder: "e.g. PV-12345",
    },

    submit: isSinhala ? "ගිණුම සාදන්න" : "Create Account",
    submitting: isSinhala ? "ගිණුම සාදමින්..." : "Creating Account...",
    alreadyAccount: isSinhala ? "දැනටමත් ගිණුමක් තිබේද?" : "Already have an account?",
    loginLink: isSinhala ? "ඇතුළු වන්න" : "Login",
    successMsg: isSinhala
      ? "ගිණුම සාර්ථකව සාදන ලදී. Login වෙත යොමු කරමින්..."
      : "Account created successfully. Redirecting to login...",
  };

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError(isSinhala ? "සම්පූර්ණ නම ඇතුළත් කරන්න." : "Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setError(isSinhala ? "දුරකථන අංකය ඇතුළත් කරන්න." : "Please enter your phone number.");
      return;
    }
    if (!email.trim()) {
      setError(isSinhala ? "විද්‍යුත් තැපෑල ඇතුළත් කරන්න." : "Please enter your email.");
      return;
    }
    if (password.length < 6) {
      setError(isSinhala ? "මුරපදය අවම වශයෙන් අක්ෂර 6කින් සමන්විත විය යුතුය." : "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError(isSinhala ? "මුරපද දෙක නොගැලපේ." : "Passwords do not match.");
      return;
    }
    if (role === "MILL" && !millName.trim()) {
      setError(isSinhala ? "සහල් මෝලේ නම ඇතුළත් කරන්න." : "Please enter rice mill name.");
      return;
    }
    if (role === "BUSINESS" && !businessName.trim()) {
      setError(isSinhala ? "ව්‍යාපාරයේ නම ඇතුළත් කරන්න." : "Please enter business name.");
      return;
    }

    try {
      setLoading(true);

      let payload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
      };

      if (role === "FARMER") {
        payload = { ...payload, role: "FARMER", businessLocation: farmLocation.trim() || null };
      } else if (role === "MILL") {
        payload = {
          ...payload,
          role: "MILL",
          businessName: millName.trim(),
          businessLocation: millLocation.trim() || null,
          deviceNumber: millRegNo.trim() || null,
        };
      } else if (role === "BUSINESS") {
        payload = {
          ...payload,
          role: "BUYER",
          businessType,
          businessName: businessName.trim(),
          businessLocation: businessLocation.trim() || null,
          deviceNumber: businessRegNo.trim() || null,
        };
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";
      const rawText = await response.text();
      let data: { message?: string; error?: string } | null = null;
      if (rawText && contentType.includes("application/json")) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            (isSinhala ? "ලියාපදිංචි වීම අසාර්ථක විය." : "Registration failed. Please check details.")
        );
      }

      setSuccess(t.successMsg);
      setTimeout(() => { router.push("/login"); }, 1200);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : isSinhala
          ? "සේවාදායකය හා සම්බන්ධ විය නොහැක."
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-11 sm:h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 sm:px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087f3f] focus:bg-white focus:ring-4 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500 dark:focus:ring-emerald-500/10";

  return (
    <main className="min-h-[100dvh] bg-[#edf5ef] dark:bg-background">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[1700px] xl:min-h-0 xl:p-6">
        <div
          className="
            relative flex min-h-[100dvh] flex-col overflow-hidden
            bg-white dark:bg-surface
            xl:flex-row xl:min-h-[calc(100vh-48px)]
            xl:rounded-[30px] xl:shadow-[0_20px_70px_rgba(0,0,0,0.12)]
          "
        >
          {/* ====================================================
              LEFT HERO — desktop only (xl+)
          ==================================================== */}
          <section className="relative hidden xl:flex w-[50%] flex-col justify-end overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/vee-market-hero.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04351f]/95 via-[#04351f]/45 to-transparent" />

            {/* BRAND */}
            <div className="absolute left-8 top-8 z-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 shadow-lg">
                <LeafLogo />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{t.brand.name}</h1>
                <p className="text-xs text-white/80">{t.brand.tagline}</p>
              </div>
            </div>

            {/* HERO CONTENT */}
            <div className="relative z-10 p-14">
              <div className="max-w-[650px]">
                <h2 className="text-[52px] font-bold leading-tight tracking-tight text-white">
                  {t.heroTitle}
                </h2>
                <p className="mt-4 max-w-[560px] text-lg leading-6 text-white/90">
                  {t.heroDescription}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <Feature icon="🌱" title={t.fairMarket} />
                  <Feature icon="🤝" title={t.trustedNetwork} />
                  <Feature icon="🚚" title={t.reliableSupply} />
                </div>
              </div>
            </div>
          </section>

          {/* ====================================================
              RIGHT REGISTRATION PANEL
          ==================================================== */}
          <section className="relative flex w-full flex-1 flex-col bg-white dark:bg-surface xl:w-[50%]">
            {/* TOP CONTROLS */}
            <div className="flex items-center justify-between px-4 py-2.5 sm:px-8 sm:py-5">
              {/* Mobile brand mark */}
              <div className="flex items-center gap-2 xl:invisible">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                  <LeafLogo />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-extrabold text-[#063b25] dark:text-emerald-400">
                    {t.brand.name}
                  </span>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 leading-none">
                    {t.brand.tagline}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
            </div>

            {/* FORM AREA */}
            <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 pb-8 pt-1 sm:px-8 xl:px-14 xl:py-6">
              <div className="w-full max-w-[500px]">

                {/* LOGO (desktop) */}
                <div className="mb-5 hidden xl:block text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 dark:bg-emerald-950/40">
                    <LeafLogo />
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-[#063b25] dark:text-emerald-400 sm:text-2xl">
                    {t.brand.name}
                  </h2>
                </div>

                {/* TITLE */}
                <div className="text-center mb-3 sm:mb-5">
                  <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {t.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {t.subtitle}
                  </p>
                </div>

                {/* ROLE SELECTOR */}
                <div className="mb-3 sm:mb-5 grid grid-cols-3 gap-1.5 sm:gap-2">
                  {(["FARMER", "MILL", "BUSINESS"] as RoleType[]).map((r) => {
                    const roleMeta = t.roles[r];
                    const isSelected = role === r;
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-xl border text-center transition ${
                          isSelected
                            ? "border-[#087f3f] bg-[#edf5ef] text-[#087f3f] font-bold shadow-sm dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{roleMeta.badge}</span>
                        <span className="text-[11px] sm:text-xs font-semibold leading-tight">{roleMeta.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ERROR / SUCCESS */}
                {error && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
                    {success}
                  </div>
                )}

                {/* FORM */}
                <form onSubmit={handleRegister} className="space-y-3.5">
                  {/* ROLE-SPECIFIC FIELDS */}
                  {role === "FARMER" && (
                    <div className="rounded-2xl border border-green-100 bg-green-50/40 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t.farmerFields.location}
                      </label>
                      <input
                        type="text"
                        value={farmLocation}
                        onChange={(e) => setFarmLocation(e.target.value)}
                        placeholder={t.farmerFields.locationPlaceholder}
                        className={inputClass}
                      />
                    </div>
                  )}

                  {role === "MILL" && (
                    <div className="rounded-2xl border border-green-100 bg-green-50/40 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2.5">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                          {t.millFields.name} *
                        </label>
                        <input
                          type="text"
                          required
                          value={millName}
                          onChange={(e) => setMillName(e.target.value)}
                          placeholder={t.millFields.namePlaceholder}
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                            {t.millFields.location} *
                          </label>
                          <input
                            type="text"
                            required
                            value={millLocation}
                            onChange={(e) => setMillLocation(e.target.value)}
                            placeholder={t.millFields.locationPlaceholder}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                            {t.millFields.regNo}
                          </label>
                          <input
                            type="text"
                            value={millRegNo}
                            onChange={(e) => setMillRegNo(e.target.value)}
                            placeholder={t.millFields.regNoPlaceholder}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {role === "BUSINESS" && (
                    <div className="rounded-2xl border border-green-100 bg-green-50/40 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2.5">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                          {t.businessFields.type} *
                        </label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value as "SHOP" | "HOTEL")}
                          className={inputClass}
                        >
                          <option value="SHOP">{t.businessFields.shopOption}</option>
                          <option value="HOTEL">{t.businessFields.hotelOption}</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                          {t.businessFields.name} *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder={t.businessFields.namePlaceholder}
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                            {t.businessFields.location} *
                          </label>
                          <input
                            type="text"
                            required
                            value={businessLocation}
                            onChange={(e) => setBusinessLocation(e.target.value)}
                            placeholder={t.businessFields.locationPlaceholder}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                            {t.businessFields.regNo}
                          </label>
                          <input
                            type="text"
                            value={businessRegNo}
                            onChange={(e) => setBusinessRegNo(e.target.value)}
                            placeholder={t.businessFields.regNoPlaceholder}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COMMON CREDENTIALS */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t.common.name}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.common.namePlaceholder}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t.common.phone}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t.common.phonePlaceholder}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t.common.email}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.common.emailPlaceholder}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t.common.password}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t.common.passwordPlaceholder}
                          className={`${inputClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t.common.confirmPassword}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={t.common.confirmPasswordPlaceholder}
                          className={`${inputClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    id="register-submit-btn"
                    disabled={loading}
                    className="
                      mt-2 flex h-14 w-full items-center justify-center rounded-xl
                      bg-[#087f3f] text-base font-semibold text-white shadow-lg shadow-green-900/20
                      transition hover:bg-[#076f37] hover:shadow-xl active:bg-[#055729]
                      disabled:opacity-60 disabled:cursor-not-allowed
                      dark:bg-emerald-600 dark:hover:bg-emerald-500
                    "
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {t.submitting}
                      </span>
                    ) : (
                      t.submit
                    )}
                  </button>

                  {/* LOGIN LINK */}
                  <p className="pt-1 text-center text-sm text-slate-500 dark:text-slate-400">
                    {t.alreadyAccount}{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-[#087f3f] hover:underline dark:text-emerald-400"
                    >
                      {t.loginLink}
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   SHARED COMPONENTS
============================================================ */

function Feature({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md transition hover:bg-white/15">
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 text-xs font-semibold text-white sm:text-sm">{title}</p>
    </div>
  );
}

function LeafLogo() {
  return (
    <div className="relative h-9 w-9">
      <div className="absolute left-4 top-0 h-7 w-4 rotate-[-18deg] rounded-[100%_0_100%_0] bg-[#087f3f]" />
      <div className="absolute left-1 top-4 h-6 w-4 rotate-[-42deg] rounded-[100%_0_100%_0] bg-[#41a85f]" />
      <div className="absolute bottom-0 left-5 h-5 w-[2px] rotate-[20deg] bg-[#087f3f]" />
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.1 3.8" />
      <path d="M6.5 9.1C4.1 10.4 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}