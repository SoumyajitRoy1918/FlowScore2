import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ResponsePanel } from "@/components/response-panel";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/context/app-context";
import { cn } from "@/lib/utils";
import type { TrustScoreResult } from "@/types/app";

function toneClass(tone: TrustScoreResult["assessment"]["tone"]) {
  switch (tone) {
    case "excellent":
      return "border-emerald-500/30 bg-emerald-500/12 text-emerald-300";
    case "good":
      return "border-lime-500/30 bg-lime-500/12 text-lime-300";
    case "average":
      return "border-amber-500/30 bg-amber-500/12 text-amber-300";
    default:
      return "border-rose-500/30 bg-rose-500/12 text-rose-300";
  }
}

export default function AnalysisPage() {
  const { session, logout, scoreUser, gmailAuthenticated } = useAppContext();
  const defaultUserId = session?.linkedUserId || "demo_user_001";
  const [scoreResult, setScoreResult] = useState<TrustScoreResult | null>(null);
  const [responsePayload, setResponsePayload] = useState<TrustScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!gmailAuthenticated) {
      return;
    }

    let active = true;

    async function loadAnalysis() {
      setLoading(true);
      setErrorMessage("");

      try {
        const result = await scoreUser({ userId: defaultUserId, startDate: "", endDate: "" });
        if (!active) {
          return;
        }
        setScoreResult(result);
        setResponsePayload(result);
      } catch (error) {
        if (!active) {
          return;
        }
        const nextMessage = error instanceof Error ? error.message : "Unable to load analysis.";
        setErrorMessage(nextMessage);
        setScoreResult(null);
        setResponsePayload(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [defaultUserId, gmailAuthenticated, scoreUser]);

  if (!gmailAuthenticated) {
    return (
      <AppShell
        eyebrow="Classification, Trust Index, Explainability"
        title="Run semantic analysis and inspect the scoring logic"
        subtitle="This page uses the backend scoring pipeline after Gmail authentication is completed."
        userName={session?.fullName || "Signed in"}
        onSignOut={logout}
      >
        <SectionCard title="Authentication required" description="Gmail authentication is required to access this page.">
          <div className="flex gap-3">
            <Button onClick={() => (window.location.href = "/transactions")} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
              Go to Transactions
            </Button>
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Classification, Trust Index, Explainability"
      title="Run semantic analysis and inspect the scoring logic"
      subtitle="This page runs the backend scoring pipeline, starting with sort_transaction() and then applying the final_score.py formulas."
      userName={session?.fullName || "Signed in"}
      onSignOut={logout}
    >
      {errorMessage ? (
        <SectionCard title="Analysis Error" description="The backend scoring pipeline could not complete.">
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errorMessage}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Trust Index"
        description="Displays the deterministic trust score and the dimension-level weighted breakdown."
        className="md:col-span-2"
      >
        {scoreResult ? (
          <div className="space-y-4">
            <Card className="border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(99,102,241,0.18),rgba(15,23,42,0.92))] shadow-[0_24px_60px_-28px_rgba(99,102,241,0.45)]">
              <CardContent className="px-6 py-8 text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Trust Index</div>
                <div className="mt-4 text-7xl font-black tracking-[-0.08em] text-white sm:text-8xl">
                  {scoreResult.trustIndex.toFixed(1)}
                  <span className="ml-2 align-middle text-base font-semibold tracking-normal text-slate-400">/ 900</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">Computed from {scoreResult.txCount} transactions.</p>
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-medium text-slate-400">Score Quality</div>
              <Badge className={cn("mt-3 rounded-full border px-3 py-1 text-sm font-semibold", toneClass(scoreResult.assessment.tone))}>
                {scoreResult.assessment.label}
              </Badge>
              <p className="mt-3 text-sm leading-6 text-slate-300">{scoreResult.assessment.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {scoreResult.dimensionBreakdown.map((dimension) => (
                <Card key={dimension.id} className="border-white/10 bg-white/5">
                  <CardContent className="px-5 py-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{dimension.label}</div>
                    <div className="mt-3 text-3xl font-bold text-white">{dimension.score.toFixed(1)}</div>
                    <p className="mt-2 text-sm text-slate-300">Weight {dimension.weight}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">Recommendation</div>
              <h3 className="mt-2 font-[Manrope] text-xl font-bold text-white">{scoreResult.recommendation.headline}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-200">{scoreResult.recommendation.recommendation}</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-200">
                {scoreResult.recommendation.actionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">
            {loading ? "Loading trust index..." : "No analysis result is available yet."}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Explainability"
        description="Score computation details appear here after you generate the Trust Index."
        className="md:col-span-2"
      >
        <ResponsePanel
          data={scoreResult?.explainability || null}
          emptyMessage="Generate a score to inspect explainability details."
        />
      </SectionCard>

      <SectionCard
        title="Response"
        description="Use this panel to inspect the raw response payload for the last action you ran."
        className="md:col-span-2"
      >
        <ResponsePanel
          data={responsePayload}
          emptyMessage="Run classification or scoring to see the full response payload here."
        />
      </SectionCard>
    </AppShell>
  );
}
