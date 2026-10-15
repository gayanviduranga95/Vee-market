"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../components/LanguageProvider";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeSwitcher from "../components/ThemeSwitcher";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

function getTokenRole(token: string) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized)) as { role?: string };
    return decoded.role || "";
  } catch {
    return "";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(t.login.loginError);
      return;
    }
    if (!password) {
      setError(t.login.loginError);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const contentType = response.headers.get("content-type") || "";
      const rawResponse = await response.text();

      let data: {
        token?: string;
        accessToken?: string;
        jwt?: string;
        userId?: number;
        email?: string;
        role?: string;
        message?: string;
        error?: string;
      } | null = null;

      if (rawResponse && contentType.toLowerCase().includes("application/json")) {
        try {
          data = JSON.parse(rawResponse);
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || t.login.loginError);
      }

      const token = data?.token || data?.accessToken || data?.jwt;
      if (!token) throw new Error(t.login.loginError);

      localStorage.setItem("vee-market-token", token);

      if (data?.userId !== undefined && data?.userId !== null) {
        localStorage.setItem("vee-market-user-id", String(data.userId));
      }

      localStorage.setItem(
        "vee-market-user-email",
        data?.email || email.trim()
      );

      if (data?.role) {
        localStorage.setItem("vee-market-user-role", data.role);
      }

      localStorage.setItem("token", token);
      setSuccess(t.login.loginSuccess);

      const loginRole = (
        data?.role ||
        getTokenRole(token) ||
        localStorage.getItem("vee-market-user-role") ||
        ""
      ).toUpperCase();

      if (loginRole) {
        localStorage.setItem("vee-market-user-role", loginRole);
      }

      setTimeout(() => {
        if (loginRole === "ADMIN") {
          router.push("/dashboard/admin");
        } else if (loginRole === "MILL") {
          router.push("/dashboard/mill");
        } else if (loginRole === "BUYER") {
          router.push("/dashboard/business");
        } else {
          router.push("/dashboard");
        }
      }, 400);
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof TypeError) {
        setError(t.login.connectionError);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.login.loginError);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#edf5ef] dark:bg-background flex flex-col justify-center">
      <div className="mx-auto h-full min-h-[100dvh] w-full max-w-[1700px] xl:min-h-0 xl:p-6 flex flex-col justify-center">
        <div
          className="
            relative flex min-h-[100dvh] xl:min-h-[calc(100vh-48px)] flex-col justify-between overflow-hidden
            bg-white dark:bg-surface
            xl:flex-row
            xl:rounded-[30px] xl:shadow-[0_20px_70px_rgba(0,0,0,0.12)]
          "
        >
          {/* ====================================================
              LEFT HERO — desktop only (xl+)
          ==================================================== */}
          <section
            className="
              relative hidden xl:flex
              w-[55%] flex-col justify-end overflow-hidden
            "
          >
            {/* HERO IMAGE */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/vee-market-hero.png')" }}
            />

            {/* DARK GRADIENT */}
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
                <h2 className="text-[56px] font-bold leading-tight tracking-tight text-white">
                  {t.login.heroTitle}
                </h2>
                <p className="mt-4 max-w-[560px] text-lg leading-6 text-white/90">
                  {t.login.heroDescription}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <Feature icon="🌱" title={t.login.fairMarket} />
                  <Feature icon="🤝" title={t.login.trustedNetwork} />
                  <Feature icon="🚚" title={t.login.reliableSupply} />
                </div>
              </div>
            </div>
          </section>

          {/* ====================================================
              RIGHT LOGIN PANEL
          ==================================================== */}
          <section
            className="
              relative flex w-full flex-1 flex-col justify-between
              bg-white dark:bg-surface
              xl:w-[45%]
            "
          >
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

            {/* FORM AREA — perfectly proportioned for mobile screen without scrolling */}
            <div className="flex flex-1 items-center justify-center px-4 py-2 sm:px-8 xl:px-14 xl:py-10">
              <div className="w-full max-w-[440px]">

                {/* LOGO (desktop) */}
                <div className="mb-6 hidden xl:block text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 dark:bg-emerald-950/40">
                    <LeafLogo />
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-[#063b25] dark:text-emerald-400 sm:text-2xl">
                    {t.brand.name}
                  </h2>
                </div>

                {/* TITLE */}
                <div className="text-center mb-4 sm:mb-7">
                  <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {t.login.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-base text-slate-500 dark:text-slate-400">
                    {t.login.description}
                  </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-5">
                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {t.login.email}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.login.emailPlaceholder}
                      className="
                        h-11 sm:h-14 w-full rounded-xl border border-slate-200
                        bg-slate-50 px-3.5 sm:px-4 text-sm text-slate-900 outline-none transition
                        placeholder:text-slate-400
                        focus:border-[#087f3f] focus:bg-white focus:ring-4 focus:ring-green-100
                        dark:border-slate-700 dark:bg-slate-950 dark:text-white
                        dark:focus:border-emerald-500 dark:focus:ring-emerald-500/10
                      "
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {t.login.password}
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.login.passwordPlaceholder}
                        className="
                          h-11 sm:h-14 w-full rounded-xl border border-slate-200
                          bg-slate-50 px-3.5 sm:px-4 pr-11 sm:pr-12 text-sm text-slate-900 outline-none transition
                          placeholder:text-slate-400
                          focus:border-[#087f3f] focus:bg-white focus:ring-4 focus:ring-green-100
                          dark:border-slate-700 dark:bg-slate-950 dark:text-white
                          dark:focus:border-emerald-500 dark:focus:ring-emerald-500/10
                        "
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                    >
                      {error}
                    </div>
                  )}

                  {/* SUCCESS */}
                  {success && (
                    <div
                      role="status"
                      className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300"
                    >
                      {success}
                    </div>
                  )}

                  {/* LOGIN BUTTON */}
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={loading}
                    className="
                      flex h-11 sm:h-14 w-full items-center justify-center rounded-xl
                      bg-[#087f3f] text-sm sm:text-base font-semibold text-white shadow-lg
                      transition hover:bg-[#066b35] active:bg-[#055729]
                      disabled:cursor-not-allowed disabled:opacity-60
                      dark:bg-emerald-600 dark:hover:bg-emerald-500
                    "
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {t.login.loggingIn}
                      </span>
                    ) : (
                      t.login.login
                    )}
                  </button>
                </form>

                {/* REGISTER LINK */}
                <p className="mt-3.5 sm:mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {t.login.noAccount}{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/register")}
                    className="font-semibold text-[#087f3f] hover:underline dark:text-emerald-400"
                  >
                    {t.login.createAccount}
                  </button>
                </p>

                {/* SECURITY NOTE */}
                <div className="mt-3 sm:mt-6 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-green-50 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px]">
                    ✓
                  </span>
                  Secure Vee Market login
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function Feature({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/15 px-3 py-4 text-center backdrop-blur-md">
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 text-xs font-semibold leading-tight text-white md:text-sm">
        {title}
      </p>
    </div>
  );
}

/* ============================================================
   VEE MARKET LEAF LOGO
============================================================ */

function LeafLogo() {
  return (
    <div className="relative h-9 w-9">
      <div className="absolute left-4 top-0 h-7 w-4 rotate-[-18deg] rounded-[100%_0_100%_0] bg-[#087f3f]" />
      <div className="absolute left-1 top-4 h-6 w-4 rotate-[-42deg] rounded-[100%_0_100%_0] bg-[#41a85f]" />
      <div className="absolute bottom-0 left-5 h-5 w-[2px] rotate-[20deg] bg-[#087f3f]" />
    </div>
  );
}

/* ============================================================
   EYE ICON
============================================================ */

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

/* ============================================================
   EYE OFF ICON
============================================================ */

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