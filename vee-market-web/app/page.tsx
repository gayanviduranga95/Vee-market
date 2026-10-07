"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "./components/ThemeSwitcher";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://172.18.228.12:8080";

type Farm = {
  id: number;
  farmName?: string;
  location?: string;
  landSize?: number;
  mainCrop?: string;
};

type PaddyLot = {
  id: number;
  productType?: string;
  riceType?: string;
  quantityKg?: number;
  askingPricePerKg?: number;
  availableDate?: string;
  status?: string;
};

type FarmerProfile = {
  id?: number;
  verificationStatus?: string;
};

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [farmer, setFarmer] =
    useState<FarmerProfile | null>(null);

  const [farms, setFarms] =
    useState<Farm[]>([]);

  const [lots, setLots] =
    useState<PaddyLot[]>([]);

  const [showFarmForm, setShowFarmForm] =
    useState(false);

  const [showLotForm, setShowLotForm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [email, setEmail] =
    useState("Farmer");

  useEffect(() => {
    const storedEmail =
      localStorage.getItem(
        "vee_market_email"
      );

    if (storedEmail) {
      setEmail(storedEmail);
    }

    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token =
      localStorage.getItem(
        "vee_market_token"
      );

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization:
          `Bearer ${token}`,
        Accept:
          "application/json",
      };

      const [
        farmerResponse,
        farmsResponse,
        lotsResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/farmer/me`,
          { headers }
        ),

        fetch(
          `${API_URL}/api/farmer/farms`,
          { headers }
        ),

        fetch(
          `${API_URL}/api/farmer/lots`,
          { headers }
        ),
      ]);

      if (
        farmerResponse.status === 401 ||
        farmerResponse.status === 403
      ) {
        logout();
        return;
      }

      const farmerData =
        await readJson(
          farmerResponse
        );

      const farmsData =
        await readJson(
          farmsResponse
        );

      const lotsData =
        await readJson(
          lotsResponse
        );

      setFarmer(
        farmerData
      );

      setFarms(
        Array.isArray(farmsData)
          ? farmsData
          : farmsData?.content ||
              farmsData?.data ||
              []
      );

      setLots(
        Array.isArray(lotsData)
          ? lotsData
          : lotsData?.content ||
              lotsData?.data ||
              []
      );
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(
      "vee_market_token"
    );

    localStorage.removeItem(
      "vee_market_user_id"
    );

    localStorage.removeItem(
      "vee_market_role"
    );

    localStorage.removeItem(
      "vee_market_email"
    );

    router.replace("/login");
  }

  const totalFarms =
    farms.length;

  const totalLots =
    lots.length;

  const activeLots =
    lots.filter(
      (lot) =>
        String(
          lot.status
        ).toUpperCase() ===
        "ACTIVE"
    ).length;

  const totalQuantity =
    lots.reduce(
      (total, lot) =>
        total +
        Number(
          lot.quantityKg || 0
        ),
      0
    );

  const firstName =
    getNameFromEmail(email);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-[#f5f8f6]">

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside
        className="
          fixed inset-y-0 left-0 z-40
          hidden w-[260px]
          border-r border-slate-200
          bg-white
          lg:flex lg:flex-col
        "
      >

        {/* Logo */}

        <div
          className="
            flex h-[88px]
            items-center
            gap-3
            border-b border-slate-100
            px-6
          "
        >
          <div
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-2xl
              bg-[#eaf7ee]
            "
          >
            <LeafIcon />
          </div>

          <div>
            <h1 className="text-lg font-bold text-[#063b25]">
              Vee Market
            </h1>

            <p className="text-xs text-slate-400">
              Farmer Portal
            </p>
          </div>
        </div>

        {/* Navigation */}

        <nav className="flex-1 px-4 py-6">

          <SidebarItem
            icon="home"
            label="Dashboard"
            active
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
          />

          <SidebarItem
            icon="farm"
            label="My Farm"
            onClick={() => router.push("/dashboard/farms/new")}
          />

          <SidebarItem
            icon="paddy"
            label="My Listings"
            onClick={() => router.push("/dashboard/listings")}
          />

          <SidebarItem
            icon="offer"
            label="Offers"
            onClick={() =>
              router.push(
                "/dashboard/bids"
              )
            }
          />

          <SidebarItem
            icon="truck"
            label="Orders"
            onClick={() => router.push("/dashboard/orders")}
          />

          <SidebarItem
            icon="payment"
            label="Payments"
            onClick={() => router.push("/dashboard/payments")}
          />

          <SidebarItem
            icon="user"
            label="Profile"
            onClick={() => router.push("/dashboard")}
          />

        </nav>

        {/* Bottom */}

        <div className="border-t border-slate-100 p-4">

          <div
            className="
              rounded-2xl
              bg-[#f7faf8]
              p-3
            "
          >
            <div
              className="
                flex items-center gap-3
              "
            >

              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-full
                  bg-[#087f3f]
                  text-sm font-bold
                  text-white
                "
              >
                {getInitial(email)}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-slate-800">
                  {firstName}
                </p>

                <p className="text-xs text-slate-400">
                  Farmer
                </p>

              </div>

            </div>
          </div>

          <button
            onClick={logout}
            className="
              mt-3 w-full
              rounded-xl
              px-3 py-2.5
              text-left
              text-sm font-medium
              text-red-600
              transition
              hover:bg-red-50
            "
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="lg:pl-[260px]">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header
          className="
            sticky top-0 z-30
            flex h-[76px]
            items-center
            justify-between
            border-b border-slate-200
            bg-white/95
            px-4
            backdrop-blur
            sm:px-6
            lg:px-8
          "
        >

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Farmer Portal
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3">

            {/* Language */}

            <ThemeSwitcher />

            <button
              className="
                hidden
                rounded-xl
                border border-slate-200
                bg-white
                px-3 py-2
                text-xs font-semibold
                text-slate-600
                sm:block
              "
            >
              සිං / EN
            </button>

            {/* Notification */}

            <button
              className="
                relative
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-slate-200
                bg-white
                text-slate-500
              "
            >
              <BellIcon />

              <span
                className="
                  absolute right-2 top-2
                  h-2 w-2
                  rounded-full
                  bg-[#ff8a00]
                "
              />
            </button>

            {/* Avatar */}

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                bg-[#087f3f]
                text-sm font-bold
                text-white
              "
            >
              {getInitial(email)}
            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            mx-auto
            max-w-[1500px]
            p-4
            sm:p-6
            lg:p-8
          "
        >

          {/* Error */}

          {error && (
            <div
              className="
                mb-6
                flex items-center
                justify-between
                rounded-2xl
                border border-red-100
                bg-red-50
                px-4 py-3
                text-sm text-red-700
              "
            >
              <span>{error}</span>

              <button
                onClick={
                  loadDashboard
                }
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* =================================================
              HERO
          ================================================= */}

          <section
            className="
              relative
              min-h-[310px]
              overflow-hidden
              rounded-[28px]
              bg-[#063b25]
            "
          >

            {/* Image */}

            <img
              src="/vee-market-hero.png"
              alt="Sri Lankan farmer working in a paddy field"
              className="
                absolute inset-0
                h-full w-full
                object-cover
              "
            />

            {/* Gradient */}

            <div
              className="
                absolute inset-0
                bg-gradient-to-r
                from-[#063b25]/95
                via-[#063b25]/70
                to-[#063b25]/10
              "
            />

            {/* Hero content */}

            <div
              className="
                relative z-10
                flex min-h-[310px]
                items-center
                p-6
                sm:p-10
                lg:p-12
              "
            >

              <div className="max-w-xl">

                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-white/15
                    px-3 py-1.5
                    text-xs font-semibold
                    text-white
                    backdrop-blur
                  "
                >
                  🌾 Vee Market
                </span>

                <h1
                  className="
                    mt-4
                    text-3xl
                    font-bold
                    leading-tight
                    text-white
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  Good morning,
                  <br />
                  {firstName}! 👋
                </h1>

                <p
                  className="
                    mt-4
                    max-w-md
                    text-sm
                    leading-6
                    text-green-50
                    sm:text-base
                  "
                >
                  Sell your paddy with
                  confidence, receive
                  competitive offers and
                  manage your farm from
                  one simple platform.
                </p>

                <div
                  className="
                    mt-6
                    flex flex-wrap
                    gap-3
                  "
                >
                  <button
                    onClick={() =>
                      setShowLotForm(true)
                    }
                    className="
                      rounded-xl
                      bg-white
                      px-5 py-3
                      text-sm
                      font-bold
                      text-[#087f3f]
                      shadow-lg
                      transition
                      hover:bg-green-50
                    "
                  >
                    + List Paddy
                  </button>

                  <button
                    onClick={() =>
                      setShowFarmForm(true)
                    }
                    className="
                      rounded-xl
                      border
                      border-white/30
                      bg-white/10
                      px-5 py-3
                      text-sm
                      font-bold
                      text-white
                      backdrop-blur
                      transition
                      hover:bg-white/20
                    "
                  >
                    + Add Farm
                  </button>
                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              QUICK STATS
          ================================================= */}

          <section
            className="
              mt-6
              grid
              grid-cols-2
              gap-4
              xl:grid-cols-4
            "
          >

            <DashboardStat
              icon="farm"
              title="My Farms"
              value={String(
                totalFarms
              )}
              description="Registered farms"
              className="green"
            />

            <DashboardStat
              icon="paddy"
              title="Paddy Listings"
              value={String(
                totalLots
              )}
              description="Total listings"
              className="orange"
            />

            <DashboardStat
              icon="offer"
              title="Active Lots"
              value={String(
                activeLots
              )}
              description="Currently available"
              className="blue"
            />

            <DashboardStat
              icon="weight"
              title="Paddy Quantity"
              value={`${formatNumber(
                totalQuantity
              )}`}
              description="Kilograms listed"
              suffix="kg"
              className="purple"
            />

          </section>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <section
            className="
              mt-6
              grid
              grid-cols-1
              gap-6
              xl:grid-cols-3
            "
          >

            {/* FARM */}

            <div
              className="
                rounded-[24px]
                border border-slate-200
                bg-white
                xl:col-span-1
              "
            >

              <div
                className="
                  flex items-center
                  justify-between
                  border-b
                  border-slate-100
                  p-5
                "
              >

                <div>
                  <h3 className="font-bold text-slate-900">
                    My Farms
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Your registered farms
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowFarmForm(true)
                  }
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-xl
                    bg-[#eaf7ee]
                    text-lg font-semibold
                    text-[#087f3f]
                  "
                >
                  +
                </button>

              </div>

              <div className="p-4">

                {farms.length === 0 ? (

                  <EmptyBox
                    icon="farm"
                    title="No farms yet"
                    description="Add your first farm to start listing paddy."
                    button="Add Farm"
                    onClick={() =>
                      setShowFarmForm(true)
                    }
                  />

                ) : (

                  <div className="space-y-3">

                    {farms
                      .slice(0, 4)
                      .map(
                        (farm) => (
                          <FarmCard
                            key={
                              farm.id
                            }
                            farm={farm}
                          />
                        )
                      )}

                  </div>

                )}

              </div>

            </div>

            {/* PADDY */}

            <div
              className="
                rounded-[24px]
                border border-slate-200
                bg-white
                xl:col-span-2
              "
            >

              <div
                className="
                  flex items-center
                  justify-between
                  border-b
                  border-slate-100
                  p-5
                "
              >

                <div>
                  <h3 className="font-bold text-slate-900">
                    Recent Paddy Listings
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Your latest paddy lots
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowLotForm(true)
                  }
                  className="
                    rounded-xl
                    bg-[#087f3f]
                    px-4 py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#066a34]
                  "
                >
                  + List Paddy
                </button>

              </div>

              <div className="p-4">

                {lots.length === 0 ? (

                  <EmptyBox
                    icon="paddy"
                    title="No paddy listings"
                    description="Create your first paddy listing."
                    button="List Paddy"
                    onClick={() =>
                      setShowLotForm(true)
                    }
                  />

                ) : (

                  <div className="space-y-3">

                    {lots
                      .slice(0, 5)
                      .map(
                        (lot) => (
                          <LotCard
                            key={
                              lot.id
                            }
                            lot={lot}
                          />
                        )
                      )}

                  </div>

                )}

              </div>

            </div>

          </section>

          {/* =================================================
              BOTTOM GRID
          ================================================= */}

          <section
            className="
              mt-6
              grid
              grid-cols-1
              gap-6
              lg:grid-cols-2
            "
          >

            {/* QUICK ACTIONS */}

            <div
              className="
                rounded-[24px]
                border border-slate-200
                bg-white
                p-5
              "
            >

              <div>
                <h3 className="font-bold text-slate-900">
                  Quick Actions
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Manage your marketplace activity
                </p>
              </div>

              <div
                className="
                  mt-5
                  grid
                  grid-cols-2
                  gap-3
                "
              >

                <ActionCard
                  icon="paddy"
                  title="List Paddy"
                  description="Create a new lot"
                  className="green"
                  onClick={() =>
                    setShowLotForm(true)
                  }
                />

                <ActionCard
                  icon="offer"
                  title="View Offers"
                  description="Check mill bids"
                  className="orange"
                  onClick={() =>
                    router.push(
                      "/dashboard/bids"
                    )
                  }
                />

                <ActionCard
                  icon="farm"
                  title="Add Farm"
                  description="Register a farm"
                  className="blue"
                  onClick={() =>
                    setShowFarmForm(true)
                  }
                />

                <ActionCard
                  icon="profile"
                  title="My Profile"
                  description="Manage account"
                  className="purple"
                  onClick={() => router.push("/dashboard/profile")}
                />

              </div>

            </div>

            {/* VERIFICATION */}

            <div
              className="
                rounded-[24px]
                border border-slate-200
                bg-white
                p-5
              "
            >

              <div>
                <h3 className="font-bold text-slate-900">
                  Account Verification
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Your Vee Market verification status
                </p>
              </div>

              <div
                className="
                  mt-5
                  rounded-2xl
                  bg-[#f7faf8]
                  p-5
                "
              >

                <div
                  className="
                    flex items-start
                    gap-4
                  "
                >

                  <div
                    className="
                      flex h-12 w-12
                      shrink-0
                      items-center justify-center
                      rounded-2xl
                      bg-[#eaf7ee]
                      text-[#087f3f]
                    "
                  >
                    <ShieldIcon />
                  </div>

                  <div className="flex-1">

                    <div
                      className="
                        flex flex-wrap
                        items-center
                        justify-between
                        gap-2
                      "
                    >

                      <h4 className="font-semibold text-slate-800">
                        Farmer verification
                      </h4>

                      <StatusBadge
                        status={
                          farmer?.verificationStatus ||
                          "PENDING"
                        }
                      />

                    </div>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-slate-500
                      "
                    >
                      Verified farmer accounts
                      can build stronger trust
                      with mills on the platform.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

      </div>

      {/* =================================================
          FARM MODAL
      ================================================= */}

      {showFarmForm && (
        <FarmModal
          onClose={() =>
            setShowFarmForm(false)
          }
          onSuccess={() => {
            setShowFarmForm(false);
            loadDashboard();
          }}
        />
      )}

      {/* =================================================
          LOT MODAL
      ================================================= */}

      {showLotForm && (
        <LotModal
          farms={farms}
          onClose={() =>
            setShowLotForm(false)
          }
          onSuccess={() => {
            setShowLotForm(false);
            loadDashboard();
          }}
        />
      )}

      {/* =================================================
          MOBILE NAV
      ================================================= */}

      <div
        className="
          fixed bottom-0 left-0 right-0 z-40
          border-t border-slate-200
          bg-white/95
          px-2 py-2
          backdrop-blur
          lg:hidden
        "
      >

        <div
          className="
            mx-auto
            grid max-w-lg
            grid-cols-4
          "
        >

          <MobileNavItem
            icon="home"
            label="Home"
            active
            onClick={() =>
              router.push("/dashboard")
            }
          />

          <MobileNavItem
            icon="paddy"
            label="Paddy"
            onClick={() => router.push("/dashboard/listings")}
          />

          <MobileNavItem
            icon="offer"
            label="Offers"
            onClick={() =>
              router.push(
                "/dashboard/bids"
              )
            }
          />

          <MobileNavItem
            icon="user"
            label="Profile"
            onClick={() => router.push("/dashboard/profile")}
          />

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   FARM MODAL
========================================================= */

function FarmModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [farmName, setFarmName] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [landSize, setLandSize] =
    useState("");

  const [mainCrop, setMainCrop] =
    useState("Paddy");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    const token =
      localStorage.getItem(
        "vee_market_token"
      );

    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/farmer/farms`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify({
              farmName,
              location,
              landSize:
                Number(landSize),
              mainCrop,
            }),
          }
        );

      const raw =
        await response.text();

      if (!response.ok) {
        let message =
          "Unable to create farm.";

        try {
          const data =
            JSON.parse(raw);

          message =
            data?.message ||
            data?.error ||
            message;
        } catch {}

        throw new Error(message);
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create farm."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Add New Farm"
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-4"
      >

        <Input
          label="Farm name"
          value={farmName}
          onChange={setFarmName}
          placeholder="My Paddy Farm"
          required
        />

        <Input
          label="Location"
          value={location}
          onChange={setLocation}
          placeholder="Galle"
          required
        />

        <Input
          label="Land size (acres)"
          value={landSize}
          onChange={setLandSize}
          placeholder="2.5"
          type="number"
          required
        />

        <Input
          label="Main crop"
          value={mainCrop}
          onChange={setMainCrop}
          placeholder="Paddy"
          required
        />

        {error && (
          <ErrorBox
            message={error}
          />
        )}

        <button
          disabled={loading}
          className="
            h-12 w-full
            rounded-xl
            bg-[#087f3f]
            font-semibold
            text-white
            transition
            hover:bg-[#066a34]
            disabled:opacity-50
          "
        >
          {loading
            ? "Creating..."
            : "Create Farm"}
        </button>

      </form>
    </Modal>
  );
}

/* =========================================================
   LOT MODAL
========================================================= */

function LotModal({
  farms,
  onClose,
  onSuccess,
}: {
  farms: Farm[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [farmId, setFarmId] =
    useState(
      farms[0]
        ? String(farms[0].id)
        : ""
    );

  const [productType, setProductType] =
    useState("Paddy");

  const [riceType, setRiceType] =
    useState("");

  const [quantityKg, setQuantityKg] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [availableDate, setAvailableDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    const token =
      localStorage.getItem(
        "vee_market_token"
      );

    if (!token) {
      return;
    }

    if (!farmId) {
      setError(
        "Please create a farm first."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/farmer/lots`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify({
              farmId:
                Number(farmId),
              productType,
              riceType,
              quantityKg:
                Number(quantityKg),
              askingPricePerKg:
                Number(price),
              availableDate,
            }),
          }
        );

      const raw =
        await response.text();

      if (!response.ok) {
        let message =
          "Unable to create paddy lot.";

        try {
          const data =
            JSON.parse(raw);

          message =
            data?.message ||
            data?.error ||
            message;
        } catch {}

        throw new Error(message);
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create paddy lot."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="List Paddy"
      onClose={onClose}
    >

      {farms.length === 0 ? (

        <div>

          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
            You need to create a farm before
            listing paddy.
          </div>

          <button
            onClick={onClose}
            className="
              mt-4 h-12 w-full
              rounded-xl
              bg-[#087f3f]
              font-semibold
              text-white
            "
          >
            Close
          </button>

        </div>

      ) : (

        <form
          onSubmit={submit}
          className="space-y-4"
        >

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Farm
            </label>

            <select
              value={farmId}
              onChange={(e) =>
                setFarmId(
                  e.target.value
                )
              }
              className="
                h-12 w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                outline-none
                focus:border-[#087f3f]
                focus:bg-white
              "
            >

              {farms.map(
                (farm) => (
                  <option
                    key={
                      farm.id
                    }
                    value={
                      farm.id
                    }
                  >
                    {farm.farmName ||
                      `Farm ${farm.id}`}
                  </option>
                )
              )}

            </select>

          </div>

          <Input
            label="Product type"
            value={productType}
            onChange={setProductType}
            placeholder="Paddy"
            required
          />

          <Input
            label="Rice type"
            value={riceType}
            onChange={setRiceType}
            placeholder="Nadu"
            required
          />

          <Input
            label="Quantity (kg)"
            value={quantityKg}
            onChange={setQuantityKg}
            placeholder="1000"
            type="number"
            required
          />

          <Input
            label="Asking price per kg"
            value={price}
            onChange={setPrice}
            placeholder="180"
            type="number"
            required
          />

          <Input
            label="Available date"
            value={availableDate}
            onChange={setAvailableDate}
            type="date"
            required
          />

          {error && (
            <ErrorBox
              message={error}
            />
          )}

          <button
            disabled={loading}
            className="
              h-12 w-full
              rounded-xl
              bg-[#087f3f]
              font-semibold
              text-white
              transition
              hover:bg-[#066a34]
              disabled:opacity-50
            "
          >
            {loading
              ? "Creating..."
              : "List Paddy"}
          </button>

        </form>

      )}

    </Modal>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center
        justify-center
        bg-slate-950/45
        p-4
        backdrop-blur-sm
      "
    >

      <div
        className="
          max-h-[90vh]
          w-full max-w-lg
          overflow-y-auto
          rounded-[24px]
          bg-white
          shadow-2xl
        "
      >

        <div
          className="
            flex items-center
            justify-between
            border-b
            border-slate-100
            p-5
          "
        >

          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              text-slate-400
              hover:bg-slate-100
            "
          >
            ✕
          </button>

        </div>

        <div className="p-5">
          {children}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={placeholder}
        className="
          h-12 w-full
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          px-4
          text-sm
          outline-none
          transition
          focus:border-[#087f3f]
          focus:bg-white
          focus:ring-4
          focus:ring-green-100
        "
      />

    </div>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        mb-1
        flex w-full
        items-center gap-3
        rounded-xl
        px-4 py-3
        text-left
        text-sm
        font-semibold
        transition
        ${
          active
            ? "bg-[#eaf7ee] text-[#087f3f]"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }
      `}
    >
      <NavIcon
        type={icon}
        active={active}
      />

      {label}
    </button>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */

function MobileNavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        flex-col
        items-center
        justify-center
        gap-1
        py-1.5
        text-[10px]
        font-semibold
        ${
          active
            ? "text-[#087f3f]"
            : "text-slate-400"
        }
      `}
    >
      <NavIcon
        type={icon}
        active={active}
      />
      {label}
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function DashboardStat({
  icon,
  title,
  value,
  description,
  suffix,
  className,
}: {
  icon: string;
  title: string;
  value: string;
  description: string;
  suffix?: string;
  className:
    | "green"
    | "orange"
    | "blue"
    | "purple";
}) {
  const styles = {
    green: {
      wrapper: "bg-[#eaf7ee]",
      icon: "bg-[#d8f1e0] text-[#087f3f]",
    },
    orange: {
      wrapper: "bg-[#fff3e4]",
      icon: "bg-[#ffe6c5] text-[#ff8a00]",
    },
    blue: {
      wrapper: "bg-[#eef4ff]",
      icon: "bg-[#dde8ff] text-[#2563eb]",
    },
    purple: {
      wrapper: "bg-[#f3edff]",
      icon: "bg-[#e8ddff] text-[#7c3aed]",
    },
  };

  return (
    <div
      className={`
        rounded-[22px]
        border border-slate-200
        bg-white
        p-4
        sm:p-5
      `}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-slate-400 sm:text-sm">
            {title}
          </p>

          <div className="mt-2 flex items-baseline gap-1">

            <span className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {value}
            </span>

            {suffix && (
              <span className="text-xs font-semibold text-slate-400">
                {suffix}
              </span>
            )}

          </div>

          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            {description}
          </p>

        </div>

        <div
          className={`
            flex h-11 w-11
            items-center justify-center
            rounded-2xl
            ${styles[className].wrapper}
          `}
        >
          <div
            className={`
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              ${styles[className].icon}
            `}
          >
            <NavIcon
              type={icon}
              active
            />
          </div>
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   ACTION CARD
========================================================= */

function ActionCard({
  icon,
  title,
  description,
  className,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  className:
    | "green"
    | "orange"
    | "blue"
    | "purple";
  onClick: () => void;
}) {
  const styles = {
    green:
      "bg-[#eaf7ee] hover:bg-[#dcf3e5]",
    orange:
      "bg-[#fff3e4] hover:bg-[#ffebd3]",
    blue:
      "bg-[#eef4ff] hover:bg-[#e3edff]",
    purple:
      "bg-[#f3edff] hover:bg-[#ebe2ff]",
  };

  return (
    <button
      onClick={onClick}
      className={`
        rounded-2xl
        p-4
        text-left
        transition
        ${styles[className]}
      `}
    >

      <div className="flex items-center gap-3">

        <div
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            bg-white/80
          "
        >
          <NavIcon
            type={icon}
            active
          />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">
            {title}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-500">
            {description}
          </p>
        </div>

      </div>

    </button>
  );
}

/* =========================================================
   FARM CARD
========================================================= */

function FarmCard({
  farm,
}: {
  farm: Farm;
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-slate-100
        bg-[#f8fbf9]
        p-4
      "
    >

      <div
        className="
          flex items-center
          gap-3
        "
      >

        <div
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            bg-[#eaf7ee]
          "
        >
          <NavIcon
            type="farm"
            active
          />
        </div>

        <div className="min-w-0">

          <h4 className="truncate text-sm font-bold text-slate-800">
            {farm.farmName ||
              `Farm ${farm.id}`}
          </h4>

          <p className="truncate text-xs text-slate-400">
            {farm.location ||
              "Location not specified"}
          </p>

        </div>

      </div>

      <div
        className="
          mt-3
          flex items-center
          justify-between
          text-xs
          text-slate-500
        "
      >
        <span>
          {farm.landSize || 0} acres
        </span>

        <span>
          {farm.mainCrop ||
            "Paddy"}
        </span>
      </div>

    </div>
  );
}

/* =========================================================
   LOT CARD
========================================================= */

function LotCard({
  lot,
}: {
  lot: PaddyLot;
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-slate-100
        bg-[#f8fbf9]
        p-4
      "
    >

      <div
        className="
          flex flex-col gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-11 w-11
              shrink-0
              items-center justify-center
              rounded-xl
              bg-[#eaf7ee]
            "
          >
            <NavIcon
              type="paddy"
              active
            />
          </div>

          <div>
            <h4 className="font-bold text-slate-800">
              {lot.riceType ||
                lot.productType ||
                "Paddy"}
            </h4>

            <p className="mt-1 text-xs text-slate-400">
              Lot #{lot.id}
              {lot.availableDate
                ? ` • Available ${lot.availableDate}`
                : ""}
            </p>
          </div>

        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-5
            sm:flex
            sm:items-center
          "
        >

          <div>
            <p className="text-[11px] text-slate-400">
              Quantity
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800">
              {formatNumber(
                Number(
                  lot.quantityKg || 0
                )
              )} kg
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">
              Asking price
            </p>

            <p className="mt-1 text-sm font-bold text-[#087f3f]">
              Rs.{" "}
              {formatNumber(
                Number(
                  lot.askingPricePerKg ||
                    0
                )
              )}
              /kg
            </p>
          </div>

          <StatusBadge
            status={
              lot.status || "ACTIVE"
            }
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyBox({
  icon,
  title,
  description,
  button,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-slate-200
        p-7
        text-center
      "
    >

      <div
        className="
          mx-auto
          flex h-12 w-12
          items-center justify-center
          rounded-2xl
          bg-[#eaf7ee]
        "
      >
        <NavIcon
          type={icon}
          active
        />
      </div>

      <h4 className="mt-3 font-bold text-slate-800">
        {title}
      </h4>

      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
        {description}
      </p>

      <button
        onClick={onClick}
        className="
          mt-4
          rounded-xl
          bg-[#087f3f]
          px-4 py-2.5
          text-sm font-semibold
          text-white
          hover:bg-[#066a34]
        "
      >
        {button}
      </button>

    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toUpperCase();

  let className =
    "bg-slate-100 text-slate-600";

  if (
    normalized ===
      "ACTIVE" ||
    normalized ===
      "VERIFIED" ||
    normalized ===
      "ACCEPTED"
  ) {
    className =
      "bg-green-100 text-green-700";
  }

  if (
    normalized ===
      "PENDING"
  ) {
    className =
      "bg-amber-100 text-amber-700";
  }

  if (
    normalized ===
      "REJECTED"
  ) {
    className =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5 py-1
        text-[11px]
        font-bold
        ${className}
      `}
    >
      {status}
    </span>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorBox({
  message,
}: {
  message: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border border-red-100
        bg-red-50
        px-4 py-3
        text-sm
        text-red-700
      "
    >
      {message}
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingScreen() {
  return (
    <main
      className="
        flex min-h-screen
        items-center justify-center
        bg-[#f5f8f6]
      "
    >
      <div className="text-center">

        <div
          className="
            mx-auto
            h-12 w-12
            animate-spin
            rounded-full
            border-4
            border-green-100
            border-t-[#087f3f]
          "
        />

        <p className="mt-4 text-sm text-slate-500">
          Loading Vee Market...
        </p>

      </div>
    </main>
  );
}

/* =========================================================
   ICONS
========================================================= */

function NavIcon({
  type,
  active = false,
}: {
  type: string;
  active?: boolean;
}) {
  const stroke =
    active
      ? "#087f3f"
      : "#64748b";

  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap:
      "round" as const,
    strokeLinejoin:
      "round" as const,
  };

  if (type === "home") {
    return (
      <svg {...common}>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (type === "farm") {
    return (
      <svg {...common}>
        <path d="M3 21h18" />
        <path d="M5 21V8l7-4 7 4v13" />
        <path d="M9 21v-6h6v6" />
        <path d="M9 10h6" />
      </svg>
    );
  }

  if (type === "paddy") {
    return (
      <svg {...common}>
        <path d="M12 20V5" />
        <path d="M12 8c-3-3-6-2-7-2 1 3 3 5 7 5" />
        <path d="M12 11c3-3 6-2 7-2-1 3-3 5-7 5" />
        <path d="M12 14c-3-3-6-2-7-2 1 3 3 5 7 5" />
        <path d="M12 17c3-3 6-2 7-2-1 3-3 5-7 5" />
      </svg>
    );
  }

  if (type === "offer") {
    return (
      <svg {...common}>
        <path d="M20 12v7H4v-7" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 7v12" />
        <path d="M12 7H8.5a2.5 2.5 0 1 1 0-5C10.5 2 12 7 12 7Z" />
        <path d="M12 7h3.5a2.5 2.5 0 1 0 0-5C13.5 2 12 7 12 7Z" />
      </svg>
    );
  }

  if (type === "truck") {
    return (
      <svg {...common}>
        <path d="M3 6h11v10H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    );
  }

  if (type === "payment") {
    return (
      <svg {...common}>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
      </svg>
    );
  }

  if (type === "user" || type === "profile") {
    return (
      <svg {...common}>
        <circle
          cx="12"
          cy="8"
          r="3.5"
        />
        <path d="M5 21c.8-4 3-6 7-6s6.2 2 7 6" />
      </svg>
    );
  }

  if (type === "weight") {
    return (
      <svg {...common}>
        <path d="M7 7h10l2 14H5L7 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
        <path d="M10 12h4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle
        cx="12"
        cy="12"
        r="8"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 20 6v5c0 5-3.3 8.3-8 10-4.7-1.7-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d="M24 5C34 5 36 15 30 23C26 28 21 29 17 29C17 20 18 12 24 5Z"
        fill="#087f3f"
      />

      <path
        d="M16 17C8 18 5 24 8 30C10 34 14 35 18 34C20 29 20 23 16 17Z"
        fill="#41a85f"
      />

      <path
        d="M19 35C20 27 23 19 28 12"
        stroke="#087f3f"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   HELPERS
========================================================= */

async function readJson(
  response: Response
) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status})`
    );
  }

  if (
    !contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    throw new Error(
      "Server returned a non-JSON response."
    );
  }

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

function getInitial(
  email: string
) {
  return (
    email
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "F"
  );
}

function getNameFromEmail(
  email: string
) {
  const value =
    email.split("@")[0] ||
    "Farmer";

  return value
    .split(/[._-]/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);
}