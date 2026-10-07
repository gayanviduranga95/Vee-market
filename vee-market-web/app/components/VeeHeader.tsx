"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

type VeeHeaderProps = {
  roleBadge?: string;
  roleType?: "ADMIN" | "MILL" | "BUYER" | "FARMER";
  activeNav?: string;
};

export default function VeeHeader({ roleBadge, roleType }: VeeHeaderProps) {
  const router = useRouter();

  function logout() {
    [
      "vee-market-token",
      "vee-market-user-id",
      "vee-market-user-email",
      "vee-market-user-role",
      "token",
      "vee_market_token",
      "vee_market_email",
    ].forEach((k) => localStorage.removeItem(k));
    router.replace("/login");
  }

  const homeHref =
    roleType === "ADMIN"
      ? "/dashboard/admin"
      : roleType === "MILL"
      ? "/dashboard/mill"
      : roleType === "BUYER"
      ? "/dashboard/business"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* BRAND LOGO */}
        <Link href={homeHref} className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 flex items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
            <div className="relative h-8 w-8">
              <div className="absolute left-3.5 top-0 h-6 w-3.5 rotate-[-18deg] rounded-[100%_0_100%_0] bg-[#087f3f]" />
              <div className="absolute left-1 top-3 h-5 w-3.5 rotate-[-42deg] rounded-[100%_0_100%_0] bg-[#41a85f]" />
              <div className="absolute bottom-0 left-4 h-4 w-[2px] rotate-[20deg] bg-[#087f3f]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-[#063b25] dark:text-emerald-400">
                Vee Market
              </span>
              {roleBadge && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-[#087f3f] dark:bg-emerald-950/70 dark:text-emerald-300">
                  {roleBadge}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              From Farm to Future
            </p>
          </div>
        </Link>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeSwitcher />

          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
