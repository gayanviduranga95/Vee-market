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
        dark:border-slate-700
        dark:bg-slate-800
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
          py-1.5
          text-xs
          font-bold
          transition
          sm:px-3.5
          ${
            language === "si"
              ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
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
          py-1.5
          text-xs
          font-bold
          transition
          sm:px-3.5
          ${
            language === "en"
              ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          }
        `}
      >
        English
      </button>
    </div>
  );
}