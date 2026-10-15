"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../components/LanguageProvider";
import VeeHeader from "../../../components/VeeHeader";
import {
  Button,
  StatusBadge,
  EmptyState,
  ErrorBanner,
  Input,
} from "../../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface MoistureDevice {
  id: number;
  device_code: string;
  device_name?: string | null;
  notes?: string | null;
  status: "active" | "disabled" | string;
  last_seen_at?: string | null;
  calibration_version?: string | null;
  firmware_version?: string | null;
  created_at?: string | null;
}

interface ProvisionResult {
  device_code: string;
  secret: string;
  device_name?: string | null;
  warning: string;
}

export default function AdminDevicesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [devices, setDevices] = useState<MoistureDevice[]>([]);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Register modal & state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regDeviceCode, setRegDeviceCode] = useState("");
  const [regDeviceName, setRegDeviceName] = useState("");
  const [regNotes, setRegNotes] = useState("");
  const [registering, setRegistering] = useState(false);
  const [provisionResult, setProvisionResult] = useState<ProvisionResult | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Status updating & key rotation
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);
  const [confirmRotateCode, setConfirmRotateCode] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);

  // Details drawer
  const [selectedDevice, setSelectedDevice] = useState<MoistureDevice | null>(null);

  const t = useMemo(
    () => ({
      title: isSinhala ? "තෙතමන මාපක උපකරණ කළමනාකරණය" : "Moisture Meter Devices",
      subtitle: isSinhala
        ? "භෞතික ESP32 තෙතමන මාපක උපකරණ ලියාපදිංචි කිරීම, අක්තපත්‍ර නිකුත් කිරීම සහ තත්ත්වය කළමනාකරණය."
        : "Register physical ESP32 moisture meter hardware, provision cryptographically secure credentials, and manage device operational status.",
      tabUsers: isSinhala ? "පරිශීලකයින් සහ අනුමැතීන්" : "Users & Verifications",
      tabDevices: isSinhala ? "තෙතමන මාපක උපකරණ" : "Moisture Meter Devices",
      registerBtn: isSinhala ? "+ නව උපකරණයක් එක් කරන්න" : "+ Register Device",
      overview: {
        total: isSinhala ? "මුළු ලියාපදිංචි උපකරණ" : "Total Registered",
        active: isSinhala ? "ක්‍රියාකාරී උපකරණ" : "Active Devices",
        disabled: isSinhala ? "අක්‍රීය උපකරණ" : "Disabled Devices",
        seenRecently: isSinhala ? "සම්බන්ධ වූ උපකරණ" : "Tracked / Seen",
      },
      filters: {
        all: isSinhala ? "සියල්ල" : "All",
        active: isSinhala ? "ක්‍රියාකාරී" : "Active",
        disabled: isSinhala ? "අක්‍රීය" : "Disabled",
      },
      searchPlaceholder: isSinhala
        ? "උපකරණ කේතය හෝ නම සොයන්න..."
        : "Search by device ID, label, or firmware...",
      table: {
        deviceId: isSinhala ? "උපකරණ කේතය (Device ID)" : "Device ID",
        name: isSinhala ? "නම / ලේබලය" : "Device Label",
        status: isSinhala ? "තත්ත්වය" : "Status",
        firmware: isSinhala ? "මෘදුකාංග අනුවාදය" : "Firmware / Cal",
        lastSeen: isSinhala ? "අවසන් සම්බන්ධතාවය" : "Last Seen",
        registered: isSinhala ? "ලියාපදිංචි දිනය" : "Registered",
        actions: isSinhala ? "ක්‍රියාමාර්ග" : "Actions",
      },
      actions: {
        details: isSinhala ? "විස්තර" : "Details",
        enable: isSinhala ? "සක්‍රීය කරන්න" : "Enable",
        disable: isSinhala ? "අක්‍රීය කරන්න" : "Disable",
        rotateKey: isSinhala ? "යතුර අලුත් කරන්න (Rotate Key)" : "Rotate Key",
      },
      loadingText: isSinhala ? "උපකරණ ලබාගනිමින්..." : "Loading registered moisture meters...",
      errorText: isSinhala ? "උපකරණ තොරතුරු ලබාගැනීම අසාර්ථක විය." : "Failed to load devices.",
      emptyTitle: isSinhala ? "කිසිදු උපකරණයක් හමු නොවීය" : "No Devices Found",
      emptyDesc: isSinhala
        ? "තවමත් කිසිදු තෙතමන මාපකයක් ලියාපදිංචි කර නැත හෝ සෙවුමට ගැලපෙන උපකරණ නොමැත."
        : "No registered moisture meters matched your current filters.",
      registerModal: {
        title: isSinhala ? "භෞතික ESP32 උපකරණයක් ලියාපදිංචි කරන්න" : "Register ESP32 Moisture Meter",
        desc: isSinhala
          ? "භෞතික උපකරණය සඳහා අනන්‍ය Device ID ඇතුළත් කරන්න. සේවාදායකය විසින් ආරක්ෂිත රහස් යතුරක් (Secret Key) ලබාදෙනු ඇත."
          : "Register a physical meter unit. The backend provisions a unique 64-character secret key for ESP32 authentication.",
        codeLabel: isSinhala ? "උපකරණ කේතය (Device ID / Code)" : "Device ID / Code",
        codeHint: isSinhala ? "උදා: VM-0001 හෝ VM-ESP32-POLE-01" : "e.g., VM-0001, VM-ESP32-POLE-01",
        nameLabel: isSinhala ? "උපකරණයේ නම / ස්ථානය (විකල්ප)" : "Device Name / Unit Label (Optional)",
        nameHint: isSinhala ? "උදා: Field Pole #1 (Polonnaruwa)" : "e.g., Field Unit Pole #1 (Polonnaruwa Center)",
        notesLabel: isSinhala ? "සටහන් (විකල්ප)" : "Notes / Specifications (Optional)",
        notesHint: isSinhala ? "උදා: ESP32-D0WD-V3, 3-depth soil capacitive probe" : "e.g., ESP32-D0WD-V3 rice moisture pole with 3 depth zones",
        submitBtn: isSinhala ? "ලියාපදිංචි කර යතුර ලබාගන්න" : "Register & Issue Key",
        cancelBtn: isSinhala ? "අවලංගු කරන්න" : "Cancel",
      },
      secretModal: {
        title: isSinhala ? "⚠️ ආරක්ෂිත උපකරණ යතුර නිකුත් කෙරිණි" : "⚠️ Device Credentials Issued",
        warning: isSinhala
          ? "මෙම රහස් යතුර (Device Key) දිස්වන්නේ මෙම අවස්ථාවේදී පමණි! කරුණාකර එය ආරක්ෂිතව පිටපත් කර ඔබගේ භෞතික ESP32 මෘදුකාංගයට ඇතුළත් කරන්න. දත්ත ගබඩාවේ තැන්පත් වන්නේ මෙහි BCrypt හෑෂ් එක පමණි."
          : "This secret key is shown ONLY ONCE! Copy it now and store it in your physical ESP32 firmware config. The backend stores only the salted one-way hash.",
        copyBtn: isSinhala ? "යතුර පිටපත් කරන්න" : "Copy Secret Key",
        copied: isSinhala ? "පිටපත් විය!" : "Copied!",
        closeBtn: isSinhala ? "මම යතුර ආරක්ෂිතව පිටපත් කරගතිමි" : "I have safely copied the key",
      },
      rotateModal: {
        title: isSinhala ? "රහස් යතුර අලුත් කිරීම (Key Rotation)" : "Rotate Device Secret Key",
        warning: isSinhala
          ? "මෙමගින් පෙර පැවති රහස් යතුර වහාම අක්‍රීය වන අතර නව යතුරක් නිකුත් කරනු ලැබේ. ESP32 උපකරණය නැවත නව යතුරෙන් වින්‍යාස කරන තෙක් සත්‍යාපනය අසාර්ථක වනු ඇත."
          : "This will permanently invalidate the old device key and generate a fresh one. The ESP32 device will not be able to authenticate until flashed or configured with the new key.",
        confirmBtn: isSinhala ? "යතුර අලුත් කරන්න" : "Rotate Key Now",
        cancelBtn: isSinhala ? "අවලංගු කරන්න" : "Cancel",
      },
    }),
    [isSinhala]
  );

  function authHeaders(): Record<string, string> | null {
    const token =
      localStorage.getItem("vee-market-token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("vee_market_token");
    return token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        }
      : null;
  }

  async function loadDevices() {
    const headers = authHeaders();
    if (!headers) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/admin/devices`, {
        headers,
        cache: "no-store",
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("vee-market-token");
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!res.ok) throw new Error(t.errorText);

      const data = (await res.json()) as MoistureDevice[];
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regDeviceCode.trim()) return;

    const headers = authHeaders();
    if (!headers) return;

    try {
      setRegistering(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/admin/devices`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          device_code: regDeviceCode.trim(),
          device_name: regDeviceName.trim() || undefined,
          notes: regNotes.trim() || undefined,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error?.message || "Registration failed");
      }

      setProvisionResult({
        device_code: body.device_code,
        secret: body.secret,
        device_name: body.device_name,
        warning: body.warning,
      });

      setShowRegisterModal(false);
      setRegDeviceCode("");
      setRegDeviceName("");
      setRegNotes("");
      loadDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error registering device");
    } finally {
      setRegistering(false);
    }
  }

  async function toggleStatus(device: MoistureDevice) {
    const nextStatus = device.status.toLowerCase() === "active" ? "disabled" : "active";
    const headers = authHeaders();
    if (!headers) return;

    try {
      setUpdatingCode(device.device_code);
      setError(null);

      const res = await fetch(`${API_URL}/api/admin/devices/${encodeURIComponent(device.device_code)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: nextStatus }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error?.message || "Failed to update status");
      }

      setDevices((prev) =>
        prev.map((d) =>
          d.device_code === device.device_code ? { ...d, status: nextStatus } : d
        )
      );
      if (selectedDevice?.device_code === device.device_code) {
        setSelectedDevice((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }

      setNotification(`Device ${device.device_code} status set to ${nextStatus}.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change device status");
    } finally {
      setUpdatingCode(null);
    }
  }

  async function handleRotateKey() {
    if (!confirmRotateCode) return;
    const headers = authHeaders();
    if (!headers) return;

    try {
      setRotating(true);
      setError(null);

      const res = await fetch(
        `${API_URL}/api/admin/devices/${encodeURIComponent(confirmRotateCode)}/rotate-key`,
        {
          method: "POST",
          headers,
        }
      );

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error?.message || "Key rotation failed");
      }

      setProvisionResult({
        device_code: body.device_code,
        secret: body.secret,
        warning: body.warning,
      });

      setConfirmRotateCode(null);
      loadDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error rotating key");
    } finally {
      setRotating(false);
    }
  }

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      if (filter === "ACTIVE" && d.status.toLowerCase() !== "active") return false;
      if (filter === "DISABLED" && d.status.toLowerCase() !== "disabled") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          d.device_code.toLowerCase().includes(q) ||
          (d.device_name && d.device_name.toLowerCase().includes(q)) ||
          (d.firmware_version && d.firmware_version.toLowerCase().includes(q)) ||
          (d.notes && d.notes.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [devices, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = devices.length;
    const active = devices.filter((d) => d.status.toLowerCase() === "active").length;
    const disabled = devices.filter((d) => d.status.toLowerCase() === "disabled").length;
    const tracked = devices.filter((d) => !!d.last_seen_at).length;
    return { total, active, disabled, tracked };
  }, [devices]);

  function formatDate(iso?: string | null) {
    if (!iso) return "—";
    try {
      const dt = new Date(iso);
      return dt.toLocaleString();
    } catch {
      return iso;
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge="Admin" roleType="ADMIN" />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* TOP BAR / NAVIGATION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* ADMIN SUB-NAV */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shrink-0">
              <Link
                href="/dashboard/admin"
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                👥 {t.tabUsers}
              </Link>
              <Link
                href="/dashboard/admin/devices"
                className="rounded-xl px-4 py-2 text-xs font-bold bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
              >
                📟 {t.tabDevices}
              </Link>
            </div>

            <Button
              onClick={() => {
                setRegDeviceCode(`VM-${String(devices.length + 1).padStart(4, "0")}`);
                setShowRegisterModal(true);
              }}
              variant="primary"
              size="sm"
              className="font-bold shadow-sm"
            >
              {t.registerBtn}
            </Button>
          </div>
        </div>

        {error && <ErrorBanner message={error} onRetry={loadDevices} />}

        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ {notification}
          </div>
        )}

        {/* OVERVIEW STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.overview.total}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats.total}
              </span>
              <span className="text-xs font-bold text-slate-400">units</span>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {t.overview.active}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {stats.active}
              </span>
              <span className="text-xs font-bold text-emerald-600/70">ready</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {t.overview.disabled}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-700 dark:text-amber-300">
                {stats.disabled}
              </span>
              <span className="text-xs font-bold text-slate-400">offline</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              {t.overview.seenRecently}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">
                {stats.tracked}
              </span>
              <span className="text-xs font-bold text-slate-400">verified</span>
            </div>
          </div>
        </div>

        {/* CONTROLS & FILTER */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
            {(["ALL", "ACTIVE", "DISABLED"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilter(m)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap select-none ${
                  filter === m
                    ? "bg-[#087f3f] text-white shadow-sm dark:bg-emerald-600"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {t.filters[m.toLowerCase() as keyof typeof t.filters] || m}
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* DEVICE TABLE */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold">{t.loadingText}</p>
          </div>
        ) : filteredDevices.length === 0 ? (
          <EmptyState
            title={t.emptyTitle}
            description={t.emptyDesc}
            icon="📟"
            actionLabel={t.registerBtn}
            onAction={() => {
              setRegDeviceCode(`VM-${String(devices.length + 1).padStart(4, "0")}`);
              setShowRegisterModal(true);
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">{t.table.deviceId}</th>
                    <th className="px-5 py-3.5">{t.table.name}</th>
                    <th className="px-5 py-3.5">{t.table.status}</th>
                    <th className="px-5 py-3.5">{t.table.firmware}</th>
                    <th className="px-5 py-3.5">{t.table.lastSeen}</th>
                    <th className="px-5 py-3.5">{t.table.registered}</th>
                    <th className="px-5 py-3.5 text-right">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDevices.map((d) => {
                    const isActive = d.status.toLowerCase() === "active";
                    return (
                      <tr
                        key={d.id}
                        className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                          <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300">
                            {d.device_code}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                          {d.device_name || <span className="text-slate-400 italic">No label</span>}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge
                            status={isActive ? "ACTIVE" : "DISABLED"}
                            size="sm"
                          />
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {d.firmware_version ? (
                            <span>{d.firmware_version} {d.calibration_version ? `(${d.calibration_version})` : ""}</span>
                          ) : (
                            <span className="text-slate-400 italic">Not connected yet</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          {d.last_seen_at ? (
                            formatDate(d.last_seen_at)
                          ) : (
                            <span className="text-slate-400 italic">Never connected</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          {formatDate(d.created_at)}
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDevice(d)}
                            className="text-xs"
                          >
                            ℹ️ {t.actions.details}
                          </Button>

                          <Button
                            variant={isActive ? "outline" : "primary"}
                            size="sm"
                            loading={updatingCode === d.device_code}
                            onClick={() => toggleStatus(d)}
                            className={isActive ? "border-amber-300 text-amber-700 hover:bg-amber-50" : ""}
                          >
                            {isActive ? t.actions.disable : t.actions.enable}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmRotateCode(d.device_code)}
                            className="text-xs border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                          >
                            🔑 {t.actions.rotateKey}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* REGISTER DEVICE MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t.registerModal.title}
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {t.registerModal.desc}
            </p>

            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <Input
                label={t.registerModal.codeLabel}
                required
                value={regDeviceCode}
                onChange={(e) => setRegDeviceCode(e.target.value)}
                hint={t.registerModal.codeHint}
                placeholder="VM-0001"
              />

              <Input
                label={t.registerModal.nameLabel}
                value={regDeviceName}
                onChange={(e) => setRegDeviceName(e.target.value)}
                hint={t.registerModal.nameHint}
                placeholder="Field Moisture Meter Unit 1"
              />

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.registerModal.notesLabel}
                </label>
                <textarea
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  placeholder={t.registerModal.notesHint}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm font-medium focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  disabled={registering}
                  onClick={() => setShowRegisterModal(false)}
                >
                  {t.registerModal.cancelBtn}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={registering}
                >
                  {t.registerModal.submitBtn}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONE-TIME SECRET CREDENTIAL MODAL */}
      {provisionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl border border-amber-300 bg-white p-6 shadow-2xl dark:border-amber-700/60 dark:bg-slate-900 space-y-5">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🔐</span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t.secretModal.title}
                </h2>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/50 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60">
                  {t.secretModal.warning}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 font-mono text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Header: X-Device-Id
                </span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 select-all">
                  {provisionResult.device_code}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Header: X-Device-Key (64-char Hex Secret)
                </span>
                <div className="mt-1 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 break-all text-xs font-bold text-slate-900 dark:text-white select-all">
                  {provisionResult.secret}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  navigator.clipboard.writeText(provisionResult.secret);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2500);
                }}
                className="w-full sm:w-auto font-bold border-emerald-300 text-emerald-800 dark:text-emerald-300"
              >
                {copiedKey ? `✓ ${t.secretModal.copied}` : `📋 ${t.secretModal.copyBtn}`}
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => setProvisionResult(null)}
                className="w-full sm:w-auto font-bold"
              >
                {t.secretModal.closeBtn}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM ROTATE KEY MODAL */}
      {confirmRotateCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900/60 dark:bg-slate-900 space-y-4">
            <h2 className="text-lg font-extrabold text-red-600 dark:text-red-400">
              ⚠️ {t.rotateModal.title} ({confirmRotateCode})
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t.rotateModal.warning}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                size="md"
                disabled={rotating}
                onClick={() => setConfirmRotateCode(null)}
              >
                {t.rotateModal.cancelBtn}
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={rotating}
                onClick={handleRotateKey}
              >
                {t.rotateModal.confirmBtn}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DEVICE DETAILS DRAWER */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Hardware Moisture Meter Unit
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {selectedDevice.device_code}
                </h2>
              </div>
              <StatusBadge
                status={selectedDevice.status.toUpperCase()}
                size="md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                <span className="text-slate-400 block font-semibold">Unit Label</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedDevice.device_name || "None"}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                <span className="text-slate-400 block font-semibold">Firmware Reported</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {selectedDevice.firmware_version || "Not reported yet"}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                <span className="text-slate-400 block font-semibold">Calibration Version</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {selectedDevice.calibration_version || "Not reported yet"}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                <span className="text-slate-400 block font-semibold">Last Contact / Polled</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDate(selectedDevice.last_seen_at)}
                </span>
              </div>
            </div>

            {selectedDevice.notes && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 text-xs">
                <span className="text-slate-400 block font-semibold mb-1">Administrative Notes</span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedDevice.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmRotateCode(selectedDevice.device_code);
                  setSelectedDevice(null);
                }}
                className="text-xs"
              >
                🔑 Rotate Key
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedDevice(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
