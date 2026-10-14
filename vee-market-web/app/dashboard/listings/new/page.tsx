"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../../components/LanguageProvider";
import VeeHeader from "../../../components/VeeHeader";
import { Button, Input, Select, ErrorBanner } from "../../../components/ui/SharedUI";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Farm = {
  id: number;
  farmName: string;
  location?: string;
  landSize?: number;
  mainCrop?: string;
};

export default function NewPaddyLotPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isSinhala = language === "si";

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    farmId: "",
    productType: "PADDY",
    riceType: "NADU",
    quantityKg: "",
    askingPricePerKg: "",
    availableDate: new Date().toISOString().split("T")[0],
  });

  const t = useMemo(
    () => ({
      title: isSinhala ? "නව වී තොගයක් එකතු කරන්න" : "Add New Paddy Lot",
      subtitle: isSinhala
        ? "ඔබේ අස්වැන්න පිළිබඳ නිවැරදි විස්තර ඇතුළත් කර සහල් මෝල් වෙතින් තරගකාරී මිල ගණන් ලබාගන්න."
        : "Enter accurate harvest details so certified rice mills can discover and bid on your lot.",
      back: isSinhala ? "← මගේ වී තොග වෙත" : "← Back to My Lots",
      farmSection: isSinhala ? "ගොවිපළ තෝරන්න" : "Select Farm",
      farmSelectLabel: isSinhala ? "අදාළ ගොවිපළ" : "Associated Farm",
      selectFarmPlaceholder: isSinhala ? "-- ඔබේ ගොවිපළ තෝරන්න --" : "-- Select your farm --",
      noFarmsTitle: isSinhala ? "ඔබට තවමත් ගොවිපළක් නැත" : "No Registered Farms Found",
      noFarmsDesc: isSinhala
        ? "වී තොගයක් එකතු කිරීමට පෙර ඔබේ ගොවිපළ පළමුව ලියාපදිංචි කළ යුතුය."
        : "You need to add at least one farm before creating a paddy lot.",
      createFarmBtn: isSinhala ? "+ ගොවිපළක් සාදන්න" : "+ Add a Farm First",
      cropDetails: isSinhala ? "බෝග හා ප්‍රමාණ විස්තර" : "Paddy & Volume Specifications",
      productType: isSinhala ? "නිෂ්පාදන වර්ගය" : "Product Type",
      riceType: isSinhala ? "වී වර්ගය" : "Rice Variety",
      quantity: isSinhala ? "ප්‍රමාණය (කිලෝග්‍රෑම්)" : "Quantity (kg)",
      quantityPlaceholder: isSinhala ? "උදා: 2500" : "e.g. 2500",
      pricingSection: isSinhala ? "මිල සහ දිනය" : "Pricing & Availability",
      askingPrice: isSinhala ? "ඉල්ලුම් මිල / කිලෝග්‍රෑම් (LKR)" : "Asking Price / kg (LKR)",
      pricePlaceholder: isSinhala ? "උදා: 120.00" : "e.g. 120.00",
      availableDate: isSinhala ? "ලබාගත හැකි දිනය" : "Available Date",
      submitBtn: isSinhala ? "වී තොගය සාදන්න" : "Create Paddy Lot",
      submittingBtn: isSinhala ? "සුරකිමින් පවතී..." : "Creating Paddy Lot...",
      successMsg: isSinhala
        ? "වී තොගය සාර්ථකව සාදන ලදී! විස්තර පිටුවට යොමු කෙරේ..."
        : "Paddy lot created successfully! Redirecting...",
      validationError: isSinhala
        ? "කරුණාකර අවශ්‍ය සියලුම තොරතුරු නිවැරදිව පුරවන්න."
        : "Please complete all required fields with valid values.",
      moistureNoticeTitle: isSinhala
        ? "💡 තෙතමන පරීක්ෂාව පිළිබඳ සටහන"
        : "💡 Moisture Testing Note",
      moistureNoticeDesc: isSinhala
        ? "තොගය සෑදීමෙන් පසුව, ඔබට ස්මාර්ට් IoT තෙතමන මාපකය මඟින් සෘජුවම නිවැරදි මිනුම ඇතුළත් කළ හැක."
        : "After creating this lot, you can conduct a verified IoT moisture test directly on the lot details screen.",
      kg: "kg",
    }),
    [isSinhala]
  );

  useEffect(() => {
    async function loadFarms() {
      const token =
        localStorage.getItem("vee-market-token") ||
        localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        setLoadingFarms(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/farmer/farms`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(isSinhala ? "ගොවිපළ තොරතුරු ලබාගත නොහැකි විය." : "Failed to load farms.");
        }

        const data = await res.json();
        const farmList = Array.isArray(data) ? data : data?.content || [];
        setFarms(farmList);

        // Pre-select first farm if available
        if (farmList.length > 0) {
          setForm((prev) => ({ ...prev, farmId: String(farmList[0].id) }));
        }
      } catch (err) {
        console.error("Load farms error:", err);
        setError(err instanceof Error ? err.message : "Error loading farms");
      } finally {
        setLoadingFarms(false);
      }
    }

    loadFarms();
  }, [router, isSinhala]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const farmId = Number(form.farmId);
    const quantity = Number(form.quantityKg);
    const price = Number(form.askingPricePerKg);

    if (!farmId || !quantity || quantity <= 0 || !price || price <= 0 || !form.availableDate) {
      setError(t.validationError);
      return;
    }

    const token =
      localStorage.getItem("vee-market-token") || localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        farmId,
        productType: form.productType,
        riceType: form.riceType,
        quantityKg: quantity,
        askingPricePerKg: price,
        availableDate: form.availableDate,
      };

      const res = await fetch(`${API_URL}/api/farmer/lots`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || (isSinhala ? "වී තොගය සෑදීමට නොහැකි විය." : "Failed to create lot.")
        );
      }

      setSuccess(t.successMsg);

      const createdId = data?.id;
      setTimeout(() => {
        if (createdId) {
          router.push(`/dashboard/listings/${createdId}`);
        } else {
          router.push("/dashboard/listings");
        }
      }, 800);
    } catch (err) {
      console.error("Create lot error:", err);
      setError(err instanceof Error ? err.message : "Error creating lot");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <VeeHeader roleBadge={isSinhala ? "නව තොගය" : "New Lot"} roleType="FARMER" />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <div>
          <Link
            href="/dashboard/listings"
            className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {t.back}
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        {error && <ErrorBanner message={error} />}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ {success}
          </div>
        )}

        {loadingFarms ? (
          <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="font-semibold">{isSinhala ? "ගොවිපළ තොරතුරු ලබාගනිමින්..." : "Loading farm data..."}</p>
          </div>
        ) : farms.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50/60 p-8 text-center dark:border-amber-800 dark:bg-amber-950/30 space-y-4">
            <span className="text-4xl">🏡</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.noFarmsTitle}
            </h2>
            <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t.noFarmsDesc}
            </p>
            <div>
              <Link href="/dashboard/farms/new">
                <Button variant="primary" size="lg">
                  {t.createFarmBtn}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {/* FARM SELECTION */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                1. {t.farmSection}
              </h2>
              <Select
                label={t.farmSelectLabel}
                required
                value={form.farmId}
                onChange={(e) => setForm({ ...form, farmId: e.target.value })}
                options={farms.map((f) => ({
                  value: f.id,
                  label: `${f.farmName} (${f.location || "Farm"} - ${f.landSize || 0} acres)`,
                }))}
              />
            </div>

            {/* CROP DETAILS */}
            <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                2. {t.cropDetails}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={t.productType}
                  required
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value })}
                  options={[
                    { value: "PADDY", label: isSinhala ? "වී (Paddy)" : "Paddy" },
                    { value: "RICE", label: isSinhala ? "සහල් (Rice)" : "Rice" },
                  ]}
                />

                <Select
                  label={t.riceType}
                  required
                  value={form.riceType}
                  onChange={(e) => setForm({ ...form, riceType: e.target.value })}
                  options={[
                    { value: "NADU", label: isSinhala ? "නාඩු (Nadu)" : "Nadu" },
                    { value: "SAMBA", label: isSinhala ? "සම්බා (Samba)" : "Samba" },
                    { value: "KEERI_SAMBA", label: isSinhala ? "කීරි සම්බා (Keeri Samba)" : "Keeri Samba" },
                    { value: "RED_NADU", label: isSinhala ? "රතු නාඩු (Red Nadu)" : "Red Nadu" },
                    { value: "RAW_RICE", label: isSinhala ? "කැකුළු / අමු සහල් (Raw Rice)" : "Raw Rice" },
                  ]}
                />
              </div>

              <Input
                label={t.quantity}
                required
                type="number"
                min="1"
                step="1"
                placeholder={t.quantityPlaceholder}
                suffixText="kg"
                value={form.quantityKg}
                onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
              />
            </div>

            {/* PRICING & DATE */}
            <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                3. {t.pricingSection}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t.askingPrice}
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={t.pricePlaceholder}
                  prefixText="LKR"
                  suffixText="/ kg"
                  value={form.askingPricePerKg}
                  onChange={(e) => setForm({ ...form, askingPricePerKg: e.target.value })}
                />

                <Input
                  label={t.availableDate}
                  required
                  type="date"
                  value={form.availableDate}
                  onChange={(e) => setForm({ ...form, availableDate: e.target.value })}
                />
              </div>
            </div>

            {/* HELPFUL IOT MOISTURE NOTICE */}
            <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-900/60">
              <p className="text-xs font-bold text-[#087f3f] dark:text-emerald-300">
                {t.moistureNoticeTitle}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {t.moistureNoticeDesc}
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
                className="font-extrabold text-base"
              >
                {submitting ? t.submittingBtn : t.submitBtn}
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}