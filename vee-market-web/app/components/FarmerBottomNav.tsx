"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";

interface NavItem {
  href: string;
  labelEn: string;
  labelSi: string;
  icon: string;
  matchPrefix?: boolean;
}

const FARMER_NAV: NavItem[] = [
  { href: "/dashboard", labelEn: "Home", labelSi: "මුල් පිටුව", icon: "🌾" },
  { href: "/dashboard/listings", labelEn: "My Lots", labelSi: "මගේ තොග", icon: "📦", matchPrefix: true },
  { href: "/dashboard/bids", labelEn: "Offers", labelSi: "මිල ගණන්", icon: "🤝" },
  { href: "/dashboard/profile", labelEn: "Profile", labelSi: "පැතිකඩ", icon: "👤" },
];

export function FarmerBottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  // Hide on authentication and landing screens
  if (!pathname || pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  // Check if role is mill or buyer or admin (only display for farmers or default dashboard)
  const isMill = pathname.startsWith("/dashboard/mill");
  const isBusiness = pathname.startsWith("/dashboard/business");
  const isAdmin = pathname.startsWith("/dashboard/admin");

  if (isMill || isBusiness || isAdmin) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 px-1 py-1">
        {FARMER_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.matchPrefix && item.href !== "/dashboard" && pathname.startsWith(item.href));

          const label = isSinhala ? item.labelSi : item.labelEn;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-xl py-1.5 transition-all select-none ${
                isActive
                  ? "text-[#087f3f] font-extrabold dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-900 font-medium dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className="mt-0.5 text-[11px] leading-tight tracking-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
