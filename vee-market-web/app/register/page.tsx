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

export default function RegisterPage() {
  const router = useRouter();

  const {
    t,
  } = useLanguage();

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [deviceNumber, setDeviceNumber] =
    useState("");

  const [accountType, setAccountType] =
    useState("FARMER");

  const [businessName, setBusinessName] =
    useState("");

  const [businessLocation, setBusinessLocation] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      password !==
      confirmPassword
    ) {
      setError(
        t.register.passwordMismatch
      );

      return;
    }

    if (password.length < 6) {
      setError(
        t.register.passwordShort
      );

      return;
    }

    if (
      ["SHOP", "HOTEL"].includes(accountType) &&
      !businessName.trim()
    ) {
      setError(t.register.businessName);
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/auth/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              password,
              phone: phone.trim(),
              role: accountType === "MILL"
                ? "MILL"
                : accountType === "SHOP" || accountType === "HOTEL"
                ? "BUYER"
                : "FARMER",
              deviceNumber: accountType === "FARMER"
                ? deviceNumber.trim()
                : null,
              businessType: ["SHOP", "HOTEL"].includes(accountType)
                ? accountType
                : null,
              businessName: ["SHOP", "HOTEL"].includes(accountType)
                ? businessName.trim()
                : null,
              businessLocation: ["SHOP", "HOTEL"].includes(accountType)
                ? businessLocation.trim() || null
                : null,
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
        message?: string;
        error?: string;
      } | null = null;

      if (
        rawResponse &&
        contentType
          .toLowerCase()
          .includes(
            "application/json"
          )
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
            t.register
              .registrationError
        );
      }

      setSuccess(
        t.register.success
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      if (
        err instanceof TypeError
      ) {
        setError(
          t.register
            .connectionError
        );
      } else if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          t.register
            .registrationError
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

          {/* HERO */}

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

            {/* LOGO */}

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

            {/* HERO TEXT */}

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
                  {t.register.heroTitle}
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
                  {t.register.heroDescription}
                </p>

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
                      t.register.fairMarket
                    }
                  />

                  <Feature
                    icon="🤝"
                    title={
                      t.register
                        .trustedNetwork
                    }
                  />

                  <Feature
                    icon="🚚"
                    title={
                      t.register
                        .reliableSupply
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* FORM */}

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

            {/* GLOBAL LANGUAGE SWITCH */}

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
                max-w-[500px]
                pt-10

                sm:pt-14
                xl:pt-4
              "
            >

              {/* LOGO */}

              <div
                className="
                  mb-6
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

              <div className="text-center">
                <h3
                  className="
                    text-3xl
                    font-bold
                    tracking-tight
                    text-slate-900

                    sm:text-4xl
                  "
                >
                  {t.register.title}
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-500

                    sm:text-base
                  "
                >
                  {t.register.description}
                </p>
              </div>

              <form
                onSubmit={
                  handleRegister
                }
                className="
                  mt-7
                  space-y-4
                "
              >

                <Input
                  label={
                    t.register.name
                  }
                  value={name}
                  onChange={
                    setName
                  }
                  placeholder={
                    t.register
                      .namePlaceholder
                  }
                  autoComplete="name"
                  required
                />

                <Input
                  label={
                    t.register.phone
                  }
                  value={phone}
                  onChange={
                    setPhone
                  }
                  placeholder={
                    t.register
                      .phonePlaceholder
                  }
                  type="tel"
                  autoComplete="tel"
                  required
                />

                <Input
                  label={
                    t.register.email
                  }
                  value={email}
                  onChange={
                    setEmail
                  }
                  placeholder={
                    t.register
                      .emailPlaceholder
                  }
                  type="email"
                  autoComplete="email"
                  required
                />

                <Input
                  label={
                    t.register
                      .deviceNumber
                  }
                  value={
                    deviceNumber
                  }
                  onChange={
                    setDeviceNumber
                  }
                  placeholder={
                    t.register
                      .deviceNumberPlaceholder
                  }
                  required={accountType === "FARMER"}
                />

                {/* ACCOUNT TYPE */}

                <div>
                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    {
                      t.register
                        .accountType
                    }
                  </label>

                  <select
                    value={accountType}
                    onChange={(event) => setAccountType(event.target.value)}
                    className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-[#087f3f] focus:ring-4 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="FARMER">🌾 {t.register.farmer}</option>
                    <option value="MILL">🏭 {t.register.mill}</option>
                    <option value="SHOP">🏪 {t.register.shop}</option>
                    <option value="HOTEL">🏨 {t.register.hotel}</option>
                  </select>
                </div>

                {(accountType === "SHOP" || accountType === "HOTEL") && (
                  <>
                    <Input
                      label={t.register.businessName}
                      value={businessName}
                      onChange={setBusinessName}
                      placeholder={t.register.businessNamePlaceholder}
                      required
                    />

                    <Input
                      label={t.register.businessLocation}
                      value={businessLocation}
                      onChange={setBusinessLocation}
                      placeholder={t.register.businessLocationPlaceholder}
                    />
                  </>
                )}

                <PasswordInput
                  label={
                    t.register
                      .password
                  }
                  value={
                    password
                  }
                  onChange={
                    setPassword
                  }
                  placeholder={
                    t.register
                      .passwordPlaceholder
                  }
                  show={
                    showPassword
                  }
                  onToggle={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  autoComplete="new-password"
                />

                <PasswordInput
                  label={
                    t.register
                      .confirmPassword
                  }
                  value={
                    confirmPassword
                  }
                  onChange={
                    setConfirmPassword
                  }
                  placeholder={
                    t.register
                      .confirmPasswordPlaceholder
                  }
                  show={
                    showConfirmPassword
                  }
                  onToggle={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  autoComplete="new-password"
                />

                {error && (
                  <div
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

                {success && (
                  <div
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

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    h-14
                    w-full
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
                  {loading
                    ? t.register
                        .creatingAccount
                    : t.register
                        .createAccount}
                </button>
              </form>

              <p
                className="
                  mt-6
                  text-center
                  text-sm
                  text-slate-500
                "
              >
                {
                  t.register
                    .alreadyAccount
                }{" "}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/login"
                    )
                  }
                  className="
                    font-semibold
                    text-[#087f3f]
                    hover:underline
                  "
                >
                  {t.common?.login ??
                    "Login"}
                </button>
              </p>

              <div
                className="
                  mt-7
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

                {t.register.secure}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="
          mb-2
          block
          text-sm
          font-medium
          text-slate-700
        "
      >
        {label}
      </label>

      <input
        type={type}
        required={required}
        autoComplete={
          autoComplete
        }
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
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
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        className="
          mb-2
          block
          text-sm
          font-medium
          text-slate-700
        "
      >
        {label}
      </label>

      <div className="relative">
        <input
          type={
            show
              ? "text"
              : "password"
          }
          required
          autoComplete={
            autoComplete
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder={
            placeholder
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
          onClick={onToggle}
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        >
          {show ? (
            <EyeOffIcon />
          ) : (
            <EyeIcon />
          )}
        </button>
      </div>
    </div>
  );
}

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