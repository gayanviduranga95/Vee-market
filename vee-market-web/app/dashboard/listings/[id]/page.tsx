"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import LanguageSwitcher from "../../../components/LanguageSwitcher";
import ThemeSwitcher from "../../../components/ThemeSwitcher";
import { useLanguage } from "../../../components/LanguageProvider";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://172.18.228.12:8080";

type Lot = {
  id: number;
  farmId: number;
  farmName?: string | null;
  productType: string;
  riceType?: string | null;
  quantityKg: number;
  askingPricePerKg: number;
  availableDate?: string;
  status: string;
  createdAt?: string;
};

type Farm = {
  id: number;
  farmerId: number;
  farmName: string;
  location?: string | null;
  landSize?: number | null;
  mainCrop?: string | null;
  createdAt?: string;
};

type MoistureReading = {
  id: number;
  lotId?: number;
  deviceNumber: string;
  moisturePercentage: number;
  measuredAt: string;
};

type Bid = {
  bidId: number;
  lotId: number;
  millUserId: number;
  bidPricePerKg: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | string;
  createdAt: string;
  updatedAt?: string;
};

type FarmerProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  deviceNumber?: string;
};

export default function PaddyLotDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();

  const lotId = Number(params?.id);

  const [lot, setLot] = useState<Lot | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [moisture, setMoisture] = useState<MoistureReading[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showMoistureModal, setShowMoistureModal] = useState(false);
  const [moistureSubmitting, setMoistureSubmitting] = useState(false);
  const [confirmBidAction, setConfirmBidAction] = useState<{
    bidId: number;
    action: "accept" | "reject";
    millId: number;
    price: number;
  } | null>(null);

  const [moistureForm, setMoistureForm] = useState({
    deviceNumber: "",
    moisturePercentage: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [apiErrorDetail, setApiErrorDetail] = useState<{
    requestName: string;
    httpStatus: number | string;
    backendMessage: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSinhala = language === "si";

  const text = useMemo(
    () =>
      isSinhala
        ? {
            back: "මගේ වී තොග",
            badge: "ගොවි වෙළඳපොළ",
            title: "වී තොග විස්තර",
            subtitle:
              "ඔබේ වී තොගය, තෙතමන මට්ටම සහ මෝල් වෙතින් ලැබුණු මිල ගණන් පරීක්ෂා කර තීරණ ගන්න.",

            lot: "වී තොගය",
            lotNumber: "වී තොග අංකය",
            active: "සක්‍රීය",
            sold: "විකුණා ඇත",
            closed: "වසා ඇත",

            quantity: "ප්‍රමාණය",
            askingPrice: "ඉල්ලුම් මිල",
            availableDate: "ලබාදිය හැකි දිනය",
            productType: "නිෂ්පාදන වර්ගය",
            riceType: "වී වර්ගය",
            createdAt: "එකතු කළ දිනය",

            farmInformation: "ගොවිපළ තොරතුරු",
            farmName: "ගොවිපළේ නම",
            location: "ස්ථානය",
            landSize: "ඉඩම් ප්‍රමාණය",
            mainCrop: "ප්‍රධාන බෝගය",
            acres: "අක්කර",

            moistureSection: "තෙතමන මිනුම් සහ තත්ත්ව පරීක්ෂාව",
            latestMoisture: "නවතම තෙතමන මිනුම",
            noMoisture: "තවමත් තෙතමන මිනුමක් එකතු කර නොමැත.",
            noMoistureDesc:
              "තෙතමන ප්‍රතිශතය ඇතුළත් කිරීමෙන් ඔබේ වී තොගයට මෝල් වෙතින් ඉහළ මිලක් ලබාගත හැක.",
            moistureLevel: "තෙතමනය",
            device: "උපාංගය",
            measuredAt: "මැන ඇති වේලාව",
            addMoisture: "තෙතමන මිනුමක් එක් කරන්න",
            deviceNumber: "මිනුම් උපාංග අංකය",
            moisturePercentage: "තෙතමන ප්‍රතිශතය (%)",
            devicePlaceholder: "උදා: DEVICE-001",
            moisturePlaceholder: "උදා: 13.8",
            submitMoisture: "මිනුම සුරකින්න",
            submittingMoisture: "සුරකිමින් පවතී...",
            cancel: "අවලංගු කරන්න",
            invalidMoisture:
              "කරුණාකර නිවැරදි උපාංග අංකයක් සහ 0.10 සිට 60.00 දක්වා තෙතමන ප්‍රතිශතයක් ඇතුළත් කරන්න.",
            moistureHistory: "පෙර තෙතමන මිනුම් ඉතිහාසය",
            historyCount: "මිනුම් සංඛ්‍යාව",
            historyEmpty: "ඉතිහාසයක් නොමැත",

            trustStatus: "විශ්වසනීයත්ව තත්ත්වය",
            deviceVerified: "උපාංග මගින් තහවුරු කළ තොගයක්",
            unverified: "තහවුරු කර නොමැත",
            unverifiedNotice:
              "මෙම තොගය සඳහා තවමත් තෙතමන මිනුමක් එකතු කර නොමැත.",
            optimalMoisture: "ප්‍රශස්ත තත්ත්වය (වියළි)",
            moderateMoisture: "මධ්‍යස්ථ තත්ත්වය",
            highMoisture: "අධික තෙතමනය (වේලීම අවශ්‍යයි)",
            moistureGuide:
              "වී ගබඩා කිරීම හා ඇඹරීම සඳහා 12.0% - 14.0% ප්‍රශස්ත තෙතමන මට්ටම වේ.",

            bidsSection: "මෝල් වෙතින් ලැබුණු මිල ගණන් (ලංසු)",
            bidsCount: "ලැබුණු මිල ගණන්",
            noBids: "මෙම වී තොගය සඳහා තවමත් මිල ගණන් ලැබී නොමැත.",
            noBidsDesc:
              "මෝල් හිමියන් ඔබේ තොගය පරීක්ෂා කර මිල ගණන් ඉදිරිපත් කළ පසු මෙහි දිස්වනු ඇත.",

            mill: "මෝල",
            offer: "ඉදිරිපත් කළ මිල",
            totalValOffer: "මුළු ඇස්තමේන්තු මුදල",
            difference: "වෙනස",
            aboveAsking: "ඉල්ලුම් මිලට වඩා වැඩි",
            belowAsking: "ඉල්ලුම් මිලට වඩා අඩු",
            exactAsking: "ඉල්ලුම් මිලට සමාන",
            status: "තත්ත්වය",
            received: "ලැබුණු දිනය",

            pending: "පොරොත්තුවෙන්",
            accepted: "පිළිගත් ලංසුව",
            rejected: "ප්‍රතික්ෂේප කළ",
            withdrawn: "ඉවත් කරගත්",

            accept: "පිළිගන්න",
            reject: "ප්‍රතික්ෂේප කරන්න",
            accepting: "පිළිගනිමින්...",
            rejecting: "ප්‍රතික්ෂේප කරමින්...",

            confirmAcceptTitle: "මිල ගණන පිළිගැනීම තහවුරු කරන්න",
            confirmAcceptDesc:
              "මෙම ලංසුව පිළිගත් පසු අනෙකුත් සියලුම පොරොත්තු ලංසු ස්වයංක්‍රීයව ප්‍රතික්ෂේප වේ. ඉදිරියට යන්නද?",
            confirmRejectTitle: "මිල ගණන ප්‍රතික්ෂේප කිරීම",
            confirmRejectDesc: "මෙම ලංසුව ප්‍රතික්ෂේප කිරීමට ඔබට විශ්වාසද?",
            confirmBtn: "ඔව්, තහවුරු කරන්න",

            acceptedSuccessMsg:
              "මිල ගණන සාර්ථකව පිළිගන්නා ලදී! අනෙකුත් සියලුම පොරොත්තු ලංසු ප්‍රතික්ෂේප විය.",
            rejectedSuccessMsg: "මිල ගණන ප්‍රතික්ෂේප කරන ලදී.",
            moistureSuccessMsg: "තෙතමන මිනුම සාර්ථකව ඇතුළත් කරන ලදී!",

            lotsRequest: "වී තොග තොරතුරු ලබාගැනීම",
            farmsRequest: "ගොවිපළ තොරතුරු ලබාගැනීම",
            moistureRequest: "තෙතමන මිනුම් ලබාගැනීම",
            bidsRequest: "මිල ගණන් ලබාගැනීම",

            errorHeading: "තොරතුරු ලබාගැනීමට නොහැකි විය",
            retry: "නැවත උත්සාහ කරන්න",
            loading: "තොරතුරු පූරණය වෙමින් පවතී...",
            notFound: "අදාළ වී තොගය හමු නොවීය.",
            loginRequired: "කරුණාකර නැවත ලොග් වන්න.",
            nadu: "නාඩු",
            samba: "සම්බා",
            keeriSamba: "කීරි සම්බා",
            redNadu: "රතු නාඩු",
          }
        : {
            back: "My Paddy Lots",
            badge: "Farmer Marketplace",
            title: "Paddy Lot Details",
            subtitle:
              "Review your paddy lot specifications, moisture readings, and mill offers to make informed sales.",

            lot: "Paddy Lot",
            lotNumber: "Lot Number",
            active: "Active",
            sold: "Sold",
            closed: "Closed",

            quantity: "Quantity",
            askingPrice: "Asking Price",
            availableDate: "Available Date",
            productType: "Product Type",
            riceType: "Rice Type",
            createdAt: "Created At",

            farmInformation: "Farm Information",
            farmName: "Farm Name",
            location: "Location",
            landSize: "Land Size",
            mainCrop: "Main Crop",
            acres: "acres",

            moistureSection: "Moisture Readings & Quality Inspection",
            latestMoisture: "Latest Moisture Reading",
            noMoisture: "No moisture reading has been added yet.",
            noMoistureDesc:
              "Adding an verified moisture test percentage attracts higher bids from commercial rice mills.",
            moistureLevel: "Moisture",
            device: "Device",
            measuredAt: "Measured At",
            addMoisture: "Add Moisture Reading",
            deviceNumber: "Device Number",
            moisturePercentage: "Moisture Percentage (%)",
            devicePlaceholder: "e.g. DEVICE-001",
            moisturePlaceholder: "e.g. 13.8",
            submitMoisture: "Save Reading",
            submittingMoisture: "Saving...",
            cancel: "Cancel",
            invalidMoisture:
              "Please enter a valid device number and a moisture percentage between 0.10 and 60.00.",
            moistureHistory: "Moisture Reading History",
            historyCount: "Total Readings",
            historyEmpty: "No history records",

            trustStatus: "Trust Status",
            deviceVerified: "Device Verified",
            unverified: "Unverified",
            unverifiedNotice:
              "This lot currently has no verified moisture measurements.",
            optimalMoisture: "Optimal (Dry)",
            moderateMoisture: "Moderate Moisture",
            highMoisture: "High Moisture (Requires Drying)",
            moistureGuide:
              "Standard safe storage & milling moisture level is 12.0% - 14.0%.",

            bidsSection: "Offers from Mills (Bids)",
            bidsCount: "Received Offers",
            noBids: "No offers have been received for this paddy lot yet.",
            noBidsDesc:
              "Offers from rice mills will appear here in real-time as they browse and bid on your lot.",

            mill: "Mill",
            offer: "Offered Price",
            totalValOffer: "Total Value Offer",
            difference: "Difference",
            aboveAsking: "above asking price",
            belowAsking: "below asking price",
            exactAsking: "matches asking price",
            status: "Status",
            received: "Received At",

            pending: "Pending",
            accepted: "Accepted",
            rejected: "Rejected",
            withdrawn: "Withdrawn",

            accept: "Accept",
            reject: "Reject",
            accepting: "Accepting...",
            rejecting: "Rejecting...",

            confirmAcceptTitle: "Confirm Bid Acceptance",
            confirmAcceptDesc:
              "Accepting this bid will automatically mark all other pending bids as REJECTED. Do you want to proceed?",
            confirmRejectTitle: "Confirm Bid Rejection",
            confirmRejectDesc: "Are you sure you want to reject this offer?",
            confirmBtn: "Confirm Decision",

            acceptedSuccessMsg:
              "Bid accepted successfully! Other pending bids have been marked as rejected.",
            rejectedSuccessMsg: "Bid has been rejected.",
            moistureSuccessMsg: "Moisture reading recorded successfully!",

            lotsRequest: "Loading paddy lot data",
            farmsRequest: "Loading farm data",
            moistureRequest: "Loading moisture readings",
            bidsRequest: "Loading bids",

            errorHeading: "Unable to load lot information",
            retry: "Retry",
            loading: "Loading details...",
            notFound: "Paddy lot not found.",
            loginRequired: "Session expired. Please log in again.",
            nadu: "Nadu",
            samba: "Samba",
            keeriSamba: "Keeri Samba",
            redNadu: "Red Nadu",
          },
    [isSinhala]
  );

  function getToken() {
    return (
      localStorage.getItem("vee-market-token") ||
      localStorage.getItem("token")
    );
  }

  async function responseError(response: Response, requestName: string) {
    const raw = await response.text();
    let message = raw.trim();

    try {
      const data = JSON.parse(raw);
      message = data?.message || data?.error || data?.detail || message;
    } catch {
      // Keep raw message
    }

    return {
      requestName,
      httpStatus: response.status,
      backendMessage: message || `HTTP ${response.status}`,
    };
  }

  async function loadData() {
    if (!lotId || Number.isNaN(lotId)) {
      setError(text.notFound);
      setLoading(false);
      return;
    }

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setApiErrorDetail(null);

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      // 1. Fetch Farmer Profile (to get registered device number)
      try {
        const meRes = await fetch(`${API_URL}/api/farmer/me`, {
          headers,
          cache: "no-store",
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setFarmerProfile(meData);
          if (meData?.deviceNumber) {
            setMoistureForm((curr) => ({
              ...curr,
              deviceNumber: curr.deviceNumber || meData.deviceNumber,
            }));
          }
        }
      } catch (meErr) {
        console.warn("Could not fetch farmer profile:", meErr);
      }

      // 2. Fetch the Lot
      // Try direct GET /api/farmer/lots/{lotId} first, fallback to /api/farmer/lots list
      let lotData: Lot | null = null;
      let primaryError: { requestName: string; httpStatus: number | string; backendMessage: string } | null = null;

      try {
        const singleLotRes = await fetch(`${API_URL}/api/farmer/lots/${lotId}`, {
          headers,
          cache: "no-store",
        });

        if (singleLotRes.status === 401 || singleLotRes.status === 403) {
          router.push("/login");
          return;
        }

        if (singleLotRes.ok) {
          lotData = (await singleLotRes.json()) as Lot;
        } else if (singleLotRes.status !== 404) {
          primaryError = await responseError(singleLotRes, text.lotsRequest);
        }
      } catch (singleErr) {
        console.warn("Direct lot fetch error, falling back to list:", singleErr);
      }

      // If single lot request wasn't successful or returned 404, check /api/farmer/lots
      if (!lotData) {
        const lotsListRes = await fetch(`${API_URL}/api/farmer/lots`, {
          headers,
          cache: "no-store",
        });

        if (lotsListRes.status === 401 || lotsListRes.status === 403) {
          router.push("/login");
          return;
        }

        if (!lotsListRes.ok) {
          const detail = await responseError(lotsListRes, text.lotsRequest);
          setApiErrorDetail(primaryError || detail);
          setError(
            `${detail.requestName}: HTTP ${detail.httpStatus} - ${detail.backendMessage}`
          );
          setLoading(false);
          return;
        }

        const lotsArray = await lotsListRes.json();
        const found = Array.isArray(lotsArray)
          ? lotsArray.find((item: Lot) => Number(item.id) === lotId)
          : null;

        if (!found) {
          setLot(null);
          setError(text.notFound);
          setLoading(false);
          return;
        }

        lotData = found;
      }

      setLot(lotData);

      // 3. Load Farms (non-blocking for lot display)
      try {
        const farmsRes = await fetch(`${API_URL}/api/farmer/farms`, {
          headers,
          cache: "no-store",
        });

        if (farmsRes.ok) {
          const farmsData = await farmsRes.json();
          if (Array.isArray(farmsData)) {
            const matched = farmsData.find(
              (f: Farm) => Number(f.id) === Number(lotData?.farmId)
            );
            if (matched) {
              setFarm(matched);
            }
          }
        }
      } catch (farmErr) {
        console.warn("Farms load error:", farmErr);
      }

      // 4. Load Moisture Readings (non-blocking for lot display)
      try {
        const moistureRes = await fetch(
          `${API_URL}/api/farmer/lots/${lotId}/moisture`,
          {
            headers,
            cache: "no-store",
          }
        );

        if (moistureRes.ok) {
          const mData = await moistureRes.json();
          setMoisture(Array.isArray(mData) ? mData : []);
        } else {
          console.warn("Moisture API response not ok:", moistureRes.status);
        }
      } catch (mErr) {
        console.warn("Moisture load error:", mErr);
      }

      // 5. Load Bids (non-blocking for lot display)
      try {
        const bidsRes = await fetch(`${API_URL}/api/farmer/lots/${lotId}/bids`, {
          headers,
          cache: "no-store",
        });

        if (bidsRes.ok) {
          const bData = await bidsRes.json();
          setBids(Array.isArray(bData) ? bData : []);
        } else {
          console.warn("Bids API response not ok:", bidsRes.status);
        }
      } catch (bErr) {
        console.warn("Bids load error:", bErr);
      }
    } catch (err) {
      console.error("Load lot details fatal error:", err);
      setError(err instanceof Error ? err.message : text.errorHeading);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // CREATE MOISTURE READING
  // ==========================================================
  async function handleCreateMoisture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const deviceNumber = moistureForm.deviceNumber.trim();
    const moisturePercentage = Number(moistureForm.moisturePercentage);

    if (
      !deviceNumber ||
      !Number.isFinite(moisturePercentage) ||
      moisturePercentage < 0.1 ||
      moisturePercentage > 60
    ) {
      setError(text.invalidMoisture);
      return;
    }

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setMoistureSubmitting(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/farmer/lots/${lotId}/moisture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          deviceNumber,
          moisturePercentage,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const errObj = await responseError(res, text.moistureRequest);
        throw new Error(
          `${errObj.requestName}: HTTP ${errObj.httpStatus} - ${errObj.backendMessage}`
        );
      }

      const newReading = (await res.json()) as MoistureReading;
      setMoisture((prev) => [newReading, ...prev]);
      setShowMoistureModal(false);
      setSuccessMessage(text.moistureSuccessMsg);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Create moisture reading error:", err);
      setError(err instanceof Error ? err.message : text.errorHeading);
    } finally {
      setMoistureSubmitting(false);
    }
  }

  // ==========================================================
  // ACCEPT / REJECT BID
  // ==========================================================
  async function handleBidAction(bidId: number, action: "accept" | "reject") {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setActionLoading(bidId);
      setError(null);

      const res = await fetch(`${API_URL}/api/farmer/bids/${bidId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const errObj = await responseError(res, text.bidsRequest);
        throw new Error(
          `${errObj.requestName}: HTTP ${errObj.httpStatus} - ${errObj.backendMessage}`
        );
      }

      setConfirmBidAction(null);
      setSuccessMessage(
        action === "accept"
          ? text.acceptedSuccessMsg
          : text.rejectedSuccessMsg
      );
      setTimeout(() => setSuccessMessage(null), 6000);

      // Refresh bids and lot data
      await loadData();
    } catch (err) {
      console.error(`${action} bid error:`, err);
      setError(err instanceof Error ? err.message : text.errorHeading);
    } finally {
      setActionLoading(null);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotId]);

  // Helpers
  function formatMoney(value?: number) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function formatDate(value?: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(isSinhala ? "si-LK" : "en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function formatDateTime(value?: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(isSinhala ? "si-LK" : "en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function getRiceType(riceType?: string | null) {
    const type = (riceType || "").toUpperCase();
    switch (type) {
      case "NADU":
        return text.nadu;
      case "SAMBA":
        return text.samba;
      case "KEERI_SAMBA":
        return text.keeriSamba;
      case "RED_NADU":
        return text.redNadu;
      default:
        return riceType || "—";
    }
  }

  function statusLabel(status?: string) {
    switch (status) {
      case "ACTIVE":
        return text.active;
      case "SOLD":
        return text.sold;
      case "CLOSED":
        return text.closed;
      default:
        return status || "—";
    }
  }

  function bidStatusLabel(status?: string) {
    switch (status) {
      case "PENDING":
        return text.pending;
      case "ACCEPTED":
        return text.accepted;
      case "REJECTED":
        return text.rejected;
      case "WITHDRAWN":
        return text.withdrawn;
      default:
        return status || "—";
    }
  }

  function bidStatusClass(status?: string) {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800";
      case "WITHDRAWN":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800";
    }
  }

  const latestMoisture = useMemo(() => {
    if (moisture.length === 0) return null;
    return [...moisture].sort(
      (a, b) =>
        new Date(b.measuredAt || "").getTime() -
        new Date(a.measuredAt || "").getTime()
    )[0];
  }, [moisture]);

  // Moisture quality tier
  function getMoistureQuality(pct: number) {
    if (pct <= 14.0) {
      return {
        label: text.optimalMoisture,
        className:
          "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
        badge: "🟢",
      };
    }
    if (pct <= 16.0) {
      return {
        label: text.moderateMoisture,
        className:
          "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
        badge: "🟡",
      };
    }
    return {
      label: text.highMoisture,
      className:
        "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800",
      badge: "🔴",
    };
  }

  // ==========================================================
  // LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <Header />
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {text.loading}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // FATAL ERROR (NO LOT COULD BE LOADED)
  // ==========================================================
  if (error && !lot) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Link
            href="/dashboard/listings"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            ← {text.back}
          </Link>

          <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center shadow-sm dark:border-red-900/60 dark:bg-red-950/30">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl dark:bg-red-900/40">
              ⚠️
            </div>

            <h1 className="text-xl font-bold text-red-900 dark:text-red-200 sm:text-2xl">
              {text.errorHeading}
            </h1>

            <div className="mt-4 rounded-xl border border-red-200 bg-white/80 p-4 font-mono text-xs text-red-700 dark:border-red-900/40 dark:bg-slate-900 dark:text-red-300">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {apiErrorDetail?.requestName || text.lotsRequest}
              </p>
              {apiErrorDetail && (
                <p className="mt-1">
                  HTTP Status: {apiErrorDetail.httpStatus}
                </p>
              )}
              <p className="mt-1 break-words">
                {apiErrorDetail?.backendMessage || error}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                🔄 {text.retry}
              </button>

              <Link
                href="/dashboard/listings"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {text.back}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // MAIN VIEW
  // ==========================================================
  const totalLotValue =
    Number(lot?.quantityKg || 0) * Number(lot?.askingPricePerKg || 0);

  const hasMoisture = moisture.length > 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard/listings"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            ← {text.back}
          </Link>

          {/* Quick status badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                hasMoisture
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
              }`}
            >
              {hasMoisture ? "✓ " + text.deviceVerified : "⚠ " + text.unverified}
            </span>

            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {statusLabel(lot?.status)}
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
            >
              ✕
            </button>
          </div>
        )}

        {/* Non-fatal Error Alert */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Page Hero Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              🌾 {text.badge}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
                {getRiceType(lot?.riceType)}
              </h1>
              <span className="text-lg font-mono text-slate-400">
                #{lot?.id}
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              {text.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowMoistureModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              💧 {text.addMoisture}
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Quantity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950/40">
                ⚖️
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                kg
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {Number(lot?.quantityKg || 0).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {text.quantity}
            </p>
          </div>

          {/* Asking Price / kg */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl dark:bg-emerald-950/40">
                💰
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                / kg
              </span>
            </div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 sm:text-2xl">
              {formatMoney(lot?.askingPricePerKg)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {text.askingPrice}
            </p>
          </div>

          {/* Estimated Total Lot Value */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl dark:bg-amber-950/40">
                🌾
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                LKR
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {formatMoney(totalLotValue)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {isSinhala ? "මුළු ඇස්තමේන්තු වටිනාකම" : "Total Estimated Value"}
            </p>
          </div>

          {/* Moisture Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-xl dark:bg-sky-950/40">
                💧
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {hasMoisture ? "%" : "Status"}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {latestMoisture
                ? `${Number(latestMoisture.moisturePercentage).toFixed(1)}%`
                : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hasMoisture ? text.latestMoisture : text.unverified}
            </p>
          </div>
        </div>

        {/* Two-Column Grid: Left Details + Right Farm Details */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Paddy Lot Specifications */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {text.lot} #{lot?.id}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                LOT-{lot?.id}
              </span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <InfoRow
                label={text.productType}
                value={lot?.productType || "PADDY"}
              />

              <InfoRow
                label={text.riceType}
                value={getRiceType(lot?.riceType)}
                highlight
              />

              <InfoRow
                label={text.quantity}
                value={`${Number(lot?.quantityKg || 0).toLocaleString()} kg`}
              />

              <InfoRow
                label={text.askingPrice}
                value={`${formatMoney(lot?.askingPricePerKg)} / kg`}
              />

              <InfoRow
                label={text.availableDate}
                value={formatDate(lot?.availableDate)}
              />

              <InfoRow
                label={text.createdAt}
                value={formatDateTime(lot?.createdAt)}
              />
            </div>
          </div>

          {/* Farm Information */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏡</span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {text.farmInformation}
                </h2>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <InfoRow
                label={text.farmName}
                value={farm?.farmName || lot?.farmName || `Farm #${lot?.farmId}`}
                highlight
              />

              <InfoRow
                label={text.location}
                value={farm?.location || "Sri Lanka"}
              />

              <InfoRow
                label={text.landSize}
                value={
                  farm?.landSize
                    ? `${farm.landSize} ${text.acres}`
                    : "—"
                }
              />

              <InfoRow
                label={text.mainCrop}
                value={farm?.mainCrop || "Paddy"}
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            MOISTURE SECTION
        ====================================================== */}
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-xl dark:bg-sky-950/40">
                💧
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {text.moistureSection}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {text.moistureGuide}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMoistureModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              + {text.addMoisture}
            </button>
          </div>

          <div className="p-6">
            {latestMoisture ? (
              <div>
                {/* Latest reading highlight box */}
                {(() => {
                  const quality = getMoistureQuality(
                    Number(latestMoisture.moisturePercentage)
                  );

                  return (
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                      <div className="grid gap-4 sm:grid-cols-3">
                        {/* Percentage */}
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            {text.latestMoisture}
                          </p>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                              {Number(latestMoisture.moisturePercentage).toFixed(2)}%
                            </span>
                          </div>
                          <span
                            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${quality.className}`}
                          >
                            <span>{quality.badge}</span>
                            <span>{quality.label}</span>
                          </span>
                        </div>

                        {/* Device */}
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            {text.deviceNumber}
                          </p>
                          <p className="mt-2 font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                            {latestMoisture.deviceNumber}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            ✓ {text.deviceVerified}
                          </span>
                        </div>

                        {/* Measured At */}
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            {text.measuredAt}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {formatDateTime(latestMoisture.measuredAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* History table */}
                {moisture.length > 1 && (
                  <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                    <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
                      {text.moistureHistory} ({moisture.length})
                    </h3>

                    <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                      {moisture.map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                              {Number(m.moisturePercentage).toFixed(2)}%
                            </span>
                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {m.deviceNumber}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDateTime(m.measuredAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty moisture state */
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl dark:bg-sky-950/40">
                  💧
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {text.noMoisture}
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {text.noMoistureDesc}
                </p>
                <button
                  type="button"
                  onClick={() => setShowMoistureModal(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  + {text.addMoisture}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ======================================================
            BIDS / OFFERS SECTION
        ====================================================== */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl dark:bg-amber-950/40">
                💰
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {text.bidsSection}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {bids.length} {text.bidsCount}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {bids.length === 0 ? (
              /* No bids empty state */
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl dark:bg-amber-950/40">
                  🏭
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {text.noBids}
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {text.noBidsDesc}
                </p>
              </div>
            ) : (
              /* Bid cards list */
              <div className="space-y-4">
                {bids.map((bid) => {
                  const bidPrice = Number(bid.bidPricePerKg || 0);
                  const askingPrice = Number(lot?.askingPricePerKg || 0);
                  const priceDiff = bidPrice - askingPrice;
                  const totalOfferedValue =
                    bidPrice * Number(lot?.quantityKg || 0);

                  return (
                    <div
                      key={bid.bidId}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700 sm:p-6"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Left: Mill Info */}
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
                            🏭
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 dark:text-white">
                                {text.mill} #{bid.millUserId}
                              </h3>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${bidStatusClass(
                                  bid.status
                                )}`}
                              >
                                {bidStatusLabel(bid.status)}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {text.received}: {formatDateTime(bid.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Middle: Offered Price */}
                        <div className="flex flex-wrap items-center gap-6 sm:text-right">
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide">
                              {text.offer}
                            </p>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                              {formatMoney(bidPrice)}
                              <span className="ml-1 text-xs font-normal text-slate-500">
                                / kg
                              </span>
                            </p>

                            {/* Difference badge */}
                            <p className="mt-0.5 text-xs">
                              {priceDiff > 0 ? (
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                  +{formatMoney(priceDiff)} {text.aboveAsking}
                                </span>
                              ) : priceDiff < 0 ? (
                                <span className="font-medium text-rose-600 dark:text-rose-400">
                                  {formatMoney(priceDiff)} {text.belowAsking}
                                </span>
                              ) : (
                                <span className="font-medium text-slate-500">
                                  {text.exactAsking}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="border-l border-slate-200 pl-6 dark:border-slate-800">
                            <p className="text-xs text-slate-400 uppercase tracking-wide">
                              {text.totalValOffer}
                            </p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                              {formatMoney(totalOfferedValue)}
                            </p>
                          </div>
                        </div>

                        {/* Right: Actions for PENDING */}
                        {bid.status === "PENDING" && (
                          <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 lg:border-0 lg:pt-0">
                            <button
                              type="button"
                              disabled={actionLoading === bid.bidId}
                              onClick={() =>
                                setConfirmBidAction({
                                  bidId: bid.bidId,
                                  action: "reject",
                                  millId: bid.millUserId,
                                  price: bidPrice,
                                })
                              }
                              className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                            >
                              ✕ {text.reject}
                            </button>

                            <button
                              type="button"
                              disabled={actionLoading === bid.bidId}
                              onClick={() =>
                                setConfirmBidAction({
                                  bidId: bid.bidId,
                                  action: "accept",
                                  millId: bid.millUserId,
                                  price: bidPrice,
                                })
                              }
                              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              ✓ {text.accept}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ======================================================
          MODAL: ADD MOISTURE READING
      ====================================================== */}
      {showMoistureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-xl dark:bg-sky-950/40">
                  💧
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {text.addMoisture}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMoistureModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMoisture} className="space-y-5">
              {/* Device Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide dark:text-slate-300">
                  {text.deviceNumber}
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder={
                    farmerProfile?.deviceNumber || text.devicePlaceholder
                  }
                  value={moistureForm.deviceNumber}
                  onChange={(e) =>
                    setMoistureForm((curr) => ({
                      ...curr,
                      deviceNumber: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  {farmerProfile?.deviceNumber
                    ? `${isSinhala ? "ලියාපදිංචි උපාංගය" : "Registered device"}: ${farmerProfile.deviceNumber}`
                    : text.devicePlaceholder}
                </p>
              </div>

              {/* Moisture Percentage */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide dark:text-slate-300">
                  {text.moisturePercentage}
                </label>
                <div className="relative mt-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.10"
                    max="60.00"
                    required
                    placeholder={text.moisturePlaceholder}
                    value={moistureForm.moisturePercentage}
                    onChange={(e) =>
                      setMoistureForm((curr) => ({
                        ...curr,
                        moisturePercentage: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-bold text-slate-400">
                    %
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {text.moistureGuide}
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMoistureModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {text.cancel}
                </button>

                <button
                  type="submit"
                  disabled={moistureSubmitting}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {moistureSubmitting
                    ? text.submittingMoisture
                    : text.submitMoisture}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL: CONFIRM ACCEPT / REJECT BID
      ====================================================== */}
      {confirmBidAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-4 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-3xl dark:bg-amber-950/40">
                {confirmBidAction.action === "accept" ? "🤝" : "⚠️"}
              </span>

              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                {confirmBidAction.action === "accept"
                  ? text.confirmAcceptTitle
                  : text.confirmRejectTitle}
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {confirmBidAction.action === "accept"
                  ? text.confirmAcceptDesc
                  : text.confirmRejectDesc}
              </p>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {text.mill} #{confirmBidAction.millId} • {formatMoney(confirmBidAction.price)} / kg
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmBidAction(null)}
                className="w-1/2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {text.cancel}
              </button>

              <button
                type="button"
                disabled={actionLoading === confirmBidAction.bidId}
                onClick={() =>
                  handleBidAction(
                    confirmBidAction.bidId,
                    confirmBidAction.action
                  )
                }
                className={`w-1/2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition ${
                  confirmBidAction.action === "accept"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                } disabled:opacity-50`}
              >
                {actionLoading === confirmBidAction.bidId
                  ? confirmBidAction.action === "accept"
                    ? text.accepting
                    : text.rejecting
                  : text.confirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  // Header Subcomponent
  function Header() {
    return (
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-sm">
              🌿
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Vee Market
              </p>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                Farmer Marketplace
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>
    );
  }
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`mt-1 font-semibold ${
          highlight
            ? "text-base font-bold text-slate-900 dark:text-white"
            : "text-sm text-slate-800 dark:text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
