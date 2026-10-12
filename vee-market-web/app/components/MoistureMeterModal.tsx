"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("vee-market-token") ||
    localStorage.getItem("token") ||
    null
  );
}

export interface DeviceReadingResult {
  moisture_pct: number;
  zones: {
    top: number;
    middle: number;
    bottom: number;
  };
  spread_pct: number;
  temp_c: number | null;
  calibration_version: string;
  received_at: string;
  label: string;
}

interface MoistureMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotId: number;
  lotCode?: string;
  onTestComplete: (reading: DeviceReadingResult) => void;
  isSinhala: boolean;
}

type ModalState =
  | "SCAN"
  | "STARTING"
  | "POLLING"
  | "DONE"
  | "EXPIRED"
  | "CANCELLED"
  | "ERROR";

export default function MoistureMeterModal({
  isOpen,
  onClose,
  lotId,
  lotCode,
  onTestComplete,
  isSinhala,
}: MoistureMeterModalProps) {
  const [deviceCode, setDeviceCode] = useState("VM-0001");
  const [modalState, setModalState] = useState<ModalState>("SCAN");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(300);
  const [readingResult, setReadingResult] = useState<DeviceReadingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scannerContainerId = "moisture-qr-reader-container";

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setModalState("SCAN");
      setSessionId(null);
      setExpiresAt(null);
      setTimeLeftSec(300);
      setReadingResult(null);
      setErrorMessage(null);
      setCameraActive(false);
      setCameraError(null);
    } else {
      stopCamera();
      stopPolling();
      stopCountdown();
    }
    return () => {
      stopCamera();
      stopPolling();
      stopCountdown();
    };
  }, [isOpen]);

  // Clean up timers on unmount
  function stopPolling() {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  function stopCountdown() {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }

  // Camera handling
  async function startCamera() {
    setCameraError(null);
    setCameraActive(true);

    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras().catch(() => []);
        const cameraId =
          cameras.length > 0
            ? cameras.find(
                (c) =>
                  c.label.toLowerCase().includes("back") ||
                  c.label.toLowerCase().includes("rear") ||
                  c.label.toLowerCase().includes("environment")
              )?.id || cameras[0].id
            : { facingMode: "environment" };

        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            const parsedCode = cleanDeviceCode(decodedText);
            setDeviceCode(parsedCode);
            stopCamera();
          },
          () => {}
        );
      } catch (err: any) {
        console.warn("Camera start failed:", err);
        setCameraError(
          err.message ||
            (isSinhala
              ? "කැමරා අවසරය ලබාගත නොහැකි විය. කරුණාකර උපාංග අංකය පහතින් ඇතුළත් කරන්න."
              : "Camera access unavailable. Please enter the Device ID manually below.")
        );
        setCameraActive(false);
      }
    }, 150);
  }

  function stopCamera() {
    if (scannerRef.current) {
      if (
        scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING ||
        scannerRef.current.getState() === Html5QrcodeScannerState.PAUSED
      ) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
            setCameraActive(false);
          });
      } else {
        scannerRef.current = null;
        setCameraActive(false);
      }
    } else {
      setCameraActive(false);
    }
  }

  function cleanDeviceCode(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        const code = parsed.device_id || parsed.deviceId || parsed.id || parsed.deviceCode;
        if (code) return String(code).trim();
      } catch {}
    }
    if (trimmed.includes("veemeter://") || trimmed.includes("http")) {
      try {
        const url = new URL(trimmed);
        const id = url.searchParams.get("device") || url.searchParams.get("id") || url.pathname.replace(/^\//, "");
        if (id) return id.trim();
      } catch {}
    }
    return trimmed;
  }

  // START TEST REQUEST
  async function handleStartTest() {
    const code = deviceCode.trim();
    if (!code) {
      setErrorMessage(
        isSinhala ? "කරුණාකර වලංගු උපාංග අංකයක් ඇතුළත් කරන්න." : "Please enter a valid Device ID."
      );
      return;
    }

    const token = getToken();
    if (!token) {
      setErrorMessage(
        isSinhala ? "කරුණාකර පළමුව පද්ධතියට ලොග් වන්න." : "Please log in to start a moisture test."
      );
      return;
    }

    setModalState("STARTING");
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/tests/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          device_id: code,
          lot_id: lotId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const codeErr = data?.error?.code;
        const msgErr = data?.error?.message;

        if (codeErr === "device_busy") {
          throw new Error(
            isSinhala
              ? `උපාංගය (${code}) දැනට වෙනත් පරීක්ෂණයක් සඳහා භාවිතා වේ. කරුණාකර මඳ වේලාවකින් නැවත උත්සාහ කරන්න.`
              : `Device (${code}) is currently busy with another test. Please wait a moment and try again.`
          );
        } else if (codeErr === "device_disabled") {
          throw new Error(
            isSinhala
              ? `මෙම උපාංගය (${code}) අක්‍රිය කර ඇත. කරුණාකර පරිපාලක අමතන්න.`
              : `This device (${code}) has been disabled. Please contact the administrator.`
          );
        } else if (codeErr === "device_unknown") {
          throw new Error(
            isSinhala
              ? `හඳුනා නොගත් උපාංග අංකයකි: ${code}. QR කේතය පරීක්ෂා කරන්න.`
              : `Unknown device ID: ${code}. Please verify the QR code on the meter.`
          );
        } else {
          throw new Error(msgErr || `Failed to start test (${res.status})`);
        }
      }

      setSessionId(data.session_id);
      setExpiresAt(data.expires_at);
      setModalState("POLLING");

      // Start Countdown
      let secondsLeft = 300;
      setTimeLeftSec(secondsLeft);
      countdownTimerRef.current = setInterval(() => {
        secondsLeft -= 1;
        setTimeLeftSec(Math.max(0, secondsLeft));
        if (secondsLeft <= 0) {
          stopCountdown();
          stopPolling();
          setModalState("EXPIRED");
        }
      }, 1000);

      // Start Polling every 2 seconds
      pollTimerRef.current = setInterval(() => {
        pollSessionStatus(data.session_id, token);
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start test session");
      setModalState("ERROR");
    }
  }

  // POLL SESSION STATUS
  async function pollSessionStatus(sid: number, token: string) {
    try {
      const res = await fetch(`${API_URL}/api/tests/${sid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.status === "done" && data.reading) {
        stopPolling();
        stopCountdown();
        setReadingResult(data.reading);
        setModalState("DONE");
        onTestComplete(data.reading);
      } else if (data.status === "expired") {
        stopPolling();
        stopCountdown();
        setModalState("EXPIRED");
      } else if (data.status === "cancelled") {
        stopPolling();
        stopCountdown();
        setModalState("CANCELLED");
      }
    } catch (err) {
      console.warn("Poll test status error:", err);
    }
  }

  // CANCEL TEST SESSION
  async function handleCancelTest() {
    if (!sessionId) return;
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/tests/${sessionId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      stopPolling();
      stopCountdown();
      setModalState("CANCELLED");
    } catch (err) {
      console.warn("Cancel test error:", err);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-2xl dark:bg-emerald-950/50">
              🌾
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isSinhala ? "ඩිජිටල් තෙතමන මාන සම්බන්ධතාව" : "Digital Moisture Meter"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lotCode ? `Lot: ${lotCode}` : `Lot ID: #${lotId}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* ========================================================
            STEP: SCAN / MANUAL ENTRY
        ======================================================== */}
        {modalState === "SCAN" && (
          <div className="space-y-5">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {isSinhala
                ? "ඔබගේ ඩිජිටල් වී තෙතමන මානයේ QR කේතය ස්කෑන් කරන්න හෝ උපාංග අංකය (Device ID) පහතින් ඇතුළත් කරන්න."
                : "Scan the QR code on your digital moisture meter or enter the Device ID manually below."}
            </p>

            {/* Camera Viewport */}
            {cameraActive ? (
              <div className="overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-black p-2">
                <div id={scannerContainerId} className="h-64 w-full" />
                <button
                  type="button"
                  onClick={stopCamera}
                  className="mt-2 w-full rounded-xl bg-slate-800 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  {isSinhala ? "කැමරාව නවත්වන්න" : "Close Camera"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-emerald-400/60 bg-emerald-50/50 py-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100/50 dark:border-emerald-600/40 dark:bg-emerald-950/20 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                <span className="text-xl">📷</span>
                <span>{isSinhala ? "QR කේතය ස්කෑන් කරන්න" : "Scan QR Code"}</span>
              </button>
            )}

            {cameraError && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                {cameraError}
              </p>
            )}

            {/* Manual Device Code Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {isSinhala ? "උපාංග අංකය (Device ID)" : "Device Identifier"}
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. VM-0001"
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {isSinhala
                  ? "උපාංගය මත මුද්‍රණය කර ඇති අංකය (උදා: VM-0001)"
                  : "Matches the device code on the hardware label (e.g. VM-0001)"}
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                {errorMessage}
              </div>
            )}

            {/* Start Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {isSinhala ? "අවලංගු කරන්න" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleStartTest}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
              >
                {isSinhala ? "පරීක්ෂාව ආරම්භ කරන්න" : "Start Moisture Test"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP: STARTING / INITIALIZING
        ======================================================== */}
        {modalState === "STARTING" && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {isSinhala ? "සම්බන්ධතාව ආරම්භ කරමින්..." : "Connecting to Meter..."}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              {isSinhala
                ? "උපාංගය සහ වී තොගය සත්‍යාපනය කරමින් පවතී"
                : "Validating device and preparing measurement session"}
            </p>
          </div>
        )}

        {/* ========================================================
            STEP: POLLING / WAITING FOR METER
        ======================================================== */}
        {modalState === "POLLING" && (
          <div className="space-y-6 py-2">
            {/* Visual Radar / Probe Animation */}
            <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="absolute inset-4 animate-pulse rounded-full bg-emerald-500/30" />
              <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl">
                <span className="text-3xl">📡</span>
                <span className="mt-1 font-mono text-[11px] font-bold tracking-tight">
                  {formatTime(timeLeftSec)}
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
                <span>{isSinhala ? "මිනුම ලබාගැනීමට සූදානම්" : "Ready for Measurement"}</span>
              </div>
              <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {isSinhala ? "මිනුම් උපකරණය ක්‍රියාත්මක කරන්න" : "Insert Meter Probe & Press Button"}
              </h4>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                {isSinhala
                  ? "උපකරණයේ ලෝහ කූර වී මිටිය තුළට ගිල්වා එහි ඇති පරීක්ෂණ බොත්තම ඔබන්න. මිනුම ස්වයංක්‍රීයව Wi-Fi හරහා මෙහි දිස්වනු ඇත."
                  : "Insert the probe into the paddy sack and press the measurement button on the meter. Readings sync automatically over Wi-Fi."}
              </p>
            </div>

            {/* Session Info Bar */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-xs dark:bg-slate-800/60">
              <div>
                <span className="text-slate-400">{isSinhala ? "උපාංගය: " : "Device: "}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {deviceCode}
                </span>
              </div>
              <div>
                <span className="text-slate-400">{isSinhala ? "සැසිය: " : "Session: "}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  #{sessionId}
                </span>
              </div>
              <div>
                <span className="text-slate-400">{isSinhala ? "ඉතිරි කාලය: " : "Expiry: "}</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatTime(timeLeftSec)}
                </span>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleCancelTest}
                className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
              >
                {isSinhala ? "පරීක්ෂාව අවලංගු කරන්න" : "Cancel Test Session"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP: DONE / READING RECEIVED
        ======================================================== */}
        {modalState === "DONE" && readingResult && (
          <div className="space-y-6">
            <div className="text-center">
              {/* Mandatory Official Label: Device reading (never Verified) */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span>✓</span>
                <span>{readingResult.label || "Device reading"}</span>
              </div>

              {/* Main Moisture Percentage */}
              <div className="mt-3 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-slate-900 dark:text-white">
                  {Number(readingResult.moisture_pct).toFixed(1)}
                </span>
                <span className="text-2xl font-bold text-emerald-600">%</span>
              </div>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                {readingResult.moisture_pct <= 14.0
                  ? isSinhala
                    ? "ප්‍රශස්ත වියළි තත්ත්වය (ගබඩා කිරීමට සුදුසුයි)"
                    : "Optimal Dry Level (Safe for storage & milling)"
                  : isSinhala
                    ? "තෙතමනය ඉහළයි (තවදුරටත් වේලීම නිර්දේශිතයි)"
                    : "High Moisture (Further drying recommended)"}
              </p>
            </div>

            {/* 3-Zone Probe Readings */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isSinhala ? "කලාප මට්ටම් 3 ක මිනුම් (3-Zone Analysis)" : "3-Zone Bag Penetration Readings"}
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-slate-900">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {isSinhala ? "ඉහළ" : "Top"}
                  </span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {Number(readingResult.zones.top).toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-slate-900">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {isSinhala ? "මැද" : "Middle"}
                  </span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {Number(readingResult.zones.middle).toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-slate-900">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {isSinhala ? "පහළ" : "Bottom"}
                  </span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {Number(readingResult.zones.bottom).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Spread, Temperature, Calibration Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                <span className="text-slate-400">{isSinhala ? "විචලනය (Spread):" : "Moisture Spread:"}</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {Number(readingResult.spread_pct).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                <span className="text-slate-400">{isSinhala ? "උෂ්ණත්වය:" : "Temperature:"}</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {readingResult.temp_c !== null ? `${Number(readingResult.temp_c).toFixed(1)}°C` : "N/A"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                <span className="text-slate-400">{isSinhala ? "ක්‍රමාංකනය:" : "Calibration:"}</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {readingResult.calibration_version}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                <span className="text-slate-400">{isSinhala ? "වේලාව:" : "Received At:"}</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(readingResult.received_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalState("SCAN")}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {isSinhala ? "තවත් පරීක්ෂණයක්" : "New Test"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
              >
                {isSinhala ? "අවසන් කරන්න" : "Done"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP: EXPIRED
        ======================================================== */}
        {modalState === "EXPIRED" && (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl dark:bg-amber-950/40">
              ⏱️
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {isSinhala ? "පරීක්ෂණ කාලය අවසන් විය" : "Test Session Expired"}
            </h4>
            <p className="mx-auto max-w-sm text-xs leading-5 text-slate-500">
              {isSinhala
                ? "මිනිත්තු 5 ක කාලය තුළ උපාංගයෙන් මිනුමක් නොලැබුණි. උපකරණය වෙනත් පරීක්ෂණ සඳහා නිදහස් කර ඇත."
                : "No measurement was submitted within the 5-minute timeout window. The meter has been released back to idle."}
            </p>
            <div className="flex justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                {isSinhala ? "වසන්න" : "Close"}
              </button>
              <button
                type="button"
                onClick={() => setModalState("SCAN")}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {isSinhala ? "නැවත උත්සාහ කරන්න" : "Retry Test"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP: CANCELLED
        ======================================================== */}
        {modalState === "CANCELLED" && (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
              🚫
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {isSinhala ? "පරීක්ෂාව අවලංගු කරන ලදී" : "Test Cancelled"}
            </h4>
            <p className="text-xs text-slate-500">
              {isSinhala
                ? "උපාංගය සාර්ථකව නිදහස් කර ඇත."
                : "The test session was cancelled and the meter has been released."}
            </p>
            <div className="flex justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                {isSinhala ? "වසන්න" : "Close"}
              </button>
              <button
                type="button"
                onClick={() => setModalState("SCAN")}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {isSinhala ? "නව පරීක්ෂණයක්" : "Start New Test"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP: ERROR
        ======================================================== */}
        {modalState === "ERROR" && (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl dark:bg-rose-950/40">
              ⚠️
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {isSinhala ? "දෝෂයක් සිදුවිය" : "Connection Error"}
            </h4>
            <p className="mx-auto max-w-sm rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
              {errorMessage}
            </p>
            <div className="flex justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                {isSinhala ? "වසන්න" : "Close"}
              </button>
              <button
                type="button"
                onClick={() => setModalState("SCAN")}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {isSinhala ? "නැවත උත්සාහ කරන්න" : "Try Again"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
