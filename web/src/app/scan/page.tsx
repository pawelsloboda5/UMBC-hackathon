"use client";

import * as React from "react";
import ScanForm from "@/components/ScanForm";
import VerdictBadge from "@/components/VerdictBadge";
import ScanStepper from "@/components/ScanStepper";
import Phase1Card from "@/components/Phase1Card";
import AIInsightsCard from "@/components/AIInsightsCard";
import NeighborsList from "@/components/NeighborsList";
import RedactionsPanel from "@/components/RedactionsPanel";
import type { ScanResponse, AIAnalyzeOut } from "@/types/scan";

type Step = 0 | 1 | 2; // 0: Input, 1: Phase-1, 2: AI

export default function ScanPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const envMissing = !apiBase;

  const [step, setStep] = React.useState<Step>(0);
  const [phase1, setPhase1] = React.useState<ScanResponse | null>(null);
  const [ai, setAI] = React.useState<AIAnalyzeOut | null>(null);
  const [phase1Error, setPhase1Error] = React.useState<string | null>(null);
  const [aiError, setAIError] = React.useState<string | null>(null);
  const [loadingPhase1, setLoadingPhase1] = React.useState(false);
  const [loadingAI, setLoadingAI] = React.useState(false);

  const abortRefs = React.useRef<{ scan?: AbortController; ai?: AbortController }>({});
  const lastRawBody = React.useRef<string>("");

  function parseErrorResponse(status: number, detail: unknown): string {
    if (typeof detail === "string") return `HTTP ${status}: ${detail}`;
    if (detail && typeof detail === "object") {
      const anyDetail = detail as any;
      const msg = anyDetail.error || anyDetail.detail || anyDetail.message;
      return msg ? `HTTP ${status}: ${String(msg)}` : `HTTP ${status}: Request failed`;
    }
    return `HTTP ${status}: Request failed`;
  }

  async function fetchJson<T>(url: string, init: RequestInit & { signal?: AbortSignal }): Promise<T> {
    const res = await fetch(url, init);
    if (!res.ok) {
      let detail: unknown = null;
      try {
        detail = await res.json();
      } catch {
        try {
          detail = await res.text();
        } catch {
          detail = null;
        }
      }
      throw new Error(parseErrorResponse(res.status, detail));
    }
    return (await res.json()) as T;
  }

  function handleSubmit(values: { sender: string; receiver?: string; subject: string; body: string; url: 0 | 1 }) {
    if (envMissing) return;

    // Abort any in-flight requests
    abortRefs.current.scan?.abort();
    abortRefs.current.ai?.abort();

    setStep(1);
    setPhase1(null);
    setAI(null);
    setPhase1Error(null);
    setAIError(null);
    setLoadingPhase1(true);
    setLoadingAI(false);
    lastRawBody.current = values.body;

    // Progressive UX: call /scan first, then /ai/analyze
    const scanController = new AbortController();
    abortRefs.current.scan = scanController;
    const payload = JSON.stringify({
      sender: values.sender,
      receiver: values.receiver,
      subject: values.subject,
      body: values.body,
      url: values.url,
    });

    fetchJson<ScanResponse>(`${apiBase}/scan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      signal: scanController.signal,
    })
      .then((data) => {
        setPhase1(data);
      })
      .catch((err) => {
        if (scanController.signal.aborted) return;
        setPhase1Error(String(err));
      })
      .finally(() => {
        if (scanController.signal.aborted) return;
        setLoadingPhase1(false);
        // Kick off AI regardless; it also returns Phase-1 for consolidation
        setStep(2);
        const aiController = new AbortController();
        abortRefs.current.ai = aiController;
        setLoadingAI(true);
        fetchJson<AIAnalyzeOut>(`${apiBase}/ai/analyze`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: payload,
          signal: aiController.signal,
        })
          .then((data) => {
            setAI(data);
            // Prefer AI's embedded Phase‑1 for consistency
            if (data?.phase1) setPhase1(data.phase1);
          })
          .catch((err) => {
            if (aiController.signal.aborted) return;
            setAIError(String(err));
          })
          .finally(() => {
            if (aiController.signal.aborted) return;
            setLoadingAI(false);
          });
      });
  }

  React.useEffect(() => {
    return () => {
      abortRefs.current.scan?.abort();
      abortRefs.current.ai?.abort();
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <VerdictBadge phase1Verdict={phase1?.verdict} aiVerdict={ai?.ai_verdict} className="text-base" />
            <span className="text-sm text-slate-500">{phase1 ? `Score ${phase1.score}` : "Awaiting input"}</span>
          </div>
          <ScanStepper step={step} loadingPhase1={loadingPhase1} loadingAI={loadingAI} />
        </div>

        {envMissing && (
          <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            NEXT_PUBLIC_API_URL is not configured. Set it to your FastAPI base URL.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
            <h1 className="text-xl font-semibold mb-4">Email Scan</h1>
            <ScanForm onSubmit={handleSubmit} loading={loadingPhase1 || loadingAI} />
          </section>

          <div className="space-y-6">
            <Phase1Card data={phase1} loading={loadingPhase1} error={phase1Error} />
            <AIInsightsCard data={ai ? { ai_verdict: ai.ai_verdict, ai_reasons: ai.ai_reasons } : null} loading={loadingAI} error={aiError} />
          </div>

          <NeighborsList neighbors={ai?.neighbors ?? null} loading={loadingAI && !ai} error={aiError} className="lg:col-span-2" />

          <RedactionsPanel
            redactions={(ai?.phase1 ?? phase1 ?? null)?.redactions ?? null}
            redactedBody={(ai?.phase1 ?? phase1 ?? null)?.redacted_body ?? null}
            rawBody={lastRawBody.current}
            loading={loadingPhase1 && !phase1}
            error={phase1Error}
            className="lg:col-span-2"
          />
        </div>
      </div>
    </main>
  );
}

