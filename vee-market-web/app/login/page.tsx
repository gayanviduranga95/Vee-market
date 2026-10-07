"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  useLanguage,
} from "../components/LanguageProvider";

import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeSwitcher from "../components/ThemeSwitcher";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://172.18.228.12:8080";

function getTokenRole(token: string) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const decoded = JSON.parse(
      atob(normalized)
    ) as { role?: string };

    return decoded.role || "";
  } catch {
    return "";
  }
}

export default function LoginPage() {
  const router = useRouter();

  const {
    t,
  } = useLanguage();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
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

      const response =
        await fetch(
          `${API_URL}/api/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              email: email.trim(),
              password,
            }),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const rawResponse =
        await response.text();

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

      if (
        rawResponse &&
        contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        try {
          data =
            JSON.parse(
              rawResponse
            );
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            t.login.loginError
        );
      }

      /*
       * Backend normally returns:
       *
       * {
       *   token: "...",
       *   userId: 1,
       *   email: "...",
       *   role: "FARMER"
       * }
       *
       * We support a few common
       * property names so the frontend
       * remains flexible.
       */

      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt;

      if (!token) {
        throw new Error(
          t.login.loginError
        );
      }

      /*
       * Save authentication information.
       */

      localStorage.setItem(
        "vee-market-token",
        token
      );

      if (
        data?.userId !== undefined &&
        data?.userId !== null
      ) {
        localStorage.setItem(
          "vee-market-user-id",
          String(data.userId)
        );
      }

      if (data?.email) {
        localStorage.setItem(
          "vee-market-user-email",
          data.email
        );
      } else {
        localStorage.setItem(
          "vee-market-user-email",
          email.trim()
        );
      }

      if (data?.role) {
        localStorage.setItem(
          "vee-market-user-role",
          data.role
        );
      }

      /*
       * Keep the old token key too
       * if other existing frontend
       * code uses it.
       */

      localStorage.setItem(
        "token",
        token
      );

      setSuccess(
        t.login.loginSuccess
      );

      const loginRole = (
        data?.role ||
        getTokenRole(token) ||
        localStorage.getItem("vee-market-user-role") ||
        ""
      ).toUpperCase();

      if (loginRole) {
        localStorage.setItem(
          "vee-market-user-role",
          loginRole
        );
      }

      /*
       * Redirect to dashboard based on role.
       */
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
      console.error(
        "Login error:",
        err
      );

      if (
        err instanceof TypeError
      ) {
        setError(
          t.login.connectionError
        );
      } else if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          t.login.loginError
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#edf5ef]
        dark:bg-background
      "
    >
      <div
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-[1700px]
          xl:p-6
        "
      >
        <div
          className="
            relative
            flex
            min-h-screen
            flex-col
            overflow-hidden
            bg-white
            dark:bg-surface

            xl:flex-row
            xl:min-h-[calc(100vh-48px)]
            xl:rounded-[30px]
            xl:shadow-[0_20px_70px_rgba(0,0,0,0.12)]
          "
        >

          {/* ==================================================
              LEFT HERO
          ================================================== */}

          <section
            className="
              relative
              flex
              min-h-[430px]
              w-full
              flex-col
              justify-end
              overflow-hidden

              sm:min-h-[500px]
              xl:min-h-0
              xl:w-[55%]
            "
          >

            {/* HERO IMAGE */}

            <div
              className="
                absolute
                inset-0
                bg-cover
                bg-center
              "
              style={{
                backgroundImage:
                  "url('/vee-market-hero.png')",
              }}
            />

            {/* DARK GRADIENT */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-[#04351f]/95
                via-[#04351f]/45
                to-transparent
              "
            />

            {/* ==================================================
                BRAND
            ================================================== */}

            <div
              className="
                absolute
                left-5
                top-5
                z-10

                flex
                items-center
                gap-3

                sm:left-8
                sm:top-8
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/90
                  shadow-lg
                "
              >
                <LeafLogo />
              </div>

              <div>

                <h1
                  className="
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  {t.brand.name}
                </h1>

                <p
                  className="
                    text-xs
                    text-white/80
                  "
                >
                  {t.brand.tagline}
                </p>

              </div>

            </div>

            {/* ==================================================
                HERO CONTENT
            ================================================== */}

            <div
              className="
                relative
                z-10
                p-5

                sm:p-8
                md:p-10
                xl:p-14
              "
            >

              <div
                className="
                  max-w-[650px]
                "
              >

                <h2
                  className="
                    text-3xl
                    font-bold
                    leading-tight
                    tracking-tight
                    text-white

                    sm:text-4xl
                    md:text-5xl
                    xl:text-[56px]
                  "
                >
                  {t.login.heroTitle}
                </h2>

                <p
                  className="
                    mt-4
                    max-w-[560px]
                    text-sm
                    leading-6
                    text-white/90

                    sm:text-base
                    md:text-lg
                  "
                >
                  {t.login.heroDescription}
                </p>

                {/* FEATURES */}

                <div
                  className="
                    mt-6
                    grid
                    grid-cols-3
                    gap-2

                    sm:gap-3
                    md:gap-4
                  "
                >

                  <Feature
                    icon="🌱"
                    title={
                      t.login.fairMarket
                    }
                  />

                  <Feature
                    icon="🤝"
                    title={
                      t.login
                        .trustedNetwork
                    }
                  />

                  <Feature
                    icon="🚚"
                    title={
                      t.login
                        .reliableSupply
                    }
                  />

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              RIGHT LOGIN PANEL
          ================================================== */}

          <section
            className="
              relative
              flex
              w-full
              flex-1
              items-center
              justify-center
              bg-white
              dark:bg-surface

              px-5
              py-10

              sm:px-8
              md:px-12

              xl:w-[45%]
              xl:px-14
              xl:py-10
            "
          >

            {/* ==================================================
                LANGUAGE SWITCHER
            ================================================== */}

            <div
              className="
                absolute
                right-4
                top-4

                sm:right-7
                sm:top-7
              "
            >
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
              <LanguageSwitcher />
              </div>
            </div>

            <div
              className="
                w-full
                max-w-[450px]
                pt-10

                sm:pt-14
                xl:pt-4
              "
            >

              {/* ==================================================
                  LOGO
              ================================================== */}

              <div
                className="
                  mb-7
                  text-center
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-green-50
                  "
                >
                  <LeafLogo />
                </div>

                <h2
                  className="
                    mt-3
                    text-xl
                    font-bold
                    text-[#063b25]

                    sm:text-2xl
                  "
                >
                  {t.brand.name}
                </h2>

              </div>

              {/* ==================================================
                  TITLE
              ================================================== */}

              <div
                className="
                  text-center
                "
              >

                <h3
                  className="
                    text-3xl
                    font-bold
                    tracking-tight
                    text-slate-900

                    sm:text-4xl
                  "
                >
                  {t.login.title}
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-500

                    sm:text-base
                  "
                >
                  {t.login.description}
                </p>

              </div>

              {/* QUICK DEMO CREDENTIALS SHORTCUTS */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                  <span>⚡ Quick Demo / Test Accounts</span>
                  <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">1-click fill</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@veemarket.com");
                      setPassword("password123");
                      setError("");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/80 px-2 py-2 text-xs font-bold text-purple-800 transition hover:bg-purple-100 hover:border-purple-300 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300"
                  >
                    <span>👑</span>
                    <span>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("gayanviduranga95@gmail.com");
                      setPassword("password123");
                      setError("");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-2 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 hover:border-emerald-300 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                  >
                    <span>🌾</span>
                    <span>Farmer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("brmnfmrfkoxzqkduit@xfavaj.com");
                      setPassword("password123");
                      setError("");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-2 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 hover:border-amber-300 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                  >
                    <span>🏭</span>
                    <span>Mill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("brmnfmrfkoxzqkduiv@xfavaj.com");
                      setPassword("password123");
                      setError("");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-2 py-2 text-xs font-bold text-blue-800 transition hover:bg-blue-100 hover:border-blue-300 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    <span>🏪</span>
                    <span>Shop/Hotel</span>
                  </button>
                </div>
              </div>

              {/* ==================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={
                  handleLogin
                }
                className="
                  mt-6
                  space-y-5
                "
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    {t.login.email}
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target
                          .value
                      )
                    }
                    placeholder={
                      t.login
                        .emailPlaceholder
                    }
                    className="
                      h-14
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition

                      placeholder:text-slate-400

                      focus:border-[#087f3f]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-green-100
                    "
                  />

                </div>

                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    {t.login.password}
                  </label>

                  <div
                    className="
                      relative
                    "
                  >

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      autoComplete="current-password"
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target
                            .value
                        )
                      }
                      placeholder={
                        t.login
                          .passwordPlaceholder
                      }
                      className="
                        h-14
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        pr-12
                        text-sm
                        text-slate-900
                        outline-none
                        transition

                        placeholder:text-slate-400

                        focus:border-[#087f3f]
                        focus:bg-white
                        focus:ring-4
                        focus:ring-green-100
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        transition
                        hover:text-slate-700
                      "
                    >
                      {showPassword ? (
                        <EyeOffIcon />
                      ) : (
                        <EyeIcon />
                      )}
                    </button>

                  </div>

                </div>

                {/* ERROR */}

                {error && (
                  <div
                    role="alert"
                    className="
                      rounded-xl
                      border
                      border-red-100
                      bg-red-50
                      px-4
                      py-3
                      text-sm
                      text-red-700
                    "
                  >
                    {error}
                  </div>
                )}

                {/* SUCCESS */}

                {success && (
                  <div
                    role="status"
                    className="
                      rounded-xl
                      border
                      border-green-100
                      bg-green-50
                      px-4
                      py-3
                      text-sm
                      text-green-700
                    "
                  >
                    {success}
                  </div>
                )}

                {/* ==================================================
                    LOGIN BUTTON
                ================================================== */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex
                    h-14
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#087f3f]
                    text-base
                    font-semibold
                    text-white
                    shadow-lg
                    transition

                    hover:bg-[#066b35]

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading ? (
                    <span
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          h-5
                          w-5
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      {
                        t.login
                          .loggingIn
                      }
                    </span>
                  ) : (
                    t.login.login
                  )}

                </button>

              </form>

              {/* ==================================================
                  REGISTER
              ================================================== */}

              <p
                className="
                  mt-7
                  text-center
                  text-sm
                  text-slate-500
                "
              >

                {t.login.noAccount}{" "}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/register"
                    )
                  }
                  className="
                    font-semibold
                    text-[#087f3f]
                    hover:underline
                  "
                >
                  {t.login.createAccount}
                </button>

              </p>

              {/* ==================================================
                  SECURITY
              ================================================== */}

              <div
                className="
                  mt-8
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-xs
                  text-slate-400
                "
              >

                <span
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-green-50
                    text-green-700
                  "
                >
                  ✓
                </span>

                Secure Vee Market login

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

function Feature({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/20
        bg-white/15
        px-2
        py-3
        text-center
        backdrop-blur-md

        sm:rounded-2xl
        sm:px-3
        sm:py-4
      "
    >

      <div
        className="
          text-xl
          sm:text-2xl
        "
      >
        {icon}
      </div>

      <p
        className="
          mt-2
          text-[10px]
          font-semibold
          leading-tight
          text-white

          sm:text-xs
          md:text-sm
        "
      >
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
    <div
      className="
        relative
        h-9
        w-9
      "
    >

      <div
        className="
          absolute
          left-4
          top-0
          h-7
          w-4
          rotate-[-18deg]
          rounded-[100%_0_100%_0]
          bg-[#087f3f]
        "
      />

      <div
        className="
          absolute
          left-1
          top-4
          h-6
          w-4
          rotate-[-42deg]
          rounded-[100%_0_100%_0]
          bg-[#41a85f]
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-5
          h-5
          w-[2px]
          rotate-[20deg]
          bg-[#087f3f]
        "
      />

    </div>
  );
}

/* ============================================================
   EYE ICON
============================================================ */

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />

      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
    </svg>
  );
}

/* ============================================================
   EYE OFF ICON
============================================================ */

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 18 18" />

      <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.1 3.8" />

      <path d="M6.5 9.1C4.1 10.4 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.5" />

      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}