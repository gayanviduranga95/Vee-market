"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../components/LanguageProvider";
import ThemeSwitcher from "../components/ThemeSwitcher";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.18.228.12:8080";

type Farmer = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

type Farm = {
  id: number;
  farmName?: string;
  location?: string;
  landSize?: number;
  mainCrop?: string;
};

type Lot = {
  id: number;
  productType?: string;
  riceType?: string;
  quantityKg?: number;
  askingPricePerKg?: number;
  availableDate?: string;
  status?: string;
};

type Bid = {
  id: number;
  bidPricePerKg?: number;
  status?: string;
  createdAt?: string;
};

type Activity = {
  id: string;
  type: "offer" | "order" | "listing";
  text: string;
  time: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const isSinhala = language === "si";

  const t = useMemo(
    () => ({
      brand: {
        name: "Vee Market",
        tagline: isSinhala ? "ගොවිපළේ සිට අනාගතයට" : "From Farm to Future",
      },

      nav: {
        dashboard: isSinhala ? "උපකරණ පුවරුව" : "Dashboard",
        farm: isSinhala ? "මගේ ගොවිපළ" : "My Farm",
        listings: isSinhala ? "මගේ ලැයිස්තු" : "My Listings",
        offers: isSinhala ? "යෝජනා" : "Offers",
        orders: isSinhala ? "ඇණවුම්" : "Orders",
        payments: isSinhala ? "ගෙවීම්" : "Payments",
        profile: isSinhala ? "මගේ පැතිකඩ" : "Profile",
        help: isSinhala ? "සහාය / උපකාර" : "Help & Support",
      },

      hero: {
        greeting: isSinhala
          ? "සුභ උදෑසනක්"
          : "Good morning",
        subtitle: isSinhala
          ? "Vee Market සමඟ එක්ව වර්ධනය වෙමු."
          : "Let's grow together with Vee Market.",
        location: "Galle, Sri Lanka",
        date: isSinhala ? "2026 ඔක්තෝබර් 15" : "Thu, 15 Oct 2026",
      },

      cards: {
        farm: {
          title: isSinhala ? "මගේ ගොවිපළ" : "My Farm",
          description: isSinhala
            ? "ඔබේ ගොවිපළ තොරතුරු කළමනාකරණය කරන්න"
            : "View and manage your farm details",
          button: isSinhala ? "බලන්න" : "View",
        },
        listings: {
          title: isSinhala ? "මගේ ලැයිස්තු" : "My Listings",
          description: isSinhala
            ? "සක්‍රීය ලැයිස්තු"
            : "active listings",
          button: isSinhala ? "බලන්න" : "View",
        },
        offers: {
          title: isSinhala ? "යෝජනා" : "Offers",
          description: isSinhala
            ? "නව යෝජනා"
            : "new offers",
          button: isSinhala ? "බලන්න" : "View",
        },
        orders: {
          title: isSinhala ? "ඇණවුම්" : "Orders",
          description: isSinhala
            ? "සක්‍රීය ඇණවුම්"
            : "active orders",
          button: isSinhala ? "බලන්න" : "View",
        },
      },

      activity: {
        title: isSinhala ? "මෑත ක්‍රියාකාරකම්" : "Recent Activity",
        viewAll: isSinhala ? "සියල්ල බලන්න" : "View All",
        offer: isSinhala
          ? "ඔබේ වී ලැයිස්තුවකට නව මිල යෝජනාවක් ලැබී ඇත"
          : "Your paddy listing received a new offer",
        listing: isSinhala
          ? "ඔබේ වී ලැයිස්තුව සාර්ථකව සක්‍රීය කර ඇත"
          : "Your paddy listing is now active",
        order: isSinhala
          ? "ඔබේ ඇණවුම සැකසෙමින් පවතී"
          : "Your order is now processing",
        hours: isSinhala ? "පැය කිහිපයකට පෙර" : "hours ago",
        day: isSinhala ? "දිනකට පෙර" : "day ago",
      },

      quick: {
        title: isSinhala ? "ඉක්මන් ක්‍රියාව" : "Quick Action",
        add: isSinhala ? "නව ලැයිස්තුවක් එක් කරන්න" : "Add New Listing",
        description: isSinhala
          ? "ඔබේ වී හෝ සහල් විකිණීමට එක් කරන්න"
          : "Sell your paddy or rice",
      },

      common: {
        loading: isSinhala ? "පූරණය වෙමින්..." : "Loading...",
        noData: isSinhala ? "දත්ත නොමැත" : "No data available",
        logout: isSinhala ? "ඉවත් වන්න" : "Logout",
        farmer: isSinhala ? "ගොවියා" : "Farmer",
        active: isSinhala ? "සක්‍රීය" : "Active",
        kg: "kg",
        rs: "රු.",
        menu: isSinhala ? "මෙනුව" : "Menu",
        close: isSinhala ? "වසන්න" : "Close",
      },
    }),
    [isSinhala]
  );

  useEffect(() => {
    const token =
      localStorage.getItem("vee-market-token") ||
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const role = (
      localStorage.getItem("vee-market-user-role") || ""
    ).toUpperCase();

    if (role === "MILL") {
      router.replace("/dashboard/mill");
      return;
    }

    if (role === "BUYER") {
      router.replace("/dashboard/business");
      return;
    }

    if (role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }

    loadDashboard(token);
  }, [router]);

  async function loadDashboard(token: string) {
    setLoading(true);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [farmerRes, farmsRes, lotsRes] = await Promise.all([
        fetch(`${API_URL}/api/farmer/me`, { headers }),
        fetch(`${API_URL}/api/farmer/farms`, { headers }),
        fetch(`${API_URL}/api/farmer/lots`, { headers }),
      ]);

      if (farmerRes.ok) {
        const data = await farmerRes.json();
        setFarmer(data);
      }

      if (farmsRes.ok) {
        const data = await farmsRes.json();

        if (Array.isArray(data)) {
          setFarms(data);
        } else if (Array.isArray(data.content)) {
          setFarms(data.content);
        }
      }

      if (lotsRes.ok) {
        const data = await lotsRes.json();

        const lotData = Array.isArray(data)
          ? data
          : Array.isArray(data.content)
          ? data.content
          : [];

        setLots(lotData);

        const allBids: Bid[] = [];

        for (const lot of lotData) {
          try {
            const bidRes = await fetch(
              `${API_URL}/api/farmer/lots/${lot.id}/bids`,
              { headers }
            );

            if (bidRes.ok) {
              const bidData = await bidRes.json();

              const lotBids = Array.isArray(bidData)
                ? bidData
                : Array.isArray(bidData.content)
                ? bidData.content
                : [];

              allBids.push(...lotBids);
            }
          } catch {
            // Ignore an individual lot's bid failure.
          }
        }

        setBids(allBids);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("vee-market-token");
    localStorage.removeItem("vee-market-user-id");
    localStorage.removeItem("vee-market-user-email");
    localStorage.removeItem("vee-market-user-role");
    localStorage.removeItem("token");

    router.replace("/login");
  }

  function navigate(page: string) {
    setActiveNav(page);

    if (page === "farm") {
      router.push("/dashboard/farms/new");
      return;
    }

    if (page === "listings") {
      router.push("/dashboard/listings");
      return;
    }

    if (page === "offers") {
      router.push("/dashboard/bids");
      return;
    }

    if (page === "orders") {
      router.push("/dashboard/orders");
      return;
    }

    if (page === "payments") {
      router.push("/dashboard/payments");
      return;
    }

    if (page === "profile") {
      router.push("/dashboard/profile");
      return;
    }

    router.push("/dashboard");
  }

  const activeListings = lots.filter(
    (lot) => !lot.status || lot.status.toUpperCase() === "ACTIVE"
  ).length;

  const receivedOffers = bids.length;

  const userName =
    farmer?.name ||
    localStorage.getItem("vee-market-user-email")?.split("@")[0] ||
    "Farmer";

  const firstName = userName.split(" ")[0];

  const currentFarm = farms[0];

  const activity: Activity[] = [
    ...(receivedOffers > 0
      ? [
          {
            id: "offer",
            type: "offer" as const,
            text: t.activity.offer,
            time: `2 ${t.activity.hours}`,
          },
        ]
      : []),

    ...(activeListings > 0
      ? [
          {
            id: "listing",
            type: "listing" as const,
            text: t.activity.listing,
            time: `1 ${t.activity.day}`,
          },
        ]
      : []),

    ...(lots.length > 0
      ? [
          {
            id: "order",
            type: "order" as const,
            text: t.activity.order,
            time: `2 ${t.activity.day}`,
          },
        ]
      : []),
  ];

  if (activity.length === 0) {
    activity.push({
      id: "empty",
      type: "listing",
      text: t.common.noData,
      time: "",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f8f4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#dceee0] border-t-[#07883f] animate-spin" />
          <p className="text-sm font-medium text-slate-600">
            {t.common.loading}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-slate-800">
      <div className="flex min-h-screen">
        {/* ================= SIDEBAR ================= */}

        <aside className="hidden lg:flex w-[238px] shrink-0 bg-white border-r border-slate-100 flex-col px-4 py-5 fixed left-0 top-0 bottom-0 z-40">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="relative w-11 h-11">
              <div className="absolute left-1 top-2 w-7 h-5 bg-[#159447] rounded-[100%_0_100%_0] rotate-[-35deg]" />
              <div className="absolute left-4 top-0 w-7 h-5 bg-[#08763b] rounded-[0_100%_0_100%] rotate-[25deg]" />
            </div>

            <div>
              <div className="text-[19px] font-extrabold tracking-tight text-[#143b28]">
                {t.brand.name}
              </div>
              <div className="text-[9px] font-medium text-slate-500">
                {t.brand.tagline}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            <SidebarItem
              icon={<HomeIcon />}
              label={t.nav.dashboard}
              active={activeNav === "dashboard"}
              onClick={() => navigate("dashboard")}
            />

            <SidebarItem
              icon={<LeafIcon />}
              label={t.nav.farm}
              active={activeNav === "farm"}
              onClick={() => navigate("farm")}
            />

            <SidebarItem
              icon={<BoxIcon />}
              label={t.nav.listings}
              active={activeNav === "listings"}
              onClick={() => navigate("listings")}
            />

            <SidebarItem
              icon={<HandshakeIcon />}
              label={t.nav.offers}
              active={activeNav === "offers"}
              onClick={() => navigate("offers")}
            />

            <SidebarItem
              icon={<TruckIcon />}
              label={t.nav.orders}
              active={activeNav === "orders"}
              onClick={() => navigate("orders")}
            />

            <div className="my-5 border-t border-slate-100" />

            <SidebarItem
              icon={<CardIcon />}
              label={t.nav.payments}
              active={activeNav === "payments"}
              onClick={() => navigate("payments")}
            />

            <SidebarItem
              icon={<UserIcon />}
              label={t.nav.profile}
              active={activeNav === "profile"}
              onClick={() => navigate("profile")}
            />
          </nav>

          {/* Help */}
          <div className="mt-auto">
            <div className="mb-4 flex justify-end lg:flex">
              <ThemeSwitcher />
            </div>

            <div className="border-t border-slate-100 pt-5">
              <button
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                <HeadsetIcon />
                <span>{t.nav.help}</span>
              </button>

              <button
                onClick={logout}
                className="w-full mt-2 text-left px-3 py-2 text-xs text-slate-400 hover:text-red-500 transition"
              >
                {t.common.logout}
              </button>
            </div>
          </div>
        </aside>

        {/* ================= MAIN ================= */}

        <section className="flex-1 lg:ml-[238px] min-w-0">
          {/* Mobile Header */}
          <header className="lg:hidden h-[68px] bg-white border-b border-slate-100 px-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9">
                <div className="absolute left-1 top-2 w-6 h-4 bg-[#159447] rounded-[100%_0_100%_0] rotate-[-35deg]" />
                <div className="absolute left-3 top-0 w-6 h-4 bg-[#08763b] rounded-[0_100%_0_100%] rotate-[25deg]" />
              </div>

              <div>
                <div className="font-extrabold text-[#143b28]">
                  Vee Market
                </div>
                <div className="text-[8px] text-slate-400">
                  {t.brand.tagline}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />

              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center"
              >
                <MenuIcon />
              </button>
            </div>
          </header>

          {/* Mobile Menu */}
          {mobileMenu && (
            <div className="lg:hidden fixed inset-x-0 top-[68px] z-20 bg-white border-b shadow-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                <MobileMenuButton
                  label={t.nav.dashboard}
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("dashboard");
                  }}
                />

                <MobileMenuButton
                  label={t.nav.farm}
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("farm");
                  }}
                />

                <MobileMenuButton
                  label={t.nav.listings}
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("listings");
                  }}
                />

                <MobileMenuButton
                  label={t.nav.offers}
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("offers");
                  }}
                />

                <MobileMenuButton
                  label={t.nav.orders}
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("orders");
                  }}
                />

                <MobileMenuButton
                  label={t.nav.profile}
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("profile");
                  }}
                />
              </div>
            </div>
          )}

          {/* Desktop Topbar */}
          <header className="hidden lg:flex h-[72px] bg-white border-b border-slate-100 items-center justify-end px-8 gap-5">
            <ThemeSwitcher />
            <LanguageSwitcher />

            <button className="relative w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center">
              <BellIcon />
              {receivedOffers > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-full bg-[#dfeee2] flex items-center justify-center text-[#08763b] font-bold">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="hidden xl:block">
                <div className="text-sm font-bold text-slate-800">
                  {userName}
                </div>
                <div className="text-xs text-slate-400">
                  {t.common.farmer}
                </div>
              </div>

              <ChevronDownIcon />
            </div>
          </header>

          {/* ================= CONTENT ================= */}

          <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
            {/* HERO */}
            <section className="relative h-[245px] sm:h-[260px] lg:h-[250px] rounded-[22px] overflow-hidden shadow-sm">
              <img
                src="/vee-market-hero.png"
                alt="Vee Market"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />

              <div className="relative h-full flex items-center px-6 sm:px-9 lg:px-10">
                <div className="text-white max-w-[570px]">
                  <p className="text-sm sm:text-base font-medium mb-2 text-white/90">
                    {t.hero.greeting},
                  </p>

                  <h1 className="text-3xl sm:text-4xl lg:text-[38px] leading-tight font-extrabold tracking-tight">
                    {firstName}!
                  </h1>

                  <p className="mt-3 text-sm sm:text-base text-white/90">
                    {t.hero.subtitle}
                  </p>
                </div>

                {/* Weather */}
                <div className="absolute right-4 sm:right-7 lg:right-8 top-1/2 -translate-y-1/2 bg-[#203522]/90 backdrop-blur-md text-white rounded-2xl px-5 py-4 min-w-[155px] shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">☀️</span>
                    <span className="text-2xl font-bold">28°C</span>
                  </div>

                  <div className="mt-2 text-xs text-white/90">
                    {t.hero.location}
                  </div>

                  <div className="text-[11px] text-white/70 mt-1">
                    {t.hero.date}
                  </div>
                </div>
              </div>
            </section>

            {/* MOBILE PROFILE */}
            <div className="lg:hidden mt-4 bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#dfeee2] flex items-center justify-center text-[#08763b] font-bold">
                  {firstName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="font-bold text-slate-800">
                    {userName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t.common.farmer}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="text-xs font-semibold text-red-500"
              >
                {t.common.logout}
              </button>
            </div>

            {/* ================= ACTION CARDS ================= */}

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
              <DashboardCard
                type="farm"
                title={t.cards.farm.title}
                description={t.cards.farm.description}
                value={currentFarm ? "✓" : ""}
                onClick={() => navigate("farm")}
              />

              <DashboardCard
                type="listing"
                title={t.cards.listings.title}
                description={
                  activeListings === 1
                    ? `1 ${t.cards.listings.description}`
                    : `${activeListings} ${t.cards.listings.description}`
                }
                onClick={() => navigate("listings")}
              />

              <DashboardCard
                type="offer"
                title={t.cards.offers.title}
                description={
                  receivedOffers === 1
                    ? `1 ${t.cards.offers.description}`
                    : `${receivedOffers} ${t.cards.offers.description}`
                }
                onClick={() => navigate("offers")}
              />

              <DashboardCard
                type="order"
                title={t.cards.orders.title}
                description={`0 ${t.cards.orders.description}`}
                onClick={() => navigate("orders")}
              />
            </section>

            {/* ================= BOTTOM AREA ================= */}

            <section className="grid lg:grid-cols-[1fr_300px] gap-4 mt-5">
              {/* Recent Activity */}
              <div className="bg-white rounded-[18px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                  <h2 className="font-extrabold text-lg text-slate-800">
                    {t.activity.title}
                  </h2>

                  <button className="text-sm font-semibold text-[#08763b] hover:underline">
                    {t.activity.viewAll}
                  </button>
                </div>

                <div>
                  {activity.map((item) => (
                    <ActivityRow
                      key={item.id}
                      type={item.type}
                      text={item.text}
                      time={item.time}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Action */}
              <div className="bg-white rounded-[18px] shadow-sm border border-slate-100 p-5">
                <h2 className="font-extrabold text-lg text-slate-800 mb-4">
                  {t.quick.title}
                </h2>

                <button
                  onClick={() => router.push("/dashboard/listings/new")}
                  className="w-full flex items-center gap-4 rounded-2xl border border-slate-100 p-4 hover:border-[#b9dec5] hover:bg-[#f8fcf9] transition text-left group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#08763b] flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition">
                    <PlusIcon />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800">
                      {t.quick.add}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {t.quick.description}
                    </div>
                  </div>

                  <ArrowRightIcon />
                </button>
              </div>
            </section>

            {/* ================= LISTINGS PREVIEW ================= */}

            {lots.length > 0 && (
              <section className="mt-5 bg-white rounded-[18px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                  <div>
                    <h2 className="font-extrabold text-lg text-slate-800">
                      {isSinhala ? "මගේ ලැයිස්තු" : "My Recent Listings"}
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      {isSinhala
                        ? "ඔබේ සක්‍රීය වී ලැයිස්තු"
                        : "Your active paddy listings"}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("listings")}
                    className="text-sm font-semibold text-[#08763b]"
                  >
                    {isSinhala ? "සියල්ල බලන්න" : "View All"}
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {lots.slice(0, 3).map((lot) => (
                    <div
                      key={lot.id}
                      className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition"
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#edf6ee] flex items-center justify-center text-2xl">
                        🌾
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800">
                          {lot.riceType || lot.productType || "Paddy"}
                        </div>

                        <div className="text-sm text-slate-500 mt-1">
                          {lot.quantityKg ?? 0} kg
                          {lot.askingPricePerKg
                            ? ` • ${t.common.rs} ${lot.askingPricePerKg}/kg`
                            : ""}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex px-3 py-1 rounded-full bg-[#e2f4e7] text-[#08763b] text-xs font-bold">
                          {lot.status || t.common.active}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 h-[72px] z-40 px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="h-full grid grid-cols-5 items-center">
          <MobileNavItem
            icon={<HomeIcon />}
            label={t.nav.dashboard}
            active={activeNav === "dashboard"}
            onClick={() => navigate("dashboard")}
          />

          <MobileNavItem
            icon={<LeafIcon />}
            label={isSinhala ? "ගොවිපළ" : "Farm"}
            active={activeNav === "farm"}
            onClick={() => navigate("farm")}
          />

          <button
            onClick={() => router.push("/dashboard/listings/new")}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#08763b] text-white flex items-center justify-center shadow-lg -mt-7 border-4 border-[#f4f7f3]">
              <PlusIcon />
            </div>

            <span className="text-[10px] font-semibold text-slate-500 mt-1">
              {isSinhala ? "එක් කරන්න" : "Add"}
            </span>
          </button>

          <MobileNavItem
            icon={<TruckIcon />}
            label={t.nav.orders}
            active={activeNav === "orders"}
            onClick={() => navigate("orders")}
          />

          <MobileNavItem
            icon={<UserIcon />}
            label={isSinhala ? "ගිණුම" : "Account"}
            active={activeNav === "profile"}
            onClick={() => navigate("profile")}
          />
        </div>
      </nav>

      {/* Mobile bottom spacing */}
      <div className="lg:hidden h-20" />
    </main>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition ${
        active
          ? "bg-[#dff2e3] text-[#08763b]"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className={active ? "text-[#08763b]" : "text-slate-500"}>
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   MOBILE MENU
========================================================= */

function MobileMenuButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left px-4 py-3 rounded-xl bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-[#e7f5eb]"
    >
      {label}
    </button>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  type,
  title,
  description,
  value,
  onClick,
}: {
  type: "farm" | "listing" | "offer" | "order";
  title: string;
  description: string;
  value?: string;
  onClick: () => void;
}) {
  const styles = {
    farm: {
      bg: "bg-[#eaf8ed] dark:bg-[#183524]",
      iconBg: "bg-[#d5efda] dark:bg-[#245238]",
      icon: "text-[#08763b]",
      arrow: "bg-[#08763b]",
    },
    listing: {
      bg: "bg-[#fff4e7] dark:bg-[#382918]",
      iconBg: "bg-[#ffe7c7] dark:bg-[#5a4024]",
      icon: "text-[#f27c00]",
      arrow: "bg-[#f27c00]",
    },
    offer: {
      bg: "bg-[#edf5ff] dark:bg-[#182d45]",
      iconBg: "bg-[#dcecff] dark:bg-[#294b72]",
      icon: "text-[#2468d8]",
      arrow: "bg-[#2468d8]",
    },
    order: {
      bg: "bg-[#f4edff] dark:bg-[#2d2144]",
      iconBg: "bg-[#e9dcff] dark:bg-[#49366b]",
      icon: "text-[#6d20d8]",
      arrow: "bg-[#6d20d8]",
    },
  };

  const s = styles[type];

  return (
    <button
      onClick={onClick}
      className={`${s.bg} rounded-[18px] p-5 text-left min-h-[190px] sm:min-h-[205px] hover:-translate-y-1 transition duration-200`}
    >
      <div
        className={`w-12 h-12 rounded-full ${s.iconBg} ${s.icon} flex items-center justify-center`}
      >
        {type === "farm" && <LeafIcon size={25} />}
        {type === "listing" && <BoxIcon size={25} />}
        {type === "offer" && <HandshakeIcon size={25} />}
        {type === "order" && <TruckIcon size={25} />}
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {value && (
          <span className="block text-xl font-extrabold text-slate-800 mb-1">
            {value}
          </span>
        )}

        {description}
      </p>

      <div
        className={`mt-5 w-9 h-9 rounded-full ${s.arrow} text-white flex items-center justify-center`}
      >
        <ArrowRightIcon size={16} />
      </div>
    </button>
  );
}

/* =========================================================
   ACTIVITY
========================================================= */

function ActivityRow({
  type,
  text,
  time,
}: {
  type: "offer" | "order" | "listing";
  text: string;
  time: string;
}) {
  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          type === "offer"
            ? "bg-[#e9f2ff] text-[#2468d8]"
            : type === "order"
            ? "bg-[#f1eaff] text-[#6d20d8]"
            : "bg-[#fff0dd] text-[#ef7900]"
        }`}
      >
        {type === "offer" && <HandshakeIcon size={18} />}
        {type === "order" && <TruckIcon size={18} />}
        {type === "listing" && <BoxIcon size={18} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">
          {text}
        </p>

        {time && (
          <p className="text-xs text-slate-400 mt-1">
            {time}
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */

function MobileNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 ${
        active ? "text-[#08763b]" : "text-slate-400"
      }`}
    >
      {icon}

      <span className="text-[10px] font-semibold">
        {label}
      </span>
    </button>
  );
}

/* =========================================================
   ICONS
========================================================= */

function HomeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 3 3 10v10a1 1 0 0 0 1 1h6v-6h4v6h6a1 1 0 0 0 1-1V10l-9-7Z" />
    </svg>
  );
}

function LeafIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 4C12 4 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z" />
      <path d="M5 19c2-4 5-7 10-9" />
    </svg>
  );
}

function BoxIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function HandshakeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 5 2-2 8 8-2 2" />
      <path d="M13 7 9 11a2 2 0 0 0 0 3l1 1" />
      <path d="m16 10-4 4a2 2 0 0 0 0 3l1 1" />
      <path d="m19 13-2 2a2 2 0 0 0 0 3l1 1" />
      <path d="m3 11 6-6 4 4" />
      <path d="m3 11 2 2" />
    </svg>
  );
}

function TruckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

function CardIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  );
}

function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6Z" />
    </svg>
  );
}

function HeadsetIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
      <path d="M15 19c0 1-1 2-3 2" />
    </svg>
  );
}

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function ChevronDownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function PlusIcon({ size = 21 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MenuIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}