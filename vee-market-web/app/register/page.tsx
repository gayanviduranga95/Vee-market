"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../components/LanguageProvider";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeSwitcher from "../components/ThemeSwitcher";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type RoleType = "FARMER" | "MILL" | "SHOP" | "HOTEL";

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
  // Farmer
  const [deviceNumber, setDeviceNumber] = useState("");
  const [farmLocation, setFarmLocation] = useState("");

  // Mill
  const [millName, setMillName] = useState("");
  const [millLocation, setMillLocation] = useState("");
  const [millRegNo, setMillRegNo] = useState("");
  const [millingCapacity, setMillingCapacity] = useState("2000");

  // Shop
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopRegNo, setShopRegNo] = useState("");

  // Hotel
  const [hotelName, setHotelName] = useState("");
  const [hotelLocation, setHotelLocation] = useState("");
  const [hotelCategory, setHotelCategory] = useState("Restaurant & Catering");

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
      SHOP: {
        title: isSinhala ? "වෙළඳසැල" : "Shop / Retail",
        desc: isSinhala ? "තොග සහල් ඇණවුම් කරන්න" : "Wholesale rice buyer",
        badge: "🏪",
      },
      HOTEL: {
        title: isSinhala ? "හෝටලය" : "Hotel / Dining",
        desc: isSinhala ? "තොග සහල් සපයා ගන්න" : "Commercial dining buyer",
        badge: "🏨",
      },
    },

    common: {
      name: isSinhala ? "සම්පූර්ණ නම" : "Full Name",
      namePlaceholder: isSinhala ? "ඔබගේ සම්පූර්ණ නම" : "Enter your full name",
      phone: isSinhala ? "දුරකථන අංකය" : "Phone Number",
      phonePlaceholder: "07XXXXXXXX",
      email: isSinhala ? "විද්‍යුත් තැපැල් ලිපිනය" : "Email Address",
      emailPlaceholder: "example@gmail.com",
      password: isSinhala ? "මුරපදය" : "Password",
      passwordPlaceholder: isSinhala ? "මුරපදයක් ඇතුළත් කරන්න" : "Create a password",
      confirmPassword: isSinhala ? "මුරපදය තහවුරු කරන්න" : "Confirm Password",
      confirmPasswordPlaceholder: isSinhala ? "මුරපදය නැවත ඇතුළත් කරන්න" : "Re-enter your password",
    },

    farmerFields: {
      location: isSinhala ? "ගොවිපළ දිස්ත්‍රික්කය" : "Farm District / Region",
      locationPlaceholder: isSinhala ? "උදා: පොළොන්නරුව / අම්පාර" : "e.g. Polonnaruwa, Ampara",
      deviceNumber: isSinhala ? "තෙතමන මාපක අංකය (විකල්ප)" : "Moisture Meter ID (Optional)",
      devicePlaceholder: "e.g. DEVICE-001",
      deviceHelp: isSinhala
        ? "ස්මාර්ට් තෙතමන මාපකයක් ඇත්නම් ඇතුළත් කරන්න."
        : "Connect your digital IoT meter for verified readings.",
    },

    millFields: {
      name: isSinhala ? "සහල් මෝලේ නම" : "Rice Mill Name",
      namePlaceholder: isSinhala ? "උදා: රජරට සහල් මෝල" : "e.g. Rajarata Rice Mill",
      location: isSinhala ? "මෝල පිහිටි ස්ථානය" : "Mill Location / District",
      locationPlaceholder: isSinhala ? "උදා: පොළොන්නරුව" : "e.g. Polonnaruwa Industrial Zone",
      regNo: isSinhala ? "මෝල් ලියාපදිංචි අංකය" : "Mill Registration No",
      regNoPlaceholder: "e.g. ML-2024-001 (Optional)",
      capacity: isSinhala ? "දිනක ඇඹරුම් ධාරිතාව (kg)" : "Daily Milling Capacity (kg)",
    },

    shopFields: {
      name: isSinhala ? "වෙළඳසැලේ නම" : "Shop / Store Name",
      namePlaceholder: isSinhala ? "උදා: ලංකා තොග සහල්" : "e.g. Lanka Wholesale Traders",
      location: isSinhala ? "නගරය / ස්ථානය" : "Shop City / Address",
      locationPlaceholder: isSinhala ? "උදා: පිටකොටුව, කොළඹ" : "e.g. Pettah, Colombo",
      regNo: isSinhala ? "ව්‍යාපාර ලියාපදිංචි අංකය" : "Business Reg No (Optional)",
      regNoPlaceholder: "e.g. PV-12345",
    },

    hotelFields: {
      name: isSinhala ? "හෝටලයේ / අවන්හලේ නම" : "Hotel / Restaurant Name",
      namePlaceholder: isSinhala ? "උදා: ග්‍රෑන්ඩ් හොටෙල්" : "e.g. Grand Cinnamon Resort",
      location: isSinhala ? "නගරය / ලිපිනය" : "City / Location",
      locationPlaceholder: isSinhala ? "උදා: කොළඹ 03" : "e.g. Colombo 03",
      category: isSinhala ? "ආයතන වර්ගය" : "Establishment Type",
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

    // Role-specific validations
    if (role === "MILL" && !millName.trim()) {
      setError(isSinhala ? "සහල් මෝලේ නම ඇතුළත් කරන්න." : "Please enter rice mill name.");
      return;
    }
    if (role === "SHOP" && !shopName.trim()) {
      setError(isSinhala ? "වෙළඳසැලේ නම ඇතුළත් කරන්න." : "Please enter shop name.");
      return;
    }
    if (role === "HOTEL" && !hotelName.trim()) {
      setError(isSinhala ? "හෝටලයේ නම ඇතුළත් කරන්න." : "Please enter hotel name.");
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
        payload = {
          ...payload,
          role: "FARMER",
          deviceNumber: deviceNumber.trim() || null,
          businessLocation: farmLocation.trim() || null,
        };
      } else if (role === "MILL") {
        payload = {
          ...payload,
          role: "MILL",
          businessName: millName.trim(),
          businessLocation: millLocation.trim() || null,
          deviceNumber: millRegNo.trim() || null,
        };
      } else if (role === "SHOP") {
        payload = {
          ...payload,
          role: "BUYER",
          businessType: "SHOP",
          businessName: shopName.trim(),
          businessLocation: shopLocation.trim() || null,
          deviceNumber: shopRegNo.trim() || null,
        };
      } else if (role === "HOTEL") {
        payload = {
          ...payload,
          role: "BUYER",
          businessType: "HOTEL",
          businessName: hotelName.trim(),
          businessLocation: hotelLocation.trim() || null,
          deviceNumber: hotelCategory.trim() || null,
        };
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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
            (isSinhala
              ? "ලියාපදිංචි වීම අසාර්ථක විය."
              : "Registration failed. Please check details.")
        );
      }

      setSuccess(t.successMsg);
      setTimeout(() => {
        router.push("/login");
      }, 1200);
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

  return (
    <main className="min-h-screen bg-[#edf5ef] dark:bg-background">
      <div className="mx-auto min-h-screen w-full max-w-[1700px] xl:p-6">
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-white dark:bg-surface xl:flex-row xl:min-h-[calc(100vh-48px)] xl:rounded-[30px] xl:shadow-[0_20px_70px_rgba(0,0,0,0.12)]">
          {/* ==================================================
              LEFT HERO (SAME AS LOGIN PAGE)
          ================================================== */}
          <section className="relative flex min-h-[430px] w-full flex-col justify-end overflow-hidden sm:min-h-[500px] xl:min-h-0 xl:w-[50%]">
            {/* HERO IMAGE */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/vee-market-hero.png')" }}
            />

            {/* DARK GRADIENT */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#04351f]/95 via-[#04351f]/45 to-transparent" />

            {/* BRAND */}
            <div className="absolute left-5 top-5 z-10 flex items-center gap-3 sm:left-8 sm:top-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 shadow-lg">
                <LeafLogo />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{t.brand.name}</h1>
                <p className="text-xs text-white/80">{t.brand.tagline}</p>
              </div>
            </div>

            {/* HERO CONTENT */}
            <div className="relative z-10 p-5 sm:p-8 md:p-10 xl:p-14">
              <div className="max-w-[650px]">
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl xl:text-[52px]">
                  {t.heroTitle}
                </h2>
                <p className="mt-4 max-w-[560px] text-sm leading-6 text-white/90 sm:text-base md:text-lg">
                  {t.heroDescription}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  <Feature icon="🌱" title={t.fairMarket} />
                  <Feature icon="🤝" title={t.trustedNetwork} />
                  <Feature icon="🚚" title={t.reliableSupply} />
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              RIGHT REGISTRATION PANEL (SAME THEME AS LOGIN)
          ================================================== */}
          <section className="relative flex w-full flex-1 items-center justify-center bg-white dark:bg-surface px-5 py-10 sm:px-8 md:px-12 xl:w-[50%] xl:px-14 xl:py-10">
            {/* TOP CONTROLS */}
            <div className="absolute right-4 top-4 sm:right-7 sm:top-7 flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>

            <div className="w-full max-w-[500px] pt-10 sm:pt-14 xl:pt-4">
              {/* LOGO */}
              <div className="mb-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 dark:bg-emerald-950/40">
                  <LeafLogo />
                </div>
                <h2 className="mt-3 text-xl font-bold text-[#063b25] dark:text-emerald-400 sm:text-2xl">
                  {t.brand.name}
                </h2>
              </div>

              {/* TITLE */}
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {t.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                  {t.subtitle}
                </p>
              </div>

              {/* STEP 1: ROLE SELECTOR CARDS */}
              <div className="mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["FARMER", "MILL", "SHOP", "HOTEL"] as RoleType[]).map((r) => {
                    const roleMeta = t.roles[r];
                    const isSelected = role === r;

                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                          isSelected
                            ? "border-[#087f3f] bg-[#edf5ef] text-[#087f3f] font-bold shadow-sm dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
                        }`}
                      >
                        <span className="text-2xl">{roleMeta.badge}</span>
                        <span className="mt-1 text-xs font-semibold leading-tight">
                          {roleMeta.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ERROR / SUCCESS NOTICES */}
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
              <form onSubmit={handleRegister} className="space-y-4">
                {/* ROLE-SPECIFIC SPECIALIZED FIELDS */}
                {role === "FARMER" && (
                  <div className="rounded-2xl border border-green-100 bg-green-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t.farmerFields.location}
                      </label>
                      <input
                        type="text"
                        value={farmLocation}
                        onChange={(e) => setFarmLocation(e.target.value)}
                        placeholder={t.farmerFields.locationPlaceholder}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t.farmerFields.deviceNumber}
                      </label>
                      <input
                        type="text"
                        value={deviceNumber}
                        onChange={(e) => setDeviceNumber(e.target.value)}
                        placeholder={t.farmerFields.devicePlaceholder}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {t.farmerFields.deviceHelp}
                      </p>
                    </div>
                  </div>
                )}

                {role === "MILL" && (
                  <div className="rounded-2xl border border-green-100 bg-green-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3">
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
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {role === "SHOP" && (
                  <div className="rounded-2xl border border-green-100 bg-green-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t.shopFields.name} *
                      </label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder={t.shopFields.namePlaceholder}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t.shopFields.location} *
                      </label>
                      <input
                        type="text"
                        required
                        value={shopLocation}
                        onChange={(e) => setShopLocation(e.target.value)}
                        placeholder={t.shopFields.locationPlaceholder}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {role === "HOTEL" && (
                  <div className="rounded-2xl border border-green-100 bg-green-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t.hotelFields.name} *
                      </label>
                      <input
                        type="text"
                        required
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        placeholder={t.hotelFields.namePlaceholder}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t.hotelFields.location} *
                      </label>
                      <input
                        type="text"
                        required
                        value={hotelLocation}
                        onChange={(e) => setHotelLocation(e.target.value)}
                        placeholder={t.hotelFields.locationPlaceholder}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
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
                    className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087f3f] focus:bg-white focus:ring-4 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087f3f] focus:bg-white focus:ring-4 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087f3f] focus:bg-white focus:ring-4 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087f3f] focus:bg-white focus:ring-4 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                        className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087f3f] focus:bg-white focus:ring-4 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON (MATCHES LOGIN PAGE BUTTON) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-[#087f3f] text-base font-semibold text-white shadow-lg shadow-green-900/20 transition hover:bg-[#076f37] hover:shadow-xl disabled:opacity-60"
                >
                  {loading ? t.submitting : t.submit}
                </button>

                {/* LOGIN LINK */}
                <div className="text-center pt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t.alreadyAccount}{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-[#087f3f] hover:underline dark:text-emerald-400"
                    >
                      {t.loginLink}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   SHARED HERO COMPONENTS & ICONS (IDENTICAL TO LOGIN PAGE)
============================================================ */

function Feature({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md transition hover:bg-white/15 sm:p-4">
      <div className="text-xl sm:text-2xl">{icon}</div>
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