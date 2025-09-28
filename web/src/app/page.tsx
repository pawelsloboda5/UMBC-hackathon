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

        

        {/* Footer */}
        <footer className="pt-4 text-center text-sm text-slate-500">
          Try dark mode (add <code>className=&quot;dark&quot;</code> to{" "}
          <code>&lt;html&gt;</code>) to verify dark styles.
        </footer>
      </div>
    </main>
  );
}
