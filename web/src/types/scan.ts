export type Verdict = "benign" | "needs_review" | "phishing";

export type ScanResponse = {
  verdict: Verdict;
  score: number;
  reasons: string[];
  indicators: Record<string, unknown>;
  redactions: { types: Record<string, number>; count: number };
  redacted_body: string;
};

export type Neighbor = {
  id: number;
  label: 0 | 1 | null;
  subject?: string;
  body?: string;
  similarity: number; // 0..1
  redactions?: {
    types: Record<string, number>;
    count: number;
  };
};

export type AIAnalyzeOut = {
  phase1: ScanResponse;
  neighbors: Neighbor[];
  phish_neighbors: Neighbor[];
  ai_verdict: Verdict;
  ai_score: number; // 0..10 higher = more likely phishing
  ai_reasons: string[]; // 3-5 concise bullets
};


