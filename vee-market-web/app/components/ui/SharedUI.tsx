"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100";

  const sizeStyles = {
    sm: "min-h-[38px] px-3.5 py-1.5 text-xs gap-1.5",
    md: "min-h-[46px] px-4 py-2.5 text-sm gap-2",
    lg: "min-h-[52px] px-6 py-3.5 text-base gap-2.5",
  }[size];

  const variantStyles = {
    primary:
      "bg-[#087f3f] text-white hover:bg-[#066a34] shadow-sm active:bg-[#05572b] dark:bg-emerald-600 dark:hover:bg-emerald-500",
    secondary:
      "bg-emerald-50 text-[#087f3f] hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60",
    outline:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-700 dark:hover:bg-red-600",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
  }[variant];

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixText?: string;
  suffixText?: string;
}

export function Input({
  label,
  error,
  hint,
  prefixText,
  suffixText,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixText && (
          <span className="absolute left-3.5 select-none text-xs font-semibold text-slate-400 dark:text-slate-500">
            {prefixText}
          </span>
        )}
        <input
          id={inputId}
          className={`min-h-[46px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 ${
            prefixText ? "pl-11" : ""
          } ${suffixText ? "pr-14" : ""} ${
            error
              ? "border-red-400 focus:border-red-500 dark:border-red-600"
              : "border-slate-200 focus:border-emerald-600 dark:border-slate-700"
          } ${className}`}
          {...props}
        />
        {suffixText && (
          <span className="absolute right-3.5 select-none text-xs font-semibold text-slate-400 dark:text-slate-500">
            {suffixText}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: { value: string | number; label: string }[];
}

export function Select({
  label,
  error,
  hint,
  options,
  children,
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`min-h-[46px] w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
            error
              ? "border-red-400 focus:border-red-500 dark:border-red-600"
              : "border-slate-200 focus:border-emerald-600 dark:border-slate-700"
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function StatusBadge({
  status,
  label,
  size = "md",
}: {
  status: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const norm = (status || "").toUpperCase();

  const styles = (() => {
    switch (norm) {
      case "ACTIVE":
      case "VERIFIED":
      case "ACCEPTED":
      case "PAID":
      case "DELIVERED":
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60";
      case "PENDING":
      case "IN_TRANSIT":
      case "PROCESSING":
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60";
      case "SOLD":
      case "CONFIRMED":
        return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60";
      case "REJECTED":
      case "WITHDRAWN":
      case "CANCELLED":
      case "FAILED":
        return "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  })();

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold ${sizeClass} ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label || status}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "🌾",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60 sm:p-12">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl dark:bg-emerald-950/50">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} variant="primary" size="md">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ErrorBanner({
  message,
  onRetry,
  retryLabel = "Retry",
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/40 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
