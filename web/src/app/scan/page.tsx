"use client";

import { useState } from "react";

type FormState = {
  from: string;
  to: string;
  subject: string;
  body: string;
};

export default function ScanPage() {
  const [form, setForm] = useState<FormState>({ from: "", to: "", subject: "", body: "" });
  const [showResult, setShowResult] = useState(false);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowResult(true);
  }

  function handleReset() {
    setForm({ from: "", to: "", subject: "", body: "" });
    setShowResult(false);
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
                type="email"
                value={form.from}
                onChange={(e) => handleChange("from", e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
                placeholder="sender@example.com"
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
          <h2 className="text-lg font-semibold mb-4">Mock Result</h2>
          {!showResult ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">Submit the form to see a mock classification.</p>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 border-yellow-200">
                Suspicious (Mock)
              </div>
              <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                <li>Contains urgent language in subject</li>
                <li>Includes link asking for credentials</li>
                <li>Sender domain mismatches display name</li>
              </ul>
              <details className="rounded-md border p-3 text-sm">
                <summary className="cursor-pointer font-medium">Raw fields preview</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
{JSON.stringify(form, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

