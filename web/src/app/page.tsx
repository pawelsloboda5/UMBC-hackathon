import Image from "next/image";

type Health = { status?: string; db?: boolean };

export default async function Home() {
  const api =
  // When rendering on the server (inside the container), use internal URL
  (process.env.NEXT_RUNTIME === "nodejs"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:8000";

  let health: Health = {};
  try {
    const res = await fetch(`${api}/health`, { cache: "no-store" });
    health = await res.json();
  } catch {
    health = { status: "down", db: false };
  }

  const apiOk = health.status === "ok";
  const dbOk = Boolean(health.db);

  const badge = (ok: boolean) =>
    `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
      ok
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-red-100 text-red-700 border-red-200"
    }`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={26}
            priority
          />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tailwind Test Page
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300">
          Next.js 15 + Tailwind + FastAPI + Postgres 17
        </p>

        {/* Health badges */}
        <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Health Checks</h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className={badge(apiOk)}>API: {apiOk ? "ok" : "down"}</span>
            <span className={badge(dbOk)}>DB: {dbOk ? "ok" : "down"}</span>
            <code className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs">
              {api}/health
            </code>
          </div>
        </section>

        {/* Typography & spacing */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="text-base font-semibold mb-3">Typography</h3>
            <p className="text-2xl font-bold">text-2xl / bold</p>
            <p className="text-lg text-slate-600">text-lg / slate-600</p>
            <p className="text-sm uppercase tracking-wide mt-2">
              text-sm / uppercase / tracking
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <h3 className="text-base font-semibold mb-3">Buttons & States</h3>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                Primary
              </button>
              <button className="rounded-lg border px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                Outline
              </button>
              <button className="rounded-full border px-4 py-2 text-sm hover:shadow">
                Pill
              </button>
            </div>
          </div>
        </section>

        {/* Grid, colors, radius, shadows */}
        <section>
          <h3 className="text-base font-semibold mb-3">
            Grid + Colors + Shadows
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-100 p-5 shadow-sm">
              <p className="font-medium text-blue-900">Card A</p>
              <p className="text-sm text-blue-900/70">from-blue-50 → indigo-100</p>
            </div>
            <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-teal-100 p-5 shadow-sm">
              <p className="font-medium text-emerald-900">Card B</p>
              <p className="text-sm text-emerald-900/70">emerald/teal gradient</p>
            </div>
            <div className="rounded-2xl border bg-gradient-to-br from-rose-50 to-pink-100 p-5 shadow-sm">
              <p className="font-medium text-rose-900">Card C</p>
              <p className="text-sm text-rose-900/70">rose/pink gradient</p>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="rounded-2xl border p-6">
          <h3 className="text-base font-semibold mb-3">Links</h3>
          <div className="flex flex-wrap gap-4">
            <a
              className="underline underline-offset-4 hover:text-blue-600"
              href="https://tailwindcss.com/docs"
              target="_blank"
              rel="noreferrer"
            >
              Tailwind Docs
            </a>
            <a
              className="underline underline-offset-4 hover:text-blue-600"
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noreferrer"
            >
              Next.js Docs
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 text-center text-sm text-slate-500">
          Try dark mode (add <code>className=&quot;dark&quot;</code> to{" "}
          <code>&lt;html&gt;</code>) to verify dark styles.
        </footer>
      </div>
    </main>
  );
}
