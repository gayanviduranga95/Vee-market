export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-green-700">
              Vee Market
            </h1>
            <p className="text-sm text-slate-500">
              Paddy & Rice Marketplace
            </p>
          </div>

          <button className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800">
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 font-medium text-green-700">
            FAIR • TRUSTED • CONNECTED
          </p>

          <h2 className="text-5xl font-bold leading-tight text-slate-900">
            Connecting farmers,
            <br />
            mills and buyers.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Vee Market connects farmers with mills and buyers through
            transparent paddy trading, verified moisture readings and
            competitive bidding.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="rounded-xl bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800">
              Get Started
            </button>

            <button className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-100">
              Explore Market
            </button>
          </div>
        </div>

        {/* Role cards */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <RoleCard
            title="Farmer"
            description="List your paddy, record moisture and receive competitive bids from mills."
            icon="🌾"
          />

          <RoleCard
            title="Small Mill"
            description="Discover nearby paddy lots, check quality and place bids."
            icon="🏭"
          />

          <RoleCard
            title="Shop / Hotel"
            description="Create rice orders and receive offers from mills."
            icon="🏪"
          />
        </div>
      </section>
    </main>
  );
}

function RoleCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-4xl">{icon}</div>

      <h3 className="mt-5 text-xl font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}