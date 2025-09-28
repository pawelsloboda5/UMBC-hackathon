"use client";

import type { Neighbor } from "@/types/scan";

type NeighborsListProps = {
  neighbors?: Neighbor[] | null;
  className?: string;
  loading?: boolean;
  error?: string | null;
};

function labelStyle(label: Neighbor["label"]) {
  switch (label) {
    case 1:
      return "bg-rose-50 text-rose-800 border-rose-200";
    case 0:
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function NeighborsList({ neighbors, className = "", loading = false, error }: NeighborsListProps) {
  const items = (neighbors ?? []).slice(0, 8);
  const phish = items.filter((n) => n.label === 1);
  const topSimilarity = items[0]?.similarity ?? 0;
  const avgTop3Phish = phish.slice(0, 3).reduce((sum, n) => sum + n.similarity, 0) / Math.max(1, Math.min(3, phish.length));

  return (
    <section className={`rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm ${className}`} aria-labelledby="neighbors-title">
      <h2 id="neighbors-title" className="text-lg font-semibold mb-4">Nearest Neighbors</h2>

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-36 rounded bg-slate-200" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-slate-200" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!neighbors && !loading && !error && (
        <p className="text-sm text-slate-600 dark:text-slate-300">Run AI analysis to see similar emails.</p>
      )}

      {items.length > 0 && !loading && !error && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
            <div><span className="font-medium text-slate-800">Phish neighbors:</span> {phish.length}</div>
            <div><span className="font-medium text-slate-800">Top similarity:</span> {topSimilarity.toFixed(2)}</div>
            <div><span className="font-medium text-slate-800">Avg top‑3 phish:</span> {isFinite(avgTop3Phish) ? avgTop3Phish.toFixed(2) : "0.00"}</div>
          </div>

          <ul role="list" className="space-y-2">
            {items.map((n) => (
              <li key={n.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full ${n.label === 1 ? "bg-rose-500" : n.label === 0 ? "bg-emerald-500" : "bg-slate-400"}`}
                        style={{ width: `${Math.max(0, Math.min(1, n.similarity)) * 100}%` }}
                        aria-hidden
                      />
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-900 dark:text-slate-100" title={n.subject ?? "(no subject)"}>
                      {n.subject ?? "(no subject)"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${labelStyle(n.label)}`}>
                      {n.label === 1 ? "phish" : n.label === 0 ? "legit" : "unknown"}
                    </span>
                    <div className="text-xs text-slate-500">{n.similarity.toFixed(2)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}


