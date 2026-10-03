"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://172.18.228.12:8080";

/* =========================================================
   TYPES
========================================================= */

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
    useState<FarmerProfile | null>(
      null
    );

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

  const [mobileMenu, setMobileMenu] =
    useState(false);

  /*
   * Load dashboard.
   */

  useEffect(() => {
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

      /*
       * Authentication failure.
       */

      if (
        farmerResponse.status === 401 ||
        farmerResponse.status === 403
      ) {
        logout();
        return;
      }

      /*
       * Read safely.
       */

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

      /*
       * Some Spring Boot responses
       * may be arrays directly.
       */

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

  /*
   * Statistics
   */

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

  const email =
    localStorage.getItem(
      "vee_market_email"
    ) ||
    "Farmer";

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8f6]">

      {/* =================================================
          MOBILE HEADER
      ================================================= */}

      <header
        className="
          sticky top-0 z-40
          flex h-16
          items-center
          justify-between
          border-b border-slate-200
          bg-white px-4
          lg:hidden
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-green-50
            "
          >
            <LeafIcon />
          </div>

          <span className="font-bold text-[#063b25]">
            Vee Market
          </span>

        </div>

        <button
          onClick={() =>
            setMobileMenu(
              !mobileMenu
            )
          }
          className="
            rounded-lg
            p-2
            text-slate-600
          "
        >
          ☰
        </button>

      </header>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      {mobileMenu && (
        <div
          className="
            fixed inset-x-0 top-16
            z-30
            border-b
            border-slate-200
            bg-white
            p-4
            shadow-lg
            lg:hidden
          "
        >

          <NavItem
            icon="⌂"
            label="Dashboard"
            active
          />

          <NavItem
            icon="🌾"
            label="My Paddy"
          />

          <NavItem
            icon="🏡"
            label="My Farms"
          />

          <NavItem
            icon="💰"
            label="Bids"
          />

          <button
            onClick={logout}
            className="
              mt-4 w-full
              rounded-xl
              bg-red-50
              px-4 py-3
              text-left
              text-sm
              font-medium
              text-red-600
            "
          >
            Logout
          </button>

        </div>
      )}

      <div className="flex min-h-screen">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className="
            fixed inset-y-0 left-0
            hidden w-64
            flex-col
            border-r border-slate-200
            bg-white
            lg:flex
          "
        >

          {/* Logo */}

          <div
            className="
              flex h-20
              items-center
              gap-3
              border-b
              border-slate-100
              px-6
            "
          >

            <div
              className="
                flex h-11 w-11
                items-center justify-center
                rounded-xl
                bg-green-50
              "
            >
              <LeafIcon />
            </div>

            <div>

              <h1 className="font-bold text-[#063b25]">
                Vee Market
              </h1>

              <p className="text-xs text-slate-400">
                Farmer Portal
              </p>

            </div>

          </div>

          {/* Navigation */}

          <nav className="flex-1 p-4">

            <NavItem
              icon="⌂"
              label="Dashboard"
              active
            />

            <NavItem
              icon="🌾"
              label="My Paddy"
            />

            <NavItem
              icon="🏡"
              label="My Farms"
            />

            <NavItem
              icon="💰"
              label="Bids"
            />

            <NavItem
              icon="📦"
              label="Deals"
            />

            <NavItem
              icon="⭐"
              label="Ratings"
            />

          </nav>

          {/* User */}

          <div
            className="
              border-t
              border-slate-100
              p-4
            "
          >

            <div
              className="
                flex items-center gap-3
                rounded-xl
                bg-slate-50
                p-3
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
                {getInitial(
                  email
                )}
              </div>

              <div className="min-w-0 flex-1">

                <p
                  className="
                    truncate
                    text-sm font-medium
                    text-slate-800
                  "
                >
                  {email}
                </p>

                <p className="text-xs text-slate-400">
                  Farmer
                </p>

              </div>

            </div>

            <button
              onClick={logout}
              className="
                mt-3 w-full
                rounded-xl
                px-3 py-2.5
                text-left
                text-sm
                font-medium
                text-red-600
                hover:bg-red-50
              "
            >
              ↪ Logout
            </button>

          </div>

        </aside>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section
          className="
            w-full
            lg:ml-64
          "
        >

          {/* Desktop topbar */}

          <div
            className="
              hidden h-20
              items-center
              justify-between
              border-b
              border-slate-200
              bg-white
              px-8
              lg:flex
            "
          >

            <div>

              <p className="text-sm text-slate-400">
                Farmer Dashboard
              </p>

              <h2 className="text-xl font-bold text-slate-900">
                Welcome back 👋
              </h2>

            </div>

            <div className="flex items-center gap-4">

              <button
                className="
                  relative
                  rounded-xl
                  border
                  border-slate-200
                  p-2.5
                  text-slate-500
                "
              >
                🔔

                <span
                  className="
                    absolute right-2
                    top-2 h-2 w-2
                    rounded-full
                    bg-green-500
                  "
                />

              </button>

              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-full
                  bg-[#087f3f]
                  font-bold
                  text-white
                "
              >
                {getInitial(
                  email
                )}
              </div>

            </div>

          </div>

          {/* Content */}

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
                  rounded-xl
                  border border-red-100
                  bg-red-50
                  px-4 py-3
                  text-sm
                  text-red-700
                "
              >

                <span>
                  {error}
                </span>

                <button
                  onClick={
                    loadDashboard
                  }
                  className="
                    font-semibold
                    underline
                  "
                >
                  Retry
                </button>

              </div>
            )}

            {/* Welcome */}

            <div
              className="
                mb-6
                overflow-hidden
                rounded-2xl
                bg-gradient-to-r
                from-[#075f31]
                to-[#0b8d48]
                p-6
                text-white

                sm:p-8
              "
            >

              <div className="max-w-2xl">

                <p
                  className="
                    text-sm
                    text-green-100
                  "
                >
                  Welcome to Vee Market
                </p>

                <h1
                  className="
                    mt-1
                    text-2xl
                    font-bold

                    sm:text-3xl
                  "
                >
                  Sell your paddy
                  with confidence.
                </h1>

                <p
                  className="
                    mt-3
                    max-w-xl
                    text-sm
                    leading-6
                    text-green-50
                  "
                >
                  Connect with verified
                  mills, receive competitive
                  bids and manage your
                  paddy supply from one place.
                </p>

                <div
                  className="
                    mt-5 flex
                    flex-wrap gap-3
                  "
                >

                  <button
                    onClick={() =>
                      setShowLotForm(
                        true
                      )
                    }
                    className="
                      rounded-xl
                      bg-white
                      px-5 py-3
                      text-sm
                      font-semibold
                      text-[#087f3f]
                      shadow-lg
                    "
                  >
                    + List Paddy
                  </button>

                  <button
                    onClick={() =>
                      setShowFarmForm(
                        true
                      )
                    }
                    className="
                      rounded-xl
                      border
                      border-white/30
                      bg-white/10
                      px-5 py-3
                      text-sm
                      font-semibold
                      text-white
                      backdrop-blur
                    "
                  >
                    + Add Farm
                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div
              className="
                grid grid-cols-1
                gap-4

                sm:grid-cols-2
                xl:grid-cols-4
              "
            >

              <StatCard
                icon="🏡"
                title="My Farms"
                value={totalFarms}
                subtitle="Registered farms"
              />

              <StatCard
                icon="🌾"
                title="Paddy Lots"
                value={totalLots}
                subtitle="Total listings"
              />

              <StatCard
                icon="🟢"
                title="Active Lots"
                value={activeLots}
                subtitle="Currently available"
              />

              <StatCard
                icon="⚖️"
                title="Paddy Quantity"
                value={`${formatNumber(
                  totalQuantity
                )} kg`}
                subtitle="Total listed quantity"
              />

            </div>

            {/* =================================================
                TWO COLUMNS
            ================================================= */}

            <div
              className="
                mt-6 grid
                grid-cols-1
                gap-6

                xl:grid-cols-3
              "
            >

              {/* Farms */}

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
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
                      setShowFarmForm(
                        true
                      )
                    }
                    className="
                      rounded-lg
                      bg-green-50
                      px-3 py-2
                      text-sm
                      font-semibold
                      text-[#087f3f]
                    "
                  >
                    +
                  </button>

                </div>

                <div className="p-4">

                  {farms.length === 0 ? (

                    <EmptyState
                      icon="🏡"
                      title="No farms yet"
                      description="Add your first farm to start listing paddy."
                      button="Add Farm"
                      onClick={() =>
                        setShowFarmForm(
                          true
                        )
                      }
                    />

                  ) : (

                    <div className="space-y-3">

                      {farms
                        .slice(0, 5)
                        .map(
                          (farm) => (
                            <FarmCard
                              key={
                                farm.id
                              }
                              farm={
                                farm
                              }
                            />
                          )
                        )}

                    </div>

                  )}

                </div>

              </div>

              {/* Paddy */}

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
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
                      Recent Paddy Lots
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Your latest paddy listings
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setShowLotForm(
                        true
                      )
                    }
                    className="
                      rounded-xl
                      bg-[#087f3f]
                      px-4 py-2.5
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    + List Paddy
                  </button>

                </div>

                <div className="p-4">

                  {lots.length === 0 ? (

                    <EmptyState
                      icon="🌾"
                      title="No paddy lots"
                      description="Create your first paddy listing."
                      button="List Paddy"
                      onClick={() =>
                        setShowLotForm(
                          true
                        )
                      }
                    />

                  ) : (

                    <div className="space-y-3">

                      {lots
                        .slice(0, 6)
                        .map(
                          (lot) => (
                            <LotCard
                              key={
                                lot.id
                              }
                              lot={
                                lot
                              }
                            />
                          )
                        )}

                    </div>

                  )}

                </div>

              </div>

            </div>

            {/* Verification */}

            <div
              className="
                mt-6
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
              "
            >

              <div className="flex items-start gap-4">

                <div
                  className="
                    flex h-12 w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-green-50
                    text-xl
                  "
                >
                  ✓
                </div>

                <div className="flex-1">

                  <h3 className="font-bold text-slate-900">
                    Farmer Verification
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your account verification
                    status.
                  </p>

                  <div className="mt-3">

                    <StatusBadge
                      status={
                        farmer?.verificationStatus ||
                        "PENDING"
                      }
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

      {/* =================================================
          FARM MODAL
      ================================================= */}

      {showFarmForm && (
        <FarmModal
          onClose={() =>
            setShowFarmForm(
              false
            )
          }
          onSuccess={() => {
            setShowFarmForm(
              false
            );

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
            setShowLotForm(
              false
            )
          }
          onSuccess={() => {
            setShowLotForm(
              false
            );

            loadDashboard();
          }}
        />
      )}

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

        throw new Error(
          message
        );
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
          label="Land size"
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

        throw new Error(
          message
        );
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
            You need to create a farm
            before listing paddy.
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

            <label className="mb-2 block text-sm font-medium">
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
            onChange={
              setProductType
            }
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
            onChange={
              setQuantityKg
            }
            placeholder="1000"
            type="number"
            required
          />

          <Input
            label="Asking price per kg"
            value={price}
            onChange={setPrice}
            placeholder="150"
            type="number"
            required
          />

          <Input
            label="Available date"
            value={availableDate}
            onChange={
              setAvailableDate
            }
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
        bg-black/40
        p-4
        backdrop-blur-sm
      "
    >

      <div
        className="
          max-h-[90vh]
          w-full max-w-lg
          overflow-y-auto
          rounded-2xl
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
              rounded-lg
              p-2
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
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p
            className="
              mt-2
              text-2xl
              font-bold
              text-slate-900
            "
          >
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>

        </div>

        <div
          className="
            flex h-11 w-11
            items-center
            justify-center
            rounded-xl
            bg-green-50
            text-xl
          "
        >
          {icon}
        </div>

      </div>

    </div>
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
        rounded-xl
        border
        border-slate-100
        bg-slate-50
        p-4
      "
    >

      <div className="flex items-center gap-3">

        <div
          className="
            flex h-10 w-10
            items-center
            justify-center
            rounded-xl
            bg-green-100
            text-lg
          "
        >
          🌾
        </div>

        <div className="min-w-0">

          <h4 className="truncate text-sm font-semibold text-slate-800">
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
          mt-3 flex
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
        flex flex-col
        gap-4
        rounded-xl
        border
        border-slate-100
        bg-slate-50
        p-4

        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >

      <div className="flex items-center gap-3">

        <div
          className="
            flex h-11 w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-green-100
            text-xl
          "
        >
          🌾
        </div>

        <div>

          <h4 className="font-semibold text-slate-800">
            {lot.riceType ||
              lot.productType ||
              "Paddy"}
          </h4>

          <p className="mt-1 text-xs text-slate-400">
            {lot.availableDate
              ? `Available ${lot.availableDate}`
              : "Availability date not specified"}
          </p>

        </div>

      </div>

      <div
        className="
          flex
          items-center
          gap-6
        "
      >

        <div>

          <p className="text-xs text-slate-400">
            Quantity
          </p>

          <p className="font-semibold text-slate-800">
            {formatNumber(
              Number(
                lot.quantityKg || 0
              )
            )}{" "}
            kg
          </p>

        </div>

        <div>

          <p className="text-xs text-slate-400">
            Asking price
          </p>

          <p className="font-semibold text-[#087f3f]">
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
            lot.status ||
            "ACTIVE"
          }
        />

      </div>

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
    "VERIFIED"
  ) {
    className =
      "bg-green-100 text-green-700";
  }

  if (
    normalized ===
    "ACTIVE"
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
        text-xs
        font-semibold
        ${className}
      `}
    >
      {status}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
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
        flex
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-slate-200
        p-8
        text-center
      "
    >

      <div className="text-3xl">
        {icon}
      </div>

      <h4 className="mt-3 font-semibold text-slate-800">
        {title}
      </h4>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        {description}
      </p>

      <button
        onClick={onClick}
        className="
          mt-4
          rounded-xl
          bg-[#087f3f]
          px-4 py-2.5
          text-sm
          font-semibold
          text-white
        "
      >
        {button}
      </button>

    </div>
  );
}

/* =========================================================
   NAV
========================================================= */

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`
        mb-1 flex w-full
        items-center gap-3
        rounded-xl
        px-4 py-3
        text-sm
        font-medium
        transition

        ${
          active
            ? "bg-green-50 text-[#087f3f]"
            : "text-slate-500 hover:bg-slate-50"
        }
      `}
    >
      <span className="text-lg">
        {icon}
      </span>

      {label}
    </button>
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
        items-center
        justify-center
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
      .toUpperCase() || "F"
  );
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

/* =========================================================
   LEAF ICON
========================================================= */

function LeafIcon() {
  return (
    <svg
      width="28"
      height="28"
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