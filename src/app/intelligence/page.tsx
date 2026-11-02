"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GitCompare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  FileText,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Layers,
  HelpCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { OverlapGroup, Complaint, Officer, ReviewStatus } from "@/types";
import { MOCK_OFFICERS } from "@/data/mockData";

export default function IntelligencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("group") || searchParams.get("inst");

  const {
    overlaps,
    complaints,
    currentOfficer,
    isAnalyzing,
    analysisMessage,
    runSimulatedAnalysis,
    confirmOverlap,
    markOverlapUnrelated,
    requestCoordination,
  } = useSamanvayStore();

  // Selected Overlap Group
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroupId && overlaps.some((o) => o.id === initialGroupId || o.institutionId === initialGroupId)
      ? overlaps.find((o) => o.id === initialGroupId || o.institutionId === initialGroupId)!.id
      : overlaps[0]?.id || ""
  );

  const [filterClassification, setFilterClassification] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Dialog states for officer decisions
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmNotes, setConfirmNotes] = useState("");
  const [assignOwnerName, setAssignOwnerName] = useState(currentOfficer.name);

  const [unrelatedModalOpen, setUnrelatedModalOpen] = useState(false);
  const [unrelatedNotes, setUnrelatedNotes] = useState("");

  const [coordinateModalOpen, setCoordinateModalOpen] = useState(false);
  const [coordinateNotes, setCoordinateNotes] = useState("");
  const [coordinationOwnerId, setCoordinationOwnerId] = useState(currentOfficer.id);

  // Sync with search params
  useEffect(() => {
    if (initialGroupId) {
      const match = overlaps.find((o) => o.id === initialGroupId || o.institutionId === initialGroupId);
      if (match) setSelectedGroupId(match.id);
    }
  }, [initialGroupId, overlaps]);

  // Filtered overlaps list
  const filteredOverlaps = overlaps.filter((o) => {
    const matchClass =
      filterClassification === "ALL" || o.classification === filterClassification;
    const matchStatus = filterStatus === "ALL" || o.reviewStatus === filterStatus;
    return matchClass && matchStatus;
  });

  const selectedGroup: OverlapGroup | undefined =
    overlaps.find((o) => o.id === selectedGroupId) || filteredOverlaps[0] || overlaps[0];

  // Side-by-side complaint lookups
  const complaintA: Complaint | undefined = selectedGroup
    ? complaints.find((c) => c.id === selectedGroup.caseAId)
    : undefined;

  const complaintB: Complaint | undefined = selectedGroup
    ? complaints.find((c) => c.id === selectedGroup.caseBId)
    : undefined;

  const handleRunAnalysis = async () => {
    await runSimulatedAnalysis(selectedGroup?.id);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
              AI Overlap Intelligence Workspace
            </h1>
            <Badge variant="warning" size="sm">
              Signature Engine
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hybrid cross-bureau matching: Institution Identity Resolution + Semantic Allegation Analysis + Rule-Based Conflict Detection.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={handleRunAnalysis}
            isLoading={isAnalyzing}
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Run Demo Analysis
          </Button>
          <Link href="/demo">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              Guided SIH Tour
            </Button>
          </Link>
        </div>
      </div>

      {/* Simulated Analysis Progress Banner */}
      {isAnalyzing && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          <div className="text-xs text-blue-900">
            <p className="font-semibold">Samanvay Intelligence Pipeline Executing...</p>
            <p className="text-blue-700 font-mono text-[11px]">{analysisMessage}</p>
          </div>
        </div>
      )}

      {/* Human-in-the-Loop Supervisory Alert Banner */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-md p-3.5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-0.5">
          <p className="font-bold uppercase tracking-wider text-[11px] text-amber-950">
            Human-in-the-Loop Governance Directive
          </p>
          <p className="text-amber-800 leading-relaxed">
            Samanvay AI identifies and proposes relationships between multi-bureau filings.{" "}
            <strong>The system never automatically disposes, merges, or transfers cases without explicit officer authorization.</strong>{" "}
            Please examine the explainable evidence below and record your administrative decision.
          </p>
        </div>
      </div>

      {/* Split-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Panel: Overlap Cases Docket (4 columns) */}
        <div className="lg:col-span-4 space-y-3">
          <Card compact className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">
                Flagged Overlap Groups ({filteredOverlaps.length})
              </span>
              <span className="text-[10px] text-slate-500">Deterministic Sample</span>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={filterClassification}
                onChange={(e) => setFilterClassification(e.target.value)}
                className="py-1 px-1.5 bg-slate-50 border border-border rounded text-[11px]"
              >
                <option value="ALL">All Overlap Types</option>
                <option value="DUPLICATE">Duplicates</option>
                <option value="RELATED">Related Context</option>
                <option value="POTENTIAL_CONFLICT">Potential Conflicts</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1 px-1.5 bg-slate-50 border border-border rounded text-[11px]"
              >
                <option value="ALL">All Review Statuses</option>
                <option value="PENDING_OFFICER_REVIEW">Pending Review</option>
                <option value="CONFIRMED_RELATIONSHIP">Confirmed</option>
                <option value="COORDINATION_REQUESTED">Coordination Req.</option>
                <option value="COORDINATION_ACTIVE">Coordination Active</option>
                <option value="MARKED_UNRELATED">Marked Unrelated</option>
              </select>
            </div>
          </Card>

          {/* Overlap Cards List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredOverlaps.map((group) => {
              const isSelected = selectedGroup?.id === group.id;

              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/40 border-blue-500 shadow-xs ring-1 ring-blue-500"
                      : "bg-white border-border hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {group.id}
                    </span>
                    {group.classification === "DUPLICATE" && (
                      <Badge variant="warning" size="sm">Duplicate</Badge>
                    )}
                    {group.classification === "RELATED" && (
                      <Badge variant="default" size="sm">Related</Badge>
                    )}
                    {group.classification === "POTENTIAL_CONFLICT" && (
                      <Badge variant="danger" size="sm">Conflict Risk</Badge>
                    )}
                    {group.classification === "UNRELATED" && (
                      <Badge variant="neutral" size="sm">Unrelated</Badge>
                    )}
                  </div>

                  <p className="font-semibold text-neutral-900 mt-2 line-clamp-1">
                    {group.institutionName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    PID: {group.institutionPermanentId}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded">
                    <span className="font-mono font-medium text-blue-700">
                      {group.caseAId} &amp; {group.caseBId}
                    </span>
                    <span className="font-semibold text-neutral-800">
                      {group.confidence}% match
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      {group.bureauA.split(" ")[0]} vs {group.bureauB.split(" ")[0]}
                    </span>
                    {group.reviewStatus === "PENDING_OFFICER_REVIEW" ? (
                      <span className="text-amber-800 font-medium">Review Needed</span>
                    ) : group.reviewStatus === "COORDINATION_ACTIVE" ? (
                      <span className="text-blue-700 font-semibold">Active Coord</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Reviewed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Side-by-Side Comparison & Explainable Evidence (8 columns) */}
        {selectedGroup && (
          <div className="lg:col-span-8 space-y-5">
            {/* Institution Context Header */}
            <Card compact className="bg-slate-50/70">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      {selectedGroup.institutionPermanentId}
                    </span>
                    <h2 className="text-sm font-bold text-neutral-900">
                      {selectedGroup.institutionName}
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Flagged for cross-bureau review on {formatDate(selectedGroup.flaggedDate)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/institutions/${selectedGroup.institutionId}`}>
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1 bg-white">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Institution 360°
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Side-by-Side Complaint Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Docket: Case A */}
              <Card className="border-t-2 border-t-blue-600 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Docket A
                    </span>
                    <Link
                      href={`/complaints/${selectedGroup.caseAId}`}
                      className="font-mono text-xs font-bold text-blue-600 hover:underline"
                    >
                      {selectedGroup.caseAId}
                    </Link>
                  </div>
                  <Badge variant="secondary">{selectedGroup.bureauA.split(" ")[0]}</Badge>
                </div>

                {complaintA ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Category</span>
                      <p className="font-medium text-neutral-900">{complaintA.category}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Assigned Officer</span>
                      <p className="text-slate-700">
                        {complaintA.assignedOfficer.name} ({complaintA.assignedOfficer.designation})
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Case Status</span>
                      <Badge variant="default" size="sm">
                        {complaintA.currentStatus}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Allegation Narrative</span>
                      <p className="p-2.5 bg-slate-50 rounded border border-border/80 text-slate-800 text-[11px] leading-relaxed line-clamp-4">
                        {complaintA.description}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Last Action Recorded</span>
                      <p className="text-[11px] text-slate-600 italic">{complaintA.lastAction}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Loading Case A...</p>
                )}
              </Card>

              {/* Right Docket: Case B */}
              <Card className="border-t-2 border-t-amber-500 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Docket B
                    </span>
                    <Link
                      href={`/complaints/${selectedGroup.caseBId}`}
                      className="font-mono text-xs font-bold text-amber-700 hover:underline"
                    >
                      {selectedGroup.caseBId}
                    </Link>
                  </div>
                  <Badge variant="secondary">{selectedGroup.bureauB.split(" ")[0]}</Badge>
                </div>

                {complaintB ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Category</span>
                      <p className="font-medium text-neutral-900">{complaintB.category}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Assigned Officer</span>
                      <p className="text-slate-700">
                        {complaintB.assignedOfficer.name} ({complaintB.assignedOfficer.designation})
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Case Status</span>
                      <Badge variant="default" size="sm">
                        {complaintB.currentStatus}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Allegation Narrative</span>
                      <p className="p-2.5 bg-slate-50 rounded border border-border/80 text-slate-800 text-[11px] leading-relaxed line-clamp-4">
                        {complaintB.description}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Last Action Recorded</span>
                      <p className="text-[11px] text-slate-600 italic">{complaintB.lastAction}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Loading Case B...</p>
                )}
              </Card>
            </div>

            {/* EXPLAINABLE MATCHING EVIDENCE DOSSIER */}
            <Card className="border-blue-200 bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-blue-100 text-blue-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>Explainable AI Matching Evidence Dossier</CardTitle>
                    <CardDescription>
                      Breakdown of deterministic identity matching, semantic vectors, and regulatory conflict detection
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Overall Confidence:</span>
                  <span className="text-base font-bold text-blue-600">
                    {selectedGroup.confidence}%
                  </span>
                </div>
              </CardHeader>

              <div className="space-y-4 text-xs">
                {/* 1. Institution Identity Match */}
                <div className="p-3 bg-slate-50 rounded-md border border-border/80">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                    <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      1. Institution Identity Resolution
                    </span>
                    <Badge variant="success">
                      {selectedGroup.evidence.institutionMatch.score}% Resolved
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Permanent ID Match</span>
                      <span className="font-semibold text-emerald-700">
                        {selectedGroup.evidence.institutionMatch.permanentIdMatched ? "Exact Match (100%)" : "Fuzzy"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Name Similarity</span>
                      <span className="font-medium text-slate-800">
                        {selectedGroup.evidence.institutionMatch.nameSimilarity}% Levenshtein
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Address Verification</span>
                      <span className="font-semibold text-emerald-700">
                        {selectedGroup.evidence.institutionMatch.addressMatch ? "Verified Site" : "Unverified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Normalized Alias</span>
                      <span className="font-mono text-slate-700 truncate block">
                        {selectedGroup.evidence.institutionMatch.normalizedAlias}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Semantic Similarity & Excerpts */}
                <div className="p-3 bg-slate-50 rounded-md border border-border/80">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                    <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      2. Semantic &amp; Textual Allegation Alignment
                    </span>
                    <Badge variant="default">
                      {selectedGroup.evidence.semanticSimilarity.score}% Similarity
                    </Badge>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white rounded border border-border">
                        <span className="text-blue-600 font-semibold block mb-0.5">
                          {selectedGroup.caseAId} Excerpt:
                        </span>
                        <p className="text-slate-700 italic">
                          &quot;{selectedGroup.evidence.semanticSimilarity.caseAExcerpt}&quot;
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded border border-border">
                        <span className="text-amber-700 font-semibold block mb-0.5">
                          {selectedGroup.caseBId} Excerpt:
                        </span>
                        <p className="text-slate-700 italic">
                          &quot;{selectedGroup.evidence.semanticSimilarity.caseBExcerpt}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-400 text-[10px]">Overlapping Key Phrases:</span>
                      {selectedGroup.evidence.semanticSimilarity.keyPhrases.map((phrase, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100/70 text-blue-800 rounded text-[10px] font-medium"
                        >
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Regulatory Context & Conflicts */}
                <div className="p-3 bg-slate-50 rounded-md border border-border/80">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                    <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      3. Regulatory Governance &amp; Conflict Analysis
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedGroup.classification}
                    </span>
                  </div>

                  <div className="pt-2 space-y-2">
                    {selectedGroup.evidence.regulatoryContext.potentialConflictDescription && (
                      <div className="p-2.5 bg-rose-50 border border-rose-300 rounded text-rose-900 font-medium text-[11px]">
                        {selectedGroup.evidence.regulatoryContext.potentialConflictDescription}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 font-medium">Invoked AICTE Clauses:</span>
                      {selectedGroup.evidence.regulatoryContext.sharedClauses.map((clause, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px]"
                        >
                          {clause}
                        </span>
                      ))}
                    </div>

                    <div className="p-2 bg-white rounded border border-border text-[11px] text-slate-700">
                      <strong>Risk Assessment:</strong>{" "}
                      {selectedGroup.evidence.crossBureauActivity.riskSummary}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* OFFICER DECISION ACTIONS PANEL */}
            <Card className="border-t-2 border-t-neutral-800 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                    Officer Adjudication &amp; Coordination
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Review Status:{" "}
                    <strong>
                      {selectedGroup.reviewStatus.replace(/_/g, " ")}
                    </strong>
                    {selectedGroup.officerDecision && (
                      <span className="text-slate-500 ml-1">
                        (by {selectedGroup.officerDecision.officerName} on{" "}
                        {formatDate(selectedGroup.officerDecision.decisionDate)})
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUnrelatedModalOpen(true)}
                    className="text-xs h-8 text-slate-700 bg-white"
                  >
                    <XCircle className="w-3.5 h-3.5 text-slate-500" /> Mark Unrelated
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmModalOpen(true)}
                    className="text-xs h-8 text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirm Relationship
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setCoordinateModalOpen(true)}
                    className="text-xs h-8 gap-1.5 bg-blue-600 hover:bg-blue-700"
                  >
                    <GitCompare className="w-3.5 h-3.5" /> Request Coordination
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* MODAL: Confirm Relationship */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Regulatory Relationship"
        description="Validate that these cases share common institutional context"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Confirming will formally link Case{" "}
            <strong className="font-mono">{selectedGroup?.caseAId}</strong> and Case{" "}
            <strong className="font-mono">{selectedGroup?.caseBId}</strong> in the central registry.
          </p>

          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Officer Notes</label>
            <textarea
              rows={3}
              placeholder="State basis for confirming relationship (e.g. verified same batch year, identical capitation fee demand notice)..."
              value={confirmNotes}
              onChange={(e) => setConfirmNotes(e.target.value)}
              className="w-full p-2 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (selectedGroup) {
                  confirmOverlap(selectedGroup.id, confirmNotes, assignOwnerName);
                }
                setConfirmModalOpen(false);
                setConfirmNotes("");
              }}
            >
              Confirm Match
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Mark Unrelated */}
      <Modal
        isOpen={unrelatedModalOpen}
        onClose={() => setUnrelatedModalOpen(false)}
        title="Mark Cases Unrelated"
        description="Dismiss algorithm match as false positive or independent distinct matters"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Cases will remain independent and will not trigger cross-bureau coordination locks.
          </p>

          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Officer Rationale</label>
            <textarea
              rows={3}
              placeholder="State reason why allegations do not intersect (e.g. completely different campus departments, unrelated facility grievances)..."
              value={unrelatedNotes}
              onChange={(e) => setUnrelatedNotes(e.target.value)}
              className="w-full p-2 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setUnrelatedModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (selectedGroup) {
                  markOverlapUnrelated(selectedGroup.id, unrelatedNotes);
                }
                setUnrelatedModalOpen(false);
                setUnrelatedNotes("");
              }}
            >
              Mark Unrelated
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Request Coordination */}
      <Modal
        isOpen={coordinateModalOpen}
        onClose={() => setCoordinateModalOpen(false)}
        title="Initiate Cross-Bureau Coordination Task"
        description="Create active coordination workflow and assign a lead coordinator"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">
              Designated Coordination Owner
            </label>
            <select
              value={coordinationOwnerId}
              onChange={(e) => setCoordinationOwnerId(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-white text-xs"
            >
              {MOCK_OFFICERS.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.name} ({off.bureau} • {off.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-neutral-800 block mb-1">
              Required Inter-Bureau Joint Action
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Schedule joint hearing between Regulation Bureau and PGRC; freeze Approval Bureau docket until safety clearance is filed..."
              value={coordinateNotes}
              onChange={(e) => setCoordinateNotes(e.target.value)}
              className="w-full p-2 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setCoordinateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (selectedGroup) {
                  const leadOfficer = MOCK_OFFICERS.find((o) => o.id === coordinationOwnerId);
                  const newCoordId = requestCoordination(
                    selectedGroup.id,
                    coordinateNotes,
                    leadOfficer
                  );
                  setCoordinateModalOpen(false);
                  setCoordinateNotes("");
                  router.push(`/coordination?id=${newCoordId}`);
                }
              }}
            >
              Create Coordination Task &rarr;
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
