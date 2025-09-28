"use client";

import { useState } from "react";
import type { ScanResponse } from "@/types/scan";

type FormState = {
  from: string;
  to: string;
  subject: string;
  body: string;
};

export default function ScanPage() {
  const [form, setForm] = useState<FormState>({ from: "", to: "", subject: "", body: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          from: form.from,
          to: form.to || undefined,
          subject: form.subject,
          body: form.body,
        }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as ScanResponse;
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm({ from: "", to: "", subject: "", body: "" });
    setResult(null);
    setError(null);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8">
      <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-4">Email Scan</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="from">From</label>
              <input
                id="from"
                type="text"
                value={form.from}
                onChange={(e) => handleChange("from", e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
                placeholder="sender (any text)"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="to">To</label>
              <input
                id="to"
                type="email"
                value={form.to}
                onChange={(e) => handleChange("to", e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
                placeholder="recipient@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
                placeholder="Re: Account Update"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="body">Body</label>
              <textarea
                id="body"
                rows={8}
                value={form.body}
                onChange={(e) => handleChange("body", e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
                placeholder="Paste the email body here..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                Analyze
              </button>
              <button type="button" onClick={handleReset} className="rounded-lg border px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Result</h2>
          {!result && !loading && !error && (
            <p className="text-sm text-slate-600 dark:text-slate-300">Submit the form to analyze the email.</p>
          )}
          {loading && (
            <p className="text-sm text-slate-600 dark:text-slate-300">Analyzing…</p>
          )}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          {result && (
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium border-slate-200"
                style={{
                  backgroundColor:
                    result.verdict === "phishing" ? "#fee2e2" : result.verdict === "needs_review" ? "#fef9c3" : "#dcfce7",
                  color:
                    result.verdict === "phishing" ? "#991b1b" : result.verdict === "needs_review" ? "#854d0e" : "#166534",
                }}
              >
                {result.verdict.toUpperCase()} · Score {result.score}
              </div>
              {result.reasons.length > 0 && (
                <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {result.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
              <details className="rounded-md border p-3 text-sm">
                <summary className="cursor-pointer font-medium">Indicators</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs">{JSON.stringify(result.indicators, null, 2)}</pre>
              </details>
              <details className="rounded-md border p-3 text-sm">
                <summary className="cursor-pointer font-medium">PII Redactions</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs">{JSON.stringify(result.redactions, null, 2)}</pre>
              </details>
              <details className="rounded-md border p-3 text-sm">
                <summary className="cursor-pointer font-medium">Redacted Body</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs">{result.redacted_body}</pre>
              </details>
              <details className="rounded-md border p-3 text-sm">
                <summary className="cursor-pointer font-medium">Submitted Fields</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs">{JSON.stringify(form, null, 2)}</pre>
              </details>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

