"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BusinessRegistrationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f4f7f3] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute left-1 top-2 w-7 h-5 bg-[#159447] rounded-[100%_0_100%_0] rotate-[-35deg]" />
          <div className="absolute left-4 top-0 w-7 h-5 bg-[#08763b] rounded-[0_100%_0_100%] rotate-[25deg]" />
        </div>
        <p className="text-sm font-semibold text-slate-600 animate-pulse">Redirecting to registration...</p>
      </div>
    </div>
  );
}
