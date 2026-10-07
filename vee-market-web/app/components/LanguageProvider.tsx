"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  en,
  Translation,
} from "../i18n/en";

import { si } from "../i18n/si";

export type Language =
  | "en"
  | "si";

type LanguageContextType = {
  language: Language;

  setLanguage: (
    language: Language
  ) => void;

  t: Translation;
};

const LanguageContext =
  createContext<
    LanguageContextType | undefined
  >(undefined);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(
        "vee-market-language"
      );

    if (
      savedLanguage === "en" ||
      savedLanguage === "si"
    ) {
      setLanguageState(
        savedLanguage
      );
    }

    setMounted(true);
  }, []);

  function setLanguage(
    newLanguage: Language
  ) {
    setLanguageState(
      newLanguage
    );

    localStorage.setItem(
      "vee-market-language",
      newLanguage
    );

    document.documentElement.lang =
      newLanguage === "si"
        ? "si"
        : "en";
  }

  const translations =
    language === "si"
      ? si
      : en;

  /*
   * Keep the app stable while
   * localStorage is being checked.
   */
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(
      LanguageContext
    );

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}