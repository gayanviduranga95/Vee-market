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
    title: isSinhala ? "ගිණුමක් සාදන්න" : "Create an Account",
    subtitle: isSinhala
      ? "ඔබගේ භූමිකාව තෝරා වී මාර්කට් ජාලයට එක්වන්න."
      : "Select your role and join the Vee Market national network.",
    selectRole: isSinhala ? "ඔබ කවුද? (භූමිකාව තෝරන්න)" : "Who are you? (Select Role)",
    roles: {
      FARMER: {
        title: isSinhala ? "ගොවියා" : "Farmer",
        desc: isSinhala
          ? "වී අස්වැන්න සාධාරණ මිලකට මෝල් වෙත සෘජුව විකුණන්න."
          : "Sell raw paddy directly to mills with IoT moisture verification.",
        badge: "🌾",
      },
      MILL: {
        title: isSinhala ? "සහල් මෝල" : "Rice Mill",
        desc: isSinhala
          ? "ගොවීන්ගෙන් වී මිලදී ගෙන හෝටල් සහ සාප්පු වෙත සහල් සපයන්න."
          : "Procure paddy lots from farmers & supply bulk rice to shops/hotels.",
        badge: "🏭",
      },
      SHOP: {
        title: isSinhala ? "වෙළඳසැල" : "Shop / Retail",
        desc: isSinhala
          ? "මෝල් වෙතින් තොග සහල් සෘජුව ඇණවුම් කරන්න."
          : "Procure wholesale rice directly from certified mills with best rates.",
        badge: "🏪",
      },
      HOTEL: {
        title: isSinhala ? "හෝටලය / අවන්හල" : "Hotel / Restaurant",
        desc: isSinhala
          ? "ප්‍රමිතියෙන් උසස් සහල් සතිපතා හෝ තොග වශයෙන් ලබාගන්න."
          : "Source high-quality rice batches on weekly or bulk schedules.",
        badge: "🏨",
      },
    },
    common: {
      fullName: isSinhala ? "සම්පූර්ණ නම" : "Full Name",
      fullNamePlaceholder: isSinhala ? "උදා: කේ.ඒ. සුනිල් ශාන්ත" : "e.g. Sunil Perera",
      phone: isSinhala ? "දුරකථන අංකය" : "Mobile Phone Number",
      phonePlaceholder: isSinhala ? "0771234567" : "0771234567",
      email: isSinhala ? "විද්‍යුත් තැපෑල (Email)" : "Email Address",
      emailPlaceholder: isSinhala ? "yourname@example.com" : "yourname@example.com",
      password: isSinhala ? "මුරපදය" : "Password",
      passwordPlaceholder: isSinhala ? "අවම අක්ෂර 6ක්" : "Minimum 6 characters",
      confirmPassword: isSinhala ? "මුරපදය තහවුරු කරන්න" : "Confirm Password",
      confirmPasswordPlaceholder: isSinhala ? "මුරපදය නැවත ඇතුළත් කරන්න" : "Re-enter password",
    },
    farmerFields: {
      location: isSinhala ? "ගොවිපළ පිහිටි දිස්ත්‍රික්කය / ප්‍රදේශය" : "Farm District / Region",
      locationPlaceholder: isSinhala ? "උදා: පොළොන්නරුව / අම්පාර" : "e.g. Polonnaruwa, Ampara, Galle",
      deviceNumber: isSinhala ? "ස්මාර්ට් තෙතමන මීටර අංකය (විකල්ප)" : "Smart Moisture Meter ID (Optional)",
      deviceHelper: isSinhala
        ? "ඔබ සතුව ඩිජිටල් තෙතමන මාපකයක් ඇත්නම් (උදා: DEVICE-001) ඇතුළත් කරන්න. නැතහොත් පසුව එක් කළ හැක."
        : "Connect your digital IoT meter (e.g. DEVICE-001) for verified readings. Leave blank if not yet assigned.",
    },
    millFields: {
      name: isSinhala ? "සහල් මෝලේ නම" : "Rice Mill Name",
      namePlaceholder: isSinhala ? "උදා: රජරට නවීන සහල් මෝල" : "e.g. Rajarata Modern Rice Mill",
      location: isSinhala ? "මෝල පිහිටි ස්ථානය / දිස්ත්‍රික්කය" : "Mill Location / District",
      locationPlaceholder: isSinhala ? "උදා: පොළොන්නරුව කාර්මික කලාපය" : "e.g. Polonnaruwa Industrial Zone",
      regNo: isSinhala ? "ව්‍යාපාර / මෝල් ලියාපදිංචි අංකය" : "Business / Mill Reg Number",
      regNoPlaceholder: isSinhala ? "උදා: ML-2024-984" : "e.g. ML-2024-984 (Optional)",
      capacity: isSinhala ? "දිනකට ඇඹරුම් ධාරිතාව (kg)" : "Daily Milling Capacity (kg/day)",
    },
    shopFields: {
      name: isSinhala ? "වෙළඳසැලේ නම" : "Shop / Store Name",
      namePlaceholder: isSinhala ? "උදා: ලංකා තොග සහල් වෙළෙන්දෝ" : "e.g. Lanka Wholesale Rice Traders",
      location: isSinhala ? "නගරය / ලිපිනය" : "Shop City / Address",
      locationPlaceholder: isSinhala ? "උදා: පිටකොටුව තොග වෙළඳපොළ" : "e.g. Pettah Wholesale Market, Colombo",
      regNo: isSinhala ? "ව්‍යාපාර ලියාපදිංචි අංකය (විකල්ප)" : "Business Reg No (Optional)",
      regNoPlaceholder: isSinhala ? "උදා: PV-84930" : "e.g. PV-84930",
    },
    hotelFields: {
      name: isSinhala ? "හෝටලයේ / අවන්හලේ නම" : "Hotel / Restaurant Name",
      namePlaceholder: isSinhala ? "උදා: ග්‍රෑන්ඩ් හොටෙල් හෝ කැටරින්ග්" : "e.g. Grand Resort & Dining",
      location: isSinhala ? "නගරය / ලිපිනය" : "City / Address",
      locationPlaceholder: isSinhala ? "උදා: කොළඹ 03 / නුවරඑළිය" : "e.g. Colombo 03 / Kandy",
      category: isSinhala ? "ආයතන වර්ගය" : "Establishment Type",
    },
    submit: isSinhala ? "ලියාපදිංචි වන්න" : "Create Account",
    submitting: isSinhala ? "ලියාපදිංචි වෙමින්..." : "Creating Account...",
    alreadyHaveAccount: isSinhala ? "දැනටමත් ගිණුමක් තිබේද?" : "Already have an account?",
    loginLink: isSinhala ? "ඇතුළු වන්න (Login)" : "Sign In",
    successMsg: isSinhala
      ? "ගිණුම සාර්ථකව සාදන ලදී! ඇතුළු වීම වෙත යොමු කෙරේ..."
      : "Account created successfully! Redirecting to login...",
  };

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError(isSinhala ? "කරුණාකර සම්පූර්ණ නම ඇතුළත් කරන්න." : "Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setError(isSinhala ? "කරුණාකර දුරකථන අංකය ඇතුළත් කරන්න." : "Please enter your mobile phone number.");
      return;
    }
    if (!email.trim()) {
      setError(isSinhala ? "කරුණාකර විද්‍යුත් තැපෑල ඇතුළත් කරන්න." : "Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      setError(isSinhala ? "මුරපදය අවම වශයෙන් අක්ෂර 6කින් සමන්විත විය යුතුය." : "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError(isSinhala ? "මුරපද දෙක නොගැලපේ. නැවත පරීක්ෂා කරන්න." : "Passwords do not match.");
      return;
    }

    // Role-specific validation
    if (role === "MILL" && !millName.trim()) {
      setError(isSinhala ? "කරුණාකර සහල් මෝලේ නම ඇතුළත් කරන්න." : "Please enter your rice mill name.");
      return;
    }
    if (role === "SHOP" && !shopName.trim()) {
      setError(isSinhala ? "කරුණාකර වෙළඳසැලේ නම ඇතුළත් කරන්න." : "Please enter your shop or business name.");
      return;
    }
    if (role === "HOTEL" && !hotelName.trim()) {
      setError(isSinhala ? "කරුණාකර හෝටලයේ හෝ අවන්හලේ නම ඇතුළත් කරන්න." : "Please enter your hotel or restaurant name.");
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
              ? "ලියාපදිංචි වීම අසාර්ථක විය. නැවත උත්සාහ කරන්න."
              : "Registration failed. Please check details and try again.")
        );
      }

      setSuccess(t.successMsg);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
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
    <main className="min-h-screen bg-[#edf5ef] dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-emerald-800 dark:text-emerald-400 font-extrabold text-2xl tracking-tight"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md text-xl">
              🌾
            </span>
            <span>Vee Market</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {/* HEADER BANNER */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-6 py-8 text-white sm:px-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold">{t.title}</h1>
            <p className="mt-2 text-emerald-100 text-sm sm:text-base max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={handleRegister} className="p-6 sm:p-10 space-y-8">
            {/* STEP 1: ROLE SELECTOR CARDS */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                {t.selectRole}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(["FARMER", "MILL", "SHOP", "HOTEL"] as RoleType[]).map((r) => {
                  const roleMeta = t.roles[r];
                  const isSelected = role === r;

                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`relative flex flex-col p-4 text-left rounded-2xl border-2 transition duration-200 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/70 shadow-md dark:border-emerald-500 dark:bg-emerald-950/40"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{roleMeta.badge}</span>
                        {isSelected && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {roleMeta.title}
                      </span>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {roleMeta.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ERROR / SUCCESS NOTICES */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-3">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-3">
                <span>🎉</span>
                <span>{success}</span>
              </div>
            )}

            {/* STEP 2: ROLE-SPECIFIC SPECIALIZED FIELDS */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm uppercase tracking-wide">
                <span>{t.roles[role].badge}</span>
                <span>
                  {isSinhala
                    ? `${t.roles[role].title} සඳහා විශේෂිත තොරතුරු`
                    : `Specialized Information for ${t.roles[role].title}`}
                </span>
              </div>

              {/* FARMER FIELDS */}
              {role === "FARMER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.farmerFields.location}
                    </label>
                    <input
                      type="text"
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder={t.farmerFields.locationPlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.farmerFields.deviceNumber}
                    </label>
                    <input
                      type="text"
                      value={deviceNumber}
                      onChange={(e) => setDeviceNumber(e.target.value)}
                      placeholder="e.g. DEVICE-001"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {t.farmerFields.deviceHelper}
                    </p>
                  </div>
                </div>
              )}

              {/* MILL FIELDS */}
              {role === "MILL" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.millFields.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={millName}
                      onChange={(e) => setMillName(e.target.value)}
                      placeholder={t.millFields.namePlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.millFields.location} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={millLocation}
                      onChange={(e) => setMillLocation(e.target.value)}
                      placeholder={t.millFields.locationPlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.millFields.regNo}
                    </label>
                    <input
                      type="text"
                      value={millRegNo}
                      onChange={(e) => setMillRegNo(e.target.value)}
                      placeholder={t.millFields.regNoPlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.millFields.capacity}
                    </label>
                    <input
                      type="number"
                      value={millingCapacity}
                      onChange={(e) => setMillingCapacity(e.target.value)}
                      placeholder="2000"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* SHOP FIELDS */}
              {role === "SHOP" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.shopFields.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder={t.shopFields.namePlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.shopFields.location} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shopLocation}
                      onChange={(e) => setShopLocation(e.target.value)}
                      placeholder={t.shopFields.locationPlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.shopFields.regNo}
                    </label>
                    <input
                      type="text"
                      value={shopRegNo}
                      onChange={(e) => setShopRegNo(e.target.value)}
                      placeholder={t.shopFields.regNoPlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* HOTEL FIELDS */}
              {role === "HOTEL" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.hotelFields.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      placeholder={t.hotelFields.namePlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.hotelFields.location} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={hotelLocation}
                      onChange={(e) => setHotelLocation(e.target.value)}
                      placeholder={t.hotelFields.locationPlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.hotelFields.category}
                    </label>
                    <select
                      value={hotelCategory}
                      onChange={(e) => setHotelCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="Star Class Hotel">Star Class Hotel / Resort</option>
                      <option value="Restaurant & Catering">Restaurant & Catering</option>
                      <option value="Boutique Hotel / Villa">Boutique Hotel / Villa</option>
                      <option value="Bakery / Food Factory">Bakery / Food Manufacturer</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: GENERAL ACCOUNT CREDENTIALS */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isSinhala ? "ප්‍රධාන ගිණුම් තොරතුරු" : "Account Owner & Login Credentials"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.common.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.common.fullNamePlaceholder}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.common.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.common.phonePlaceholder}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.common.email} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.common.emailPlaceholder}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.common.password} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.common.passwordPlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-sm"
                    >
                      {showPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.common.confirmPassword} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.common.confirmPasswordPlaceholder}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-sm"
                    >
                      {showConfirmPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-4 px-6 text-base font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-700 hover:shadow-xl disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <>
                    <span>{t.submit}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

            {/* LOGIN REDIRECT FOOTER */}
            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t.alreadyHaveAccount}{" "}
                <Link
                  href="/login"
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  {t.loginLink}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}