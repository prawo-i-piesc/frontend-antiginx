/**
 * The risk of one scan, 0–100. The same model as backend-antiginx
 * internal/stats/risk.go, which the charts use; change the two together.
 *
 *  1. The worst finding sets the band: one finding scores the bottom of its
 *     severity's band — LOW 5, MEDIUM 25, HIGH 50, CRITICAL 75.
 *  2. Every further finding raises the score, closing its weight's share of
 *     the distance to 100 (1 − Π(1 − w)). More problems never lower the risk.
 *  3. Minor problems do not pass for serious ones: only low findings stop at
 *     49, a medium one at worst at 74, a high one at worst at 94.
 *  4. One cause counts once: on a site without HTTPS, the TLS failure in the
 *     certificate test and the missing HSTS are not counted again.
 *
 * None and Info results are passed; engine notices are not results.
 */

type Weighted = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const WEIGHT: Record<Weighted, number> = { CRITICAL: 0.75, HIGH: 0.5, MEDIUM: 0.25, LOW: 0.05 };
const CAP: Record<Weighted, number> = { CRITICAL: 1, HIGH: 0.94, MEDIUM: 0.74, LOW: 0.49 };

/** Test names as the engine reports them. */
const HTTPS_TEST = "HTTPS Protocol Verification";

/** A failure of the key follows from a failure of the value and is not counted again. */
const CONSEQUENCE_OF: Record<string, string> = {
  "SSL Certificate Security Analysis": HTTPS_TEST,
  "HSTS Header Analysis": HTTPS_TEST,
};

export interface Finding {
  test: string;
  severity: string;
}

/** 0–100, unrounded. */
export function riskScore(findings: readonly Finding[]): number {
  const failed = new Set(findings.map((finding) => finding.test));
  let safe = 1;
  let worst: Weighted | null = null;

  for (const finding of findings) {
    const cause = CONSEQUENCE_OF[finding.test];
    if (cause && failed.has(cause)) continue;
    const upper = finding.severity.trim().toUpperCase();
    // A failed result without a known weight is still a problem, the smallest one.
    const severity: Weighted = upper in WEIGHT ? (upper as Weighted) : "LOW";
    safe *= 1 - WEIGHT[severity];
    if (!worst || WEIGHT[severity] > WEIGHT[worst]) worst = severity;
  }

  return worst ? Math.min(1 - safe, CAP[worst]) * 100 : 0;
}

export type RiskBand = "none" | "low" | "medium" | "high" | "critical";

/** The band a score falls in: 1–24 low, 25–49 medium, 50–74 high, 75–100 critical. */
export function riskBand(score: number): RiskBand {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  if (score > 0) return "low";
  return "none";
}
