"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  isSinhala: boolean;
}

export default function QRScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  isSinhala,
}: QRScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader-container";

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    setCameraError(null);
    let mounted = true;

    // Small delay to allow modal DOM rendering
    const timer = setTimeout(async () => {
      try {
        if (!mounted) return;
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras().catch(() => []);
        const cameraId =
          cameras.length > 0
            ? cameras.find((c) =>
                c.label.toLowerCase().includes("back") ||
                c.label.toLowerCase().includes("rear") ||
                c.label.toLowerCase().includes("environment")
              )?.id || cameras[0].id
            : { facingMode: "environment" };

        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success callback
            html5QrCode.stop().then(() => {
              onScanSuccess(decodedText);
              onClose();
            });
          },
          () => {
            // Ignore scan frame misses
          }
        );

        if (mounted) {
          setScanning(true);
        }
      } catch (err: any) {
        console.warn("Camera start error:", err);
        if (mounted) {
          setCameraError(
            err.message ||
              (isSinhala
                ? "කැමරාව ආරම්භ කිරීමට නොහැකි විය. කරුණාකර අවසර පරීක්ෂා කරන්න හෝ පහතින් අංකය ඇතුළත් කරන්න."
                : "Unable to access camera. Please check permissions or enter QR payload manually below.")
          );
        }
      }
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerRef.current) {
      if (
        scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING ||
        scannerRef.current.getState() === Html5QrcodeScannerState.PAUSED
      ) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current = null;
        });
      } else {
        scannerRef.current = null;
      }
    }
    setScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    stopScanner();
    onScanSuccess(manualInput.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isSinhala ? "තෙතමන මාපකයේ QR කේතය ස්කෑන් කරන්න" : "Scan Meter QR Code"}
            </h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          {isSinhala
            ? "භෞතික තෙතමන මාපකයේ මුද්‍රණය කර ඇති QR කේතය කැමරාව ඉදිරියට තබන්න."
            : "Point your camera at the QR code printed on the physical moisture meter."}
        </p>

        {/* Video Scanner Container */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800">
          <div id={scannerContainerId} className="w-full min-h-[280px]" />
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-4 text-center">
              <span className="text-3xl mb-2">📷⚠️</span>
              <p className="text-xs text-red-300 font-medium">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Manual Fallback Entry */}
        <form onSubmit={handleManualSubmit} className="mt-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-semibold text-slate-400 uppercase">
              {isSinhala ? "හෝ අතින් ඇතුළත් කරන්න" : "or enter manually"}
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={
                isSinhala
                  ? 'උදා: VM-METER-001 හෝ {"deviceId":"VM-01"}'
                  : 'e.g. VM-METER-001 or {"deviceId":"VM-01"}'
              }
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSinhala ? "යොදන්න" : "Apply"}
            </button>
          </div>
        </form>

        {/* Quick Demo Simulator Helper */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {isSinhala ? "පරීක්ෂා කිරීම සඳහා:" : "For testing / demo:"}
          </span>
          <button
            type="button"
            onClick={() => {
              onScanSuccess('{"deviceId":"VM-ESP32-METER-01","ip":"192.168.4.1","port":80,"ssid":"VeeMeter-01"}');
              stopScanner();
              onClose();
            }}
            className="text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {isSinhala ? "නියැදි QR භාවිතා කරන්න (VM-ESP32)" : "Use Sample QR (VM-ESP32)"}
          </button>
        </div>
      </div>
    </div>
  );
}
