export type Verdict = "benign" | "needs_review" | "phishing";

export type ScanResponse = {
  verdict: Verdict;
  score: number;
  reasons: string[];
  indicators: Record<string, unknown>;
  redactions: { types: Record<string, number>; count: number };
  redacted_body: string;
};


