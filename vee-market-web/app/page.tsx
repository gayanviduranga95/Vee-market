"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token =
      localStorage.getItem("vee-market-token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("vee_market_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const role = (
      localStorage.getItem("vee-market-user-role") ||
      localStorage.getItem("role") ||
      ""
    ).toUpperCase();

    if (role === "ADMIN") {
      router.replace("/dashboard/admin");
    } else if (role === "MILL") {
      router.replace("/dashboard/mill");
    } else if (role === "BUYER" || role === "SHOP" || role === "HOTEL") {
      router.replace("/dashboard/business");
    } else {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f4f7f3] flex items-center justify-center dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute left-1 top-2 w-7 h-5 bg-[#159447] rounded-[100%_0_100%_0] rotate-[-35deg]" />
          <div className="absolute left-4 top-0 w-7 h-5 bg-[#08763b] rounded-[0_100%_0_100%] rotate-[25deg]" />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 animate-pulse">
          Loading Vee Market...
        </p>
      </div>
    </div>
  );
}