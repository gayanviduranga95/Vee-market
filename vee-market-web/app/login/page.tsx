"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://172.18.228.12:8080";

type Language = "en" | "si";

const translations = {
  en: {
    brand: "Vee Market",
    tagline: "From Farm to Future",
    heroTitle: "Connecting Farmers, Mills and Businesses",
    heroDescription:
      "A trusted marketplace for paddy and rice in Sri Lanka.",

    fairMarket: "Fair Market",
    trustedNetwork: "Trusted Network",
    reliableSupply: "Reliable Supply",

    welcome: "Welcome Back",
    loginDescription: "Login to continue to your account",

    email: "Email address",
    password: "Password",

    emailPlaceholder: "example@gmail.com",
    passwordPlaceholder: "Enter your password",

    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",

    login: "Login",
    loggingIn: "Signing in...",

    continueWith: "or continue with",
    google: "Continue with Google",

    noAccount: "Don't have an account?",
    signup: "Sign up",

    secure: "Secure marketplace authentication",

    connectionError:
      "Unable to connect to the server.",

    unexpectedResponse:
      "The server returned an unexpected response. Please check the API connection.",

    loginError:
      "Invalid email or password.",

    networkError:
      "Network error. Please make sure the backend is running.",
  },

  si: {
    brand: "වී මාර්කට්",
    tagline: "ගොවිපළේ සිට අනාගතයට",

    heroTitle:
      "ගොවීන්, මෝල් සහ ව්‍යාපාර සම්බන්ධ කරමු",

    heroDescription:
      "ශ්‍රී ලංකාවේ වී සහ සහල් සඳහා විශ්වාසදායක වෙළඳපොළක්.",

    fairMarket: "සාධාරණ වෙළඳපොළ",
    trustedNetwork: "විශ්වාසදායක ජාලය",
    reliableSupply: "විශ්වාසදායක සැපයුම",

    welcome: "ආයුබෝවන්!",
    loginDescription:
      "ඔබගේ ගිණුමට ඇතුළු වන්න",

    email: "විද්‍යුත් තැපෑල",
    password: "මුරපදය",

    emailPlaceholder: "example@gmail.com",
    passwordPlaceholder:
      "ඔබගේ මුරපදය ඇතුළත් කරන්න",

    rememberMe: "මාව මතක තබා ගන්න",
    forgotPassword: "මුරපදය අමතකද?",

    login: "ඇතුළු වන්න",
    loggingIn: "ඇතුළු වෙමින්...",

    continueWith: "හෝ",
    google: "Google සමඟ පිවිසෙන්න",

    noAccount: "ගිණුමක් නැද්ද?",
    signup: "ලියාපදිංචි වන්න",

    secure:
      "ආරක්ෂිත වෙළඳපොළ සත්‍යාපනය",

    connectionError:
      "සේවාදායකයට සම්බන්ධ වීමට නොහැක.",

    unexpectedResponse:
      "සේවාදායකයෙන් අනපේක්ෂිත ප්‍රතිචාරයක් ලැබුණි.",

    loginError:
      "විද්‍යුත් තැපෑල හෝ මුරපදය වැරදියි.",

    networkError:
      "ජාල දෝෂයකි. Backend එක ක්‍රියාත්මක දැයි පරීක්ෂා කරන්න.",
  },
};

