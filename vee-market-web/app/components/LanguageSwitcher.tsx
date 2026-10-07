"use client";

import {
  useLanguage,
} from "./LanguageProvider";

export default function LanguageSwitcher() {
  const {
    language,
    setLanguage,
  } = useLanguage();

  return (
    <div
      className="
        flex
        rounded-full
        border
        border-slate-200
        bg-slate-50
        p-1
      "
    >
      <button
        type="button"
        onClick={() =>
          setLanguage("si")
        }
        className={`
          rounded-full
          px-3
          py-2
          text-xs
          font-medium
          transition

          sm:px-4
          sm:text-sm

          ${
            language === "si"
              ? "bg-[#087f3f] text-white shadow-sm"
              : "text-slate-600 hover:bg-white"
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
          px-3
          py-2
          text-xs
          font-medium
          transition

          sm:px-4
          sm:text-sm

          ${
            language === "en"
              ? "bg-[#087f3f] text-white shadow-sm"
              : "text-slate-600 hover:bg-white"
          }
        `}
      >
        English
      </button>
    </div>
  );
}