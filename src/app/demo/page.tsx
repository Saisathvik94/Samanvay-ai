"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Users2,
  LayoutDashboard,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DemoWalkthroughPage() {
  const {
    overlaps,
    complaints,
    currentOfficer,
    isAnalyzing,
    runSimulatedAnalysis,
    confirmOverlap,
    requestCoordination,
    resetToDefaults,
  } = useSamanvayStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [demoNotes, setDemoNotes] = useState(
    "Verified duplicate allegation: Extortion of ₹45,000 corporate training charge and withholding class 12 marksheets at Apex Institute."
  );
  const [createdCoordId, setCreatedCoordId] = useState<string | null>(null);

  // Retrieve Demo Scenario A records
  const demoOverlap = overlaps.find((o) => o.id === "OVL-2026-001") || overlaps[0];
  const caseA = complaints.find((c) => c.id === demoOverlap?.caseAId);
  const caseB = complaints.find((c) => c.id === demoOverlap?.caseBId);

  const steps = [
    {
      step: 1,
      title: "Fragmented Multi-Bureau Filings",
      desc: "Isolated complaints submitted to PGRC and RB independently without cross-bureau visibility.",
    },
    {
      step: 2,
      title: "Explainable AI Matching",
      desc: "Samanvay engine resolves institution identity and compares semantic allegations.",
    },
    {
      step: 3,
      title: "Officer Adjudication",
      desc: "Human-in-the-loop review to validate or dismiss algorithm-flagged overlap.",
    },
    {
      step: 4,
      title: "Cross-Bureau Coordination Hub",
      desc: "Assign a lead coordinator and formulate unified regulatory enforcement.",
    },
    {
      step: 5,
      title: "Unified Monitoring & Audit",
      desc: "Live reflection in regulatory dashboard, 360° institution profile, and audit trail.",
    },
  ];

  const handleStep2RunAnalysis = async () => {
    await runSimulatedAnalysis(demoOverlap.id);
  };

  const handleStep3Confirm = () => {
    confirmOverlap(demoOverlap.id, demoNotes, currentOfficer.name);
    setCurrentStep(4);
  };

  const handleStep4CreateCoord = () => {
    const id = requestCoordination(
      demoOverlap.id,
      "Joint hearing with Apex Institute Chairman; immediate order to release withheld original marksheets.",
      currentOfficer
    );
    setCreatedCoordId(id);
    setCurrentStep(5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
              SIH 2026 Guided Demonstration
            </h1>
            <Badge variant="warning" size="sm">
              Problem Statement 26264
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive step-by-step evaluation walkthrough illustrating the end-to-end Samanvay regulatory intelligence journey.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset demo data to initial state?")) {
                resetToDefaults();
                setCurrentStep(1);
                setCreatedCoordId(null);
              }
            }}
            className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Walkthrough
          </Button>
        </div>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {steps.map((s) => {
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;

          return (
            <div
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                isActive
                  ? "bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500"
                  : isDone
                  ? "bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50"
                  : "bg-white border-border hover:border-slate-300 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Step {s.step}</span>
              </div>
              <p className="font-semibold text-neutral-900 mt-2 truncate">{s.title}</p>
            </div>
          );
        })}
      </div>

      {/* STEP 1: FRAGMENTED CASES */}
      {currentStep === 1 && (
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                Step 1 of 5
              </span>
              <div>
                <CardTitle>The Challenge: Fragmented Bureau Silos</CardTitle>
                <CardDescription>
                  Two distinct complaints received concerning Apex Institute of Engineering &amp; Technology (Jaipur)
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <p className="text-xs text-slate-700 leading-relaxed">
            In existing legacy setups, Complaint <strong className="font-mono text-blue-700">{caseA?.id}</strong> is logged via CPGRAMS in <strong>Public Grievance Redressal Cell (PGRC)</strong>, while Complaint <strong className="font-mono text-blue-700">{caseB?.id}</strong> is emailed as a formal petition directly to the <strong>Regulation Bureau (RB)</strong>. Both bureaus begin independent investigations unaware of the duplicate filing, squandering administrative hours.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {caseA && (
              <div className="p-3.5 rounded-lg border border-border bg-slate-50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600">{caseA.id}</span>
                  <Badge variant="secondary">{caseA.bureau.split(" ")[0]}</Badge>
                </div>
                <p className="font-semibold text-neutral-900">{caseA.subject}</p>
                <p className="text-[11px] text-slate-600 line-clamp-3">{caseA.description}</p>
                <div className="pt-1 text-[10px] text-slate-500">
                  Officer: <strong>{caseA.assignedOfficer.name}</strong> • Received: {caseA.dateReceived}
                </div>
              </div>
            )}

            {caseB && (
              <div className="p-3.5 rounded-lg border border-border bg-slate-50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-700">{caseB.id}</span>
                  <Badge variant="secondary">{caseB.bureau.split(" ")[0]}</Badge>
                </div>
                <p className="font-semibold text-neutral-900">{caseB.subject}</p>
                <p className="text-[11px] text-slate-600 line-clamp-3">{caseB.description}</p>
                <div className="pt-1 text-[10px] text-slate-500">
                  Officer: <strong>{caseB.assignedOfficer.name}</strong> • Received: {caseB.dateReceived}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button size="sm" onClick={() => setCurrentStep(2)} className="gap-1.5 text-xs">
              Proceed to Step 2: AI Matching &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: EXPLAINABLE AI MATCHING */}
      {currentStep === 2 && (
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                Step 2 of 5
              </span>
              <div>
                <CardTitle>Samanvay Intelligence: Hybrid Matching &amp; Evidence Generation</CardTitle>
                <CardDescription>
                  Resolving permanent institute identity and extracting explainable semantic vectors
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStep2RunAnalysis}
              isLoading={isAnalyzing}
              className="text-xs gap-1.5 border-blue-200 text-blue-700 bg-blue-50/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Re-run Simulated Matching
            </Button>
          </CardHeader>

          <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900">
                AICTE Permanent ID Match: 1-3329011401 (100% Deterministic)
              </span>
              <Badge variant="warning">{demoOverlap.classification}</Badge>
            </div>
            <p className="text-blue-800 text-[11px]">
              The engine resolved both complaints to <strong>Apex Institute of Engineering &amp; Technology (Jaipur)</strong> using canonical entity normalization, bypassing differences in petitioner spelling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded border border-border bg-white space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">1. Semantic Similarity</span>
              <p className="text-lg font-bold text-blue-600">{demoOverlap.evidence.semanticSimilarity.score}%</p>
              <p className="text-[10px] text-slate-500">Vector cosine similarity over allegation texts</p>
            </div>

            <div className="p-3 rounded border border-border bg-white space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">2. Shared Key Phrases</span>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {demoOverlap.evidence.semanticSimilarity.keyPhrases.slice(0, 3).map((p, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-700">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded border border-border bg-white space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">3. Classification Hypothesis</span>
              <p className="text-sm font-bold text-amber-900">{demoOverlap.classification}</p>
              <p className="text-[10px] text-slate-500">Materially identical demand with certificate retention</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)} className="text-xs">
              &larr; Back
            </Button>
            <Button size="sm" onClick={() => setCurrentStep(3)} className="gap-1.5 text-xs">
              Proceed to Step 3: Officer Validation &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: OFFICER VALIDATION */}
      {currentStep === 3 && (
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                Step 3 of 5
              </span>
              <div>
                <CardTitle>Human-in-the-Loop: Officer Adjudication</CardTitle>
                <CardDescription>
                  AI proposes relationships; authorized administrative officers make binding regulatory decisions
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-2 text-amber-900">
            <p className="font-semibold text-amber-950">
              Reviewing Officer: {currentOfficer.name} ({currentOfficer.bureau} • {currentOfficer.designation})
            </p>
            <p className="text-[11px] leading-relaxed">
              Based on the explainable evidence, please record your formal finding. You can confirm the match to prevent duplicate inquiries or mark it unrelated if complaints address independent campus incidents.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-semibold text-neutral-800 block">
              Official Finding &amp; Endorsement Memo
            </label>
            <textarea
              rows={3}
              value={demoNotes}
              onChange={(e) => setDemoNotes(e.target.value)}
              className="w-full p-2.5 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="text-xs">
              &larr; Back
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  alert("Algorithm finding marked unrelated. Case will proceed independently.");
                  setCurrentStep(1);
                }}
                className="text-xs"
              >
                Mark Unrelated
              </Button>
              <Button size="sm" onClick={handleStep3Confirm} className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Match &amp; Proceed to Coordination &rarr;
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: CROSS-BUREAU COORDINATION */}
      {currentStep === 4 && (
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                Step 4 of 5
              </span>
              <div>
                <CardTitle>Cross-Bureau Coordination: Assign Lead &amp; Formulate Joint Action</CardTitle>
                <CardDescription>
                  Merge inquiries into a single unified regulatory track under one designated owner
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <p className="text-xs text-slate-700 leading-relaxed">
            By establishing an inter-bureau coordination task, PGRC and Regulation Bureau will synchronize their hearings. Rather than sending two conflicting notices, AICTE issues a single joint notice to Apex Institute, mandating fee refund and immediate return of student marksheets.
          </p>

          <div className="p-3 bg-slate-50 rounded border border-border text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Designated Task Lead:</span>
              <span className="font-semibold text-neutral-900">{currentOfficer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bureaus Involved:</span>
              <span className="font-medium text-slate-800">Public Grievance Redressal Cell &amp; Regulation Bureau</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Action Plan:</span>
              <span className="font-medium text-blue-800">Joint show-cause notice &amp; physical verification of original marksheets</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)} className="text-xs">
              &larr; Back
            </Button>
            <Button size="sm" onClick={handleStep4CreateCoord} className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700">
              <Users2 className="w-3.5 h-3.5" /> Launch Joint Coordination Task &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: UPDATED SYSTEM & VERIFICATION */}
      {currentStep === 5 && (
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                Step 5 of 5 — Complete
              </span>
              <div>
                <CardTitle>End-to-End Coordination Achieved</CardTitle>
                <CardDescription>
                  Live changes reflected in Coordination Hub, Institution 360°, and Audit Trail
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs space-y-2 text-emerald-950">
            <p className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Samanvay AI Prototype Workflow Executed Successfully!
            </p>
            <p className="text-emerald-800 leading-relaxed">
              The coordination task{" "}
              <strong className="font-mono text-emerald-950">
                {createdCoordId || "COORD-2026-004"}
              </strong>{" "}
              is now live in the central state store. Notice how each original complaint maintains its independent filing history while being unified under a single regulatory lead.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link href="/coordination">
              <div className="p-3 rounded border border-border hover:border-blue-400 bg-white text-xs cursor-pointer group">
                <span className="font-semibold text-blue-600 flex items-center gap-1 group-hover:underline">
                  Coordination Hub <ArrowRight className="w-3 h-3" />
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Inspect active timeline and joint minutes
                </p>
              </div>
            </Link>

            <Link href="/institutions/INST-001">
              <div className="p-3 rounded border border-border hover:border-blue-400 bg-white text-xs cursor-pointer group">
                <span className="font-semibold text-blue-600 flex items-center gap-1 group-hover:underline">
                  Institution 360° Profile <ArrowRight className="w-3 h-3" />
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Verify unified institutional view
                </p>
              </div>
            </Link>

            <Link href="/audit">
              <div className="p-3 rounded border border-border hover:border-blue-400 bg-white text-xs cursor-pointer group">
                <span className="font-semibold text-blue-600 flex items-center gap-1 group-hover:underline">
                  Audit Trail <ArrowRight className="w-3 h-3" />
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Examine immutable log entries created
                </p>
              </div>
            </Link>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToDefaults();
                setCurrentStep(1);
              }}
              className="text-xs gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Start Over
            </Button>
            <Link href="/dashboard">
              <Button size="sm" className="gap-1 text-xs">
                <LayoutDashboard className="w-3.5 h-3.5" /> Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