export default function LoginPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<Language>("en");

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(true);

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const t = translations[language];

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const loginUrl =
      `${API_URL}/api/auth/login`;

    try {
      console.log(
        "Vee Market login:",
        loginUrl
      );

      const response = await fetch(
        loginUrl,
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

      /*
       * Read text first.
       * This prevents:
       *
       * Unexpected token '<'
       */

      const rawResponse =
        await response.text();

      console.log(
        "Login status:",
        response.status
      );

      console.log(
        "Login response:",
        rawResponse
      );

      if (
        !contentType
          .toLowerCase()
          .includes(
            "application/json"
          )
      ) {
        console.error(
          "Expected JSON but received:",
          rawResponse.substring(0, 500)
        );

        throw new Error(
          t.unexpectedResponse
        );
      }

      let data: any;

      try {
        data =
          JSON.parse(rawResponse);
      } catch {
        throw new Error(
          t.unexpectedResponse
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            t.loginError
        );
      }

      if (!data?.token) {
        console.error(
          "No token returned:",
          data
        );

        throw new Error(
          t.loginError
        );
      }

      /*
       * Save authentication information.
       */

      localStorage.setItem(
        "vee_market_token",
        data.token
      );

      if (data.userId) {
        localStorage.setItem(
          "vee_market_user_id",
          String(data.userId)
        );
      }

      if (data.role) {
        localStorage.setItem(
          "vee_market_role",
          String(data.role)
        );
      }

      localStorage.setItem(
        "vee_market_email",
        email.trim()
      );

      if (rememberMe) {
        localStorage.setItem(
          "vee_market_remember",
          "true"
        );
      } else {
        localStorage.removeItem(
          "vee_market_remember"
        );
      }

      /*
       * Redirect.
       */

      router.push(
        "/dashboard"
      );

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      if (
        err instanceof TypeError
      ) {
        setError(
          t.networkError
        );
      } else if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          t.loginError
        );
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#edf5ef]">

      <div
        className="
          mx-auto min-h-screen w-full
          max-w-[1700px] xl:p-6
        "
      >

        <div
          className="
            relative flex min-h-screen
            flex-col overflow-hidden
            bg-white

            xl:min-h-[calc(100vh-48px)]
            xl:flex-row
            xl:rounded-[30px]
            xl:shadow-[0_20px_70px_rgba(0,0,0,0.12)]
          "
        >

          {/* HERO */}

          <section
            className="
              relative flex min-h-[460px]
              w-full flex-col justify-end
              overflow-hidden

              sm:min-h-[520px]
              md:min-h-[560px]

              xl:min-h-0
              xl:w-[55%]
            "
          >

            <div
              className="
                absolute inset-0
                bg-cover
                bg-center
                bg-no-repeat
              "
              style={{
                backgroundImage:
                  "url('/vee-market-hero.png')",
              }}
            />

            <div
              className="
                absolute inset-0
                bg-gradient-to-t
                from-[#04351f]/85
                via-[#04351f]/30
                to-[#04351f]/5
              "
            />

            {/* Logo */}

            <div
              className="
                absolute left-5 top-5
                z-10 flex items-center gap-3

                sm:left-8 sm:top-8
                xl:left-10 xl:top-10
              "
            >

              <div
                className="
                  flex h-11 w-11
                  items-center justify-center
                  rounded-xl bg-white/90
                  shadow-lg backdrop-blur
                "
              >
                <LeafLogo dark />
              </div>

              <div>
                <h1 className="text-lg font-bold text-white">
                  {t.brand}
                </h1>

                <p className="text-xs text-white/80">
                  {t.tagline}
                </p>
              </div>

            </div>

            {/* Hero content */}

            <div
              className="
                relative z-10 w-full
                p-5

                sm:p-8
                md:p-10
                xl:p-14
                2xl:p-16
              "
            >

              <div className="max-w-[650px]">

                <h2
                  className="
                    max-w-[600px]
                    text-3xl font-bold
                    leading-[1.08]
                    tracking-tight
                    text-white
                    drop-shadow-lg

                    sm:text-4xl
                    md:text-5xl
                    xl:text-[58px]
                    2xl:text-[64px]
                  "
                >
                  {t.heroTitle}
                </h2>

                <p
                  className="
                    mt-4 max-w-[560px]
                    text-sm leading-6
                    text-white/90

                    sm:text-base
                    md:text-lg
                    md:leading-7
                  "
                >
                  {t.heroDescription}
                </p>

                <div
                  className="
                    mt-6 grid
                    max-w-[580px]
                    grid-cols-3 gap-2

                    sm:mt-7
                    sm:gap-3
                    md:gap-4
                  "
                >

                  <Feature
                    icon="🌱"
                    title={t.fairMarket}
                  />

                  <Feature
                    icon="🤝"
                    title={t.trustedNetwork}
                  />

                  <Feature
                    icon="🚚"
                    title={t.reliableSupply}
                  />

                </div>

                <div className="mt-6">

                  <p
                    className="
                      font-serif text-xl
                      italic text-white

                      sm:text-2xl
                      md:text-3xl
                    "
                  >
                    {t.brand}
                  </p>

                  <div
                    className="
                      mt-2 h-1 w-28
                      rounded-full
                      bg-green-400
                    "
                  />

                  <p className="mt-2 text-xs text-white sm:text-sm">
                    {t.tagline}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* LOGIN */}

          <section
            className="
              relative flex w-full flex-1
              items-center justify-center
              bg-white px-5 py-10

              sm:px-8
              md:px-12

              xl:w-[45%]
              xl:px-14
              xl:py-10

              2xl:px-20
            "
          >

            {/* Language */}

            <div
              className="
                absolute right-4 top-4
                z-20

                sm:right-7 sm:top-7
                xl:right-9 xl:top-9
              "
            >

              <div
                className="
                  flex rounded-full
                  border border-slate-200
                  bg-slate-50 p-1
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setLanguage("si")
                  }
                  className={`
                    rounded-full
                    px-3 py-2
                    text-xs font-medium
                    transition

                    sm:px-4 sm:text-sm

                    ${
                      language === "si"
                        ? "bg-[#087f3f] text-white"
                        : "text-slate-600"
                    }
                  `}
                >
                  සිංහල
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setLanguage("en")
                  }
                  className={`
                    rounded-full
                    px-3 py-2
                    text-xs font-medium
                    transition

                    sm:px-4 sm:text-sm

                    ${
                      language === "en"
                        ? "bg-[#087f3f] text-white"
                        : "text-slate-600"
                    }
                  `}
                >
                  English
                </button>

              </div>

            </div>

            <div
              className="
                w-full max-w-[460px]
                pt-12

                sm:pt-14
                xl:pt-4
              "
            >

              {/* Logo */}

              <div className="mb-6 text-center">

                <div
                  className="
                    mx-auto flex h-14 w-14
                    items-center justify-center
                    rounded-2xl bg-green-50
                  "
                >
                  <LeafLogo dark />
                </div>

                <h2
                  className="
                    mt-3 text-xl font-bold
                    text-[#063b25]

                    sm:text-2xl
                  "
                >
                  {t.brand}
                </h2>

              </div>

              {/* Welcome */}

              <div className="text-center">

                <h3
                  className="
                    text-3xl font-bold
                    tracking-tight
                    text-slate-900

                    sm:text-4xl
                  "
                >
                  {t.welcome}
                </h3>

                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  {t.loginDescription}
                </p>

              </div>

              {/* Form */}

              <form
                onSubmit={handleLogin}
                className="mt-7 space-y-5"
              >

                {/* Email */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t.email}
                  </label>

                  <div className="relative">

                    <div
                      className="
                        pointer-events-none
                        absolute left-4 top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    >
                      <MailIcon />
                    </div>

                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder={
                        t.emailPlaceholder
                      }
                      className="
                        h-14 w-full
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        pl-12 pr-4
                        text-sm text-slate-900
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

                </div>

                {/* Password */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t.password}
                  </label>

                  <div className="relative">

                    <div
                      className="
                        pointer-events-none
                        absolute left-4 top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    >
                      <LockIcon />
                    </div>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder={
                        t.passwordPlaceholder
                      }
                      className="
                        h-14 w-full
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        pl-12 pr-12
                        text-sm text-slate-900
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
                      className="
                        absolute right-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
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

                {/* Remember */}

                <div
                  className="
                    flex flex-wrap
                    items-center
                    justify-between
                    gap-3
                  "
                >

                  <label
                    className="
                      flex cursor-pointer
                      items-center gap-2
                      text-sm text-slate-600
                    "
                  >

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(
                          e.target.checked
                        )
                      }
                      className="
                        h-4 w-4
                        accent-[#087f3f]
                      "
                    />

                    {t.rememberMe}

                  </label>

                  <button
                    type="button"
                    className="
                      text-sm font-medium
                      text-[#087f3f]
                    "
                  >
                    {t.forgotPassword}
                  </button>

                </div>

                {/* Error */}

                {error && (
                  <div
                    role="alert"
                    className="
                      rounded-xl
                      border border-red-100
                      bg-red-50
                      px-4 py-3
                      text-sm
                      text-red-700
                    "
                  >
                    {error}
                  </div>
                )}

                {/* Login */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    h-14 w-full
                    rounded-xl
                    bg-[#087f3f]
                    text-base font-semibold
                    text-white
                    shadow-lg
                    transition

                    hover:bg-[#066b35]

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading
                    ? t.loggingIn
                    : t.login}
                </button>

                {/* Divider */}

                <div className="flex items-center gap-3 py-1">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">
                    {t.continueWith}
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>

                {/* Google */}

                <button
                  type="button"
                  className="
                    flex h-14 w-full
                    items-center
                    justify-center gap-3
                    rounded-xl
                    border border-slate-200
                    bg-white
                    text-sm font-medium
                    text-slate-700

                    hover:bg-slate-50
                  "
                >
                  <GoogleIcon />
                  {t.google}
                </button>

              </form>

              {/* Register */}

              <p className="mt-6 text-center text-sm text-slate-500">

                {t.noAccount}{" "}

                <button
                  type="button"
                  onClick={() =>
                    router.push("/register")
                  }
                  className="
                    font-semibold
                    text-[#087f3f]
                  "
                >
                  {t.signup}
                </button>

              </p>

              {/* Security */}

              <div
                className="
                  mt-7 flex
                  items-center
                  justify-center
                  gap-2
                  text-xs
                  text-slate-400
                "
              >

                <span
                  className="
                    flex h-6 w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-green-50
                    text-green-700
                  "
                >
                  ✓
                </span>

                {t.secure}

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   FEATURE
========================================================= */

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
        border border-white/20
        bg-white/15
        px-2 py-3
        text-center
        backdrop-blur-md

        sm:rounded-2xl
        sm:px-3
        sm:py-4
      "
    >
      <div className="text-xl sm:text-2xl">
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

/* =========================================================
   LOGO
========================================================= */

function LeafLogo({
  dark = false,
}: {
  dark?: boolean;
}) {
  return (
    <div className="relative h-9 w-9">

      <div
        className={`
          absolute left-4 top-0
          h-7 w-4
          rotate-[-18deg]
          rounded-[100%_0_100%_0]
          ${
            dark
              ? "bg-[#087f3f]"
              : "bg-white"
          }
        `}
      />

      <div
        className={`
          absolute left-1 top-4
          h-6 w-4
          rotate-[-42deg]
          rounded-[100%_0_100%_0]
          opacity-80
          ${
            dark
              ? "bg-[#41a85f]"
              : "bg-white"
          }
        `}
      />

      <div
        className={`
          absolute bottom-0 left-5
          h-5 w-[2px]
          rotate-[20deg]
          ${
            dark
              ? "bg-[#087f3f]"
              : "bg-white"
          }
        `}
      />

    </div>
  );
}

/* =========================================================
   MAIL
========================================================= */

function MailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

/* =========================================================
   LOCK
========================================================= */

function LockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* =========================================================
   EYE
========================================================= */

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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

/* =========================================================
   EYE OFF
========================================================= */

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m3 3 18 18" />

      <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.1 3.8" />

      <path d="M6.5 9.1C4.1 10.4 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.5" />

      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

/* =========================================================
   GOOGLE
========================================================= */

function GoogleIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.23a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.42Z"
      />

      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.83A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.21 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"
      />
    </svg>
  );
}