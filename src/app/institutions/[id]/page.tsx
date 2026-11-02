"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GitCompare,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function InstitutionProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { institutions, complaints, overlaps } = useSamanvayStore();
  const institution = institutions.find((i) => i.id === id);

  const [activeTab, setActiveTab] = useState<"cases" | "overlaps" | "timeline" | "info">("cases");

  if (!institution) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-neutral-800">Institution Not Found</p>
        <p className="text-xs text-slate-500">Record {id} does not exist in registry.</p>
        <Link href="/institutions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Institutions
          </Button>
        </Link>
      </div>
    );
  }

  // Linked Complaints
  const instComplaints = complaints.filter((c) => c.institutionId === institution.id);
  const activeCasesCount = instComplaints.filter((c) => c.currentStatus !== "DISPOSED").length;

  // Linked Overlaps
  const instOverlaps = overlaps.filter((o) => o.institutionId === institution.id);

  // Aggregated Action History across all institution complaints
  const allActions = instComplaints.flatMap((c) =>
    c.actionHistory.map((a) => ({ ...a, complaintId: c.id, complaintCategory: c.category }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Top Navigation & Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/institutions">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                AICTE PID: {institution.permanentId}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-600">{institution.type}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600">{institution.region} Region</span>
            </div>
            <h1 className="text-base sm:text-xl font-bold text-neutral-900 mt-1">
              {institution.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {instOverlaps.length > 0 && (
            <Link href={`/intelligence?inst=${institution.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100">
                <GitCompare className="w-3.5 h-3.5 text-amber-700" />
                Active Overlaps ({instOverlaps.length})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card compact className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400">Regulatory Risk</span>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-base font-bold text-neutral-900">
              {institution.riskRating} RISK
            </span>
            {institution.riskRating === "HIGH" && <Badge variant="danger">Attention</Badge>}
            {institution.riskRating === "MEDIUM" && <Badge variant="warning">Moderate</Badge>}
            {institution.riskRating === "LOW" && <Badge variant="success">Normal</Badge>}
          </div>
          <p className="text-[10px] text-slate-500">Based on multi-bureau caseload</p>
        </Card>

        <Card compact className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400">Sanctioned Intake</span>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-base font-bold text-neutral-900">{institution.approvedIntake} Seats</span>
            <Badge variant="secondary">Est. {institution.establishedYear}</Badge>
          </div>
          <p className="text-[10px] text-slate-500">Across {institution.programmes.length} approved programs</p>
        </Card>

        <Card compact className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400">Active Complaints</span>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-base font-bold text-blue-600">{activeCasesCount} Active</span>
            <span className="text-[11px] text-slate-500 font-mono">{instComplaints.length} Total</span>
          </div>
          <p className="text-[10px] text-slate-500">
            {instComplaints.filter((c) => c.currentStatus === "DISPOSED").length} cases disposed
          </p>
        </Card>

        <Card compact className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400">Participating Bureaus</span>
          <div className="pt-1 flex flex-wrap gap-1">
            {institution.bureauInvolvement.map((b) => (
              <Badge key={b} variant="outline" size="sm">
                {b.split(" ")[0]}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabs for Navigation */}
      <div className="flex items-center gap-1 border-b border-border text-xs font-medium">
        <button
          onClick={() => setActiveTab("cases")}
          className={`px-3.5 py-2 border-b-2 transition-colors ${
            activeTab === "cases"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Complaint History ({instComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab("overlaps")}
          className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "overlaps"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Cross-Bureau Overlaps
          {instOverlaps.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px]">
              {instOverlaps.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-3.5 py-2 border-b-2 transition-colors ${
            activeTab === "timeline"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Regulatory Action Timeline ({allActions.length})
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={`px-3.5 py-2 border-b-2 transition-colors ${
            activeTab === "info"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Campus &amp; Program Details
        </button>
      </div>

      {/* TAB 1: COMPLAINT HISTORY */}
      {activeTab === "cases" && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-slate-500 bg-slate-50/80">
                  <th className="py-2.5 px-3 font-semibold">Complaint ID</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Assigned Bureau</th>
                  <th className="py-2.5 px-3 font-semibold">Officer</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Date Received</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {instComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-blue-600">
                      <Link href={`/complaints/${c.id}`} className="hover:underline">
                        {c.id}
                      </Link>
                    </td>
                    <td className="py-3 px-3 max-w-[200px]">
                      <p className="font-medium text-neutral-900 truncate">{c.category}</p>
                      <p className="text-[10px] text-slate-500 truncate">{c.subject}</p>
                    </td>
                    <td className="py-3 px-3">{c.bureau.split(" ")[0]}</td>
                    <td className="py-3 px-3 text-slate-600">{c.assignedOfficer.name}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          c.currentStatus === "DISPOSED"
                            ? "success"
                            : c.currentStatus === "SHOW_CAUSE_ISSUED"
                            ? "danger"
                            : "default"
                        }
                      >
                        {c.currentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(c.dateReceived)}</td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/complaints/${c.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: CROSS-BUREAU OVERLAPS */}
      {activeTab === "overlaps" && (
        <div className="space-y-4">
          {instOverlaps.length === 0 ? (
            <Card className="py-8 text-center text-slate-500 text-xs">
              No cross-bureau conflicts or duplicate claims currently flagged for this institution.
            </Card>
          ) : (
            instOverlaps.map((ovl) => (
              <Card key={ovl.id} className="border-amber-200 bg-amber-50/10">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-900">
                        {ovl.id}
                      </span>
                      <Badge variant="warning">{ovl.classification}</Badge>
                      <span className="text-xs font-semibold text-neutral-800">
                        Confidence: {ovl.confidence}%
                      </span>
                    </div>

                    <div className="mt-2 text-xs space-y-1">
                      <p className="text-slate-800 font-medium">
                        Linked Cases:{" "}
                        <Link href={`/complaints/${ovl.caseAId}`} className="text-blue-600 hover:underline font-mono">
                          {ovl.caseAId}
                        </Link>{" "}
                        ({ovl.bureauA.split(" ")[0]}) &amp;{" "}
                        <Link href={`/complaints/${ovl.caseBId}`} className="text-blue-600 hover:underline font-mono">
                          {ovl.caseBId}
                        </Link>{" "}
                        ({ovl.bureauB.split(" ")[0]})
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        <strong>Risk Assessment:</strong> {ovl.evidence.crossBureauActivity.riskSummary}
                      </p>
                    </div>
                  </div>

                  <Link href={`/intelligence?group=${ovl.id}`}>
                    <Button size="sm" className="text-xs whitespace-nowrap">
                      Open Intelligence Workspace
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: REGULATORY TIMELINE */}
      {activeTab === "timeline" && (
        <Card>
          <CardHeader>
            <CardTitle>Unified Administrative Chronology</CardTitle>
            <CardDescription>
              Chronological aggregation of all inspection notices, rejoinders, and committee orders across bureaus
            </CardDescription>
          </CardHeader>
          <div className="space-y-4">
            {allActions.length === 0 ? (
              <p className="text-xs text-slate-500">No actions recorded.</p>
            ) : (
              allActions.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50 mt-1 shrink-0" />
                  <div className="flex-1 pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{act.action}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(act.date)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Case <strong className="font-mono text-blue-600">{act.complaintId}</strong> •{" "}
                      {act.officer} ({act.bureau.split(" ")[0]})
                    </p>
                    <p className="text-xs text-slate-700 mt-1.5 bg-slate-50 p-2 rounded border border-border/60">
                      {act.remarks}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 4: CAMPUS & PROGRAM DETAILS */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Campus Registry Attributes</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-slate-500">Official Campus Address:</span>
                <span className="font-medium text-neutral-900 text-right">{institution.address}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-slate-500">State &amp; Territorial Jurisdiction:</span>
                <span className="font-medium text-neutral-900">{institution.state}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-slate-500">Administrative Region:</span>
                <span className="font-medium text-neutral-900">{institution.region}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-slate-500">Year of Establishment:</span>
                <span className="font-medium text-neutral-900">{institution.establishedYear}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AICTE Approved Programmes</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs">
              {institution.programmes.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-border/60">
                  <span className="font-medium text-slate-800">{p}</span>
                  <Badge variant="secondary" size="sm">Active Approval</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
