"use client";

import * as React from "react";

type Values = {
  sender: string;
  receiver?: string;
  subject: string;
  body: string;
  url: 0 | 1;
};

type ScanFormProps = {
  onSubmit: (values: Values) => void;
  loading?: boolean;
  initial?: Partial<Values>;
  className?: string;
};

function computeUrlFlag(text: string): 0 | 1 {
  return /https?:\/\/|www\./i.test(text) ? 1 : 0;
}

export default function ScanForm({ onSubmit, loading = false, initial, className = "" }: ScanFormProps) {
  const [sender, setSender] = React.useState(initial?.sender ?? "");
  const [receiver, setReceiver] = React.useState(initial?.receiver ?? "");
  const [subject, setSubject] = React.useState(initial?.subject ?? "");
  const [body, setBody] = React.useState(initial?.body ?? "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!sender || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) next.sender = "Enter a valid sender email";
    if (receiver && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiver)) next.receiver = "Enter a valid recipient email";
    if (!subject || subject.trim().length === 0) next.subject = "Subject is required";
    if (!body || body.trim().length === 0) next.body = "Body is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ sender, receiver: receiver || undefined, subject, body, url: computeUrlFlag(body) });
  }

  function reset() {
    setSender("");
    setReceiver("");
    setSubject("");
    setBody("");
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} aria-describedby="form-hint">
      <p id="form-hint" className="sr-only">Provide the email details to analyze. Required: From, Subject, Body.</p>

      <Field label="From" htmlFor="from" error={errors.sender} required>
        <input
          id="from"
          type="email"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
          placeholder="sender@example.com"
          aria-invalid={!!errors.sender}
          aria-describedby={errors.sender ? "error-from" : undefined}
        />
        {errors.sender && <InlineError id="error-from">{errors.sender}</InlineError>}
      </Field>

      <Field label="To" htmlFor="to" error={errors.receiver}>
        <input
          id="to"
          type="email"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
          placeholder="recipient@example.com (optional)"
          aria-invalid={!!errors.receiver}
          aria-describedby={errors.receiver ? "error-to" : undefined}
        />
        {errors.receiver && <InlineError id="error-to">{errors.receiver}</InlineError>}
      </Field>

      <Field label="Subject" htmlFor="subject" error={errors.subject} required>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
          placeholder="Re: Account Update"
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "error-subject" : undefined}
        />
        {errors.subject && <InlineError id="error-subject">{errors.subject}</InlineError>}
      </Field>

      <Field label="Body" htmlFor="body" error={errors.body} required>
        <textarea
          id="body"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
          placeholder="Paste the email body here..."
          aria-invalid={!!errors.body}
          aria-describedby={errors.body ? "error-body" : undefined}
        />
        {errors.body && <InlineError id="error-body">{errors.body}</InlineError>}
        <div className="text-xs text-slate-500 mt-1">URL flag: {computeUrlFlag(body)}</div>
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, required, error, children }: { label: string; htmlFor: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm mb-1" htmlFor={htmlFor}>{label}{required && <span className="ml-1 text-rose-600">*</span>}</label>
      {children}
      {error && <span className="sr-only">{label} invalid</span>}
    </div>
  );
}

function InlineError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-rose-700">{children}</p>
  );
}


