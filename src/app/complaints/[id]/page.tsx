"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  Share2,
  AlertTriangle,
  FileText,
  FileCheck2,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Send,
  Download,
  GitCompare,
  ArrowRight,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { ComplaintStatus, Bureau, Officer } from "@/types";
import { MOCK_OFFICERS } from "@/data/mockData";

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    complaints,
    overlaps,
    currentOfficer,
    updateComplaintStatus,
    assignComplaintOfficer,
    transferComplaint,
    escalateComplaint,
    addComplaintRemark,
  } = useSamanvayStore();

  const complaint = complaints.find((c) => c.id === id);

  // Dialog states
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<ComplaintStatus>("UNDER_PROCESS");
  const [statusRemarks, setStatusRemarks] = useState("");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState(complaint?.assignedOfficer.id || "");
  const [assignRemarks, setAssignRemarks] = useState("");

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedBureau, setSelectedBureau] = useState<Bureau>("Regulation Bureau (RB)");
  const [transferRemarks, setTransferRemarks] = useState("");

  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");

  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [newRemarkText, setNewRemarkText] = useState("");

  if (!complaint) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-neutral-800">Complaint Not Found</p>
        <p className="text-xs text-slate-500">Record {id} does not exist in the active docket.</p>
        <Link href="/complaints">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Complaints
          </Button>
        </Link>
      </div>
    );
  }

  // Find if this complaint has an associated overlap
  const relatedOverlap = overlaps.find(
    (o) => o.caseAId === complaint.id || o.caseBId === complaint.id
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/complaints">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {complaint.id}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-700">{complaint.category}</span>
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-neutral-900 mt-1">
              {complaint.subject}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRemarkModalOpen(true)}
            className="text-xs h-8 gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Add Note
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssignModalOpen(true)}
            className="text-xs h-8 gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Reassign
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTransferModalOpen(true)}
            className="text-xs h-8 gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" /> Transfer
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEscalateModalOpen(true)}
            className="text-xs h-8 gap-1.5 text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Escalate
          </Button>

          <Button
            size="sm"
            onClick={() => setStatusModalOpen(true)}
            className="text-xs h-8 gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Update Status
          </Button>
        </div>
      </div>

      {/* Overlap Flag Banner if Present */}
      {relatedOverlap && (
        <div className="bg-amber-50/80 border border-amber-300/80 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md shrink-0 mt-0.5">
              <GitCompare className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Potential Overlap Detected by Samanvay Intelligence
                </span>
                <Badge variant="warning" size="sm">
                  {relatedOverlap.classification}
                </Badge>
                <span className="text-[11px] font-semibold text-amber-800">
                  {relatedOverlap.confidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                Cross-bureau correlation with{" "}
                <strong className="font-mono">
                  {relatedOverlap.caseAId === complaint.id ? relatedOverlap.caseBId : relatedOverlap.caseAId}
                </strong>{" "}
                handled by{" "}
                {relatedOverlap.caseAId === complaint.id ? relatedOverlap.bureauB : relatedOverlap.bureauA}.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-100 whitespace-nowrap self-start sm:self-auto gap-1"
            onClick={() => router.push(`/intelligence?group=${relatedOverlap.id}`)}
          >
            Open Side-by-Side Review <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Institution Info */}
        <Card compact className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400">Target Institution</span>
          <p className="text-xs font-semibold text-neutral-900 truncate">
            {complaint.institutionName}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>PID: {complaint.institutionPermanentId}</span>
            <Link
              href={`/institutions/${complaint.institutionId}`}
              className="text-blue-600 hover:underline font-medium"
            >
              View 360° Profile &rarr;
            </Link>
          </div>
        </Card>

        {/* Current Bureau & Officer */}
        <Card compact className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400">Jurisdiction &amp; Officer</span>
          <p className="text-xs font-semibold text-neutral-900 truncate">{complaint.bureau}</p>
          <p className="text-[11px] text-slate-600 truncate">
            {complaint.assignedOfficer.name} ({complaint.assignedOfficer.designation})
          </p>
        </Card>

        {/* Status & Priority */}
        <Card compact className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400">Case Disposition</span>
          <div className="flex items-center gap-2 pt-0.5">
            <Badge variant="default" size="md">
              {complaint.currentStatus}
            </Badge>
            <span className="text-xs font-semibold text-slate-700">
              Priority: {complaint.priority}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Logged on {formatDate(complaint.dateReceived)}</p>
        </Card>

        {/* SLA Health */}
        <Card compact className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-slate-400">Prescribed Disposal SLA</span>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs font-bold text-neutral-900">
              {formatDate(complaint.expectedDisposalDate)}
            </span>
            <Badge
              variant={
                complaint.slaCondition === "ON_TRACK"
                  ? "success"
                  : complaint.slaCondition === "NEARING_DEADLINE"
                  ? "warning"
                  : "danger"
              }
            >
              {complaint.slaCondition}
            </Badge>
          </div>
          <p className="text-[10px] text-slate-500">Standard 30-day inquiry window</p>
        </Card>
      </div>

      {/* Main Grid: Description, Evidentiary Documents, Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Narrative & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Allegation Summary */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Formal Allegation Particulars</CardTitle>
                <CardDescription>
                  Deposition received from {complaint.complainantType} • Verified for preliminary admissibility
                </CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-md border border-border/80 text-slate-800 leading-relaxed font-normal">
                {complaint.description}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white border border-border rounded-md">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Last Recorded Action
                  </span>
                  <p className="text-xs font-medium text-neutral-900 mt-1">
                    {complaint.lastAction}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Dated: {formatDate(complaint.lastActionDate)}
                  </span>
                </div>

                <div className="p-3 bg-blue-50/40 border border-blue-200/70 rounded-md">
                  <span className="text-[10px] font-bold uppercase text-blue-700 block">
                    Next Required Regulatory Action
                  </span>
                  <p className="text-xs font-semibold text-blue-900 mt-1">
                    {complaint.nextRequiredAction}
                  </p>
                  <span className="text-[10px] text-blue-600 mt-1 block">
                    Responsible: {complaint.assignedOfficer.name}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action History / Internal Audit Chronology */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Case Action Chronology</CardTitle>
                <CardDescription>
                  Append-only procedural history of administrative notices, reviews, and hearings
                </CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4">
              {complaint.actionHistory.map((item, idx) => (
                <div key={item.id} className="relative flex items-start gap-3.5 text-xs">
                  {/* Timeline connector dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50 mt-1 shrink-0" />
                  <div className="flex-1 pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{item.action}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(item.date)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {item.officer} • <span className="text-slate-400">{item.bureau}</span>
                    </p>
                    <p className="text-xs text-slate-700 mt-1.5 bg-slate-50 p-2 rounded border border-border/60">
                      {item.remarks}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 span): Documents, Connected Bureaus & Cross-References */}
        <div className="space-y-6">
          {/* Supporting Evidence Documents */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Supporting Dossier</CardTitle>
                <CardDescription>Uploaded affidavits, fee challans, inspection notices</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {complaint.supportingDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-md border border-border bg-slate-50/60 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-medium text-neutral-900 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {doc.size} • Uploaded {formatDate(doc.dateUploaded)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Simulated document viewer for: ${doc.name}`)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors"
                    title="Inspect Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Related Case Dossiers */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Inter-Bureau Case Links</CardTitle>
                <CardDescription>Dockets referencing identical institution</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {complaint.relatedCaseIds.length === 0 ? (
                <p className="text-xs text-slate-500">No cross-referenced cases linked yet.</p>
              ) : (
                complaint.relatedCaseIds.map((relId) => {
                  const relComplaint = complaints.find((c) => c.id === relId);
                  return (
                    <div
                      key={relId}
                      className="p-2.5 rounded-md border border-border bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/complaints/${relId}`}
                          className="font-mono text-xs font-semibold text-blue-600 hover:underline"
                        >
                          {relId}
                        </Link>
                        {relComplaint && (
                          <Badge variant="secondary" size="sm">
                            {relComplaint.bureau.split(" ")[0]}
                          </Badge>
                        )}
                      </div>
                      {relComplaint && (
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {relComplaint.subject}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL 1: Update Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Case Disposition Status"
        description={`Record formal status transition for ${complaint.id}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">New Status</label>
            <select
              value={selectedNewStatus}
              onChange={(e) => setSelectedNewStatus(e.target.value as ComplaintStatus)}
              className="w-full p-2 border border-border rounded-md bg-white text-xs"
            >
              <option value="UNDER_PROCESS">Under Process (Active Inquiry)</option>
              <option value="PENDING_INQUIRY">Pending Inquiry Committee</option>
              <option value="SHOW_CAUSE_ISSUED">Show Cause Notice Issued</option>
              <option value="COORDINATION_REQUIRED">Coordination Required</option>
              <option value="DISPOSED">Disposed (Resolved / Closed)</option>
              <option value="REJECTED">Rejected (Non-maintainable)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Officer Justification &amp; Order Remarks</label>
            <textarea
              rows={3}
              placeholder="Provide reason for status change, references to dispatched notices, or hearing conclusions..."
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              className="w-full p-2 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!statusRemarks.trim()}
              onClick={() => {
                updateComplaintStatus(complaint.id, selectedNewStatus, statusRemarks);
                setStatusModalOpen(false);
                setStatusRemarks("");
              }}
            >
              Confirm Status Transition
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Reassign Officer */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Reassign Scrutiny Officer"
        description="Select an authorized officer to assume inquiry ownership"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Designated Officer</label>
            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
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
            <label className="font-semibold text-neutral-800 block mb-1">Reassignment Memo</label>
            <textarea
              rows={2}
              placeholder="State rationale for case reassignment..."
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              className="w-full p-2 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const targetOfficer = MOCK_OFFICERS.find((o) => o.id === selectedOfficerId);
                if (targetOfficer) {
                  assignComplaintOfficer(complaint.id, targetOfficer, assignRemarks);
                }
                setAssignModalOpen(false);
                setAssignRemarks("");
              }}
            >
              Reassign Officer
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Transfer Jurisdiction */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer Bureau Jurisdiction"
        description="Transfer case file to appropriate bureau or regional cell"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Target Bureau</label>
            <select
              value={selectedBureau}
              onChange={(e) => setSelectedBureau(e.target.value as Bureau)}
              className="w-full p-2 border border-border rounded-md bg-white text-xs"
            >
              <option value="Regulation Bureau (RB)">Regulation Bureau (RB)</option>
              <option value="Public Grievance Redressal Cell (PGRC)">Public Grievance Redressal Cell (PGRC)</option>
              <option value="Approval Bureau (AB)">Approval Bureau (AB)</option>
              <option value="Regional Office - North (RO-N)">Regional Office - North (RO-N)</option>
              <option value="Regional Office - South (RO-S)">Regional Office - South (RO-S)</option>
              <option value="Regional Office - West (RO-W)">Regional Office - West (RO-W)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Transfer Endorsement</label>
            <textarea
              rows={2}
              placeholder="State reasons why this matter falls under the target bureau's mandate..."
              value={transferRemarks}
              onChange={(e) => setTransferRemarks(e.target.value)}
              className="w-full p-2 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!transferRemarks.trim()}
              onClick={() => {
                transferComplaint(complaint.id, selectedBureau, transferRemarks);
                setTransferModalOpen(false);
                setTransferRemarks("");
              }}
            >
              Execute Jurisdiction Transfer
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Escalate */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title="Escalate Case to Supervisory Review"
        description="Mark as high-priority regulatory emergency requiring Chairman / Member Secretary attention"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800">
            Escalating will flag this case in red across executive dashboards and notify senior leadership of imminent SLA breach or severe statutory violation.
          </div>

          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Escalation Grounds</label>
            <textarea
              rows={3}
              placeholder="State critical reasons: ongoing severe safety hazard, mass student protest, imminent illegal admission round..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="w-full p-2 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!escalateReason.trim()}
              onClick={() => {
                escalateComplaint(complaint.id, escalateReason);
                setEscalateModalOpen(false);
                setEscalateReason("");
              }}
            >
              Escalate Immediately
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: Add Note */}
      <Modal
        isOpen={remarkModalOpen}
        onClose={() => setRemarkModalOpen(false)}
        title="Record Officer Case Note"
        description="Add timestamped note to internal docket"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Case Note / Directive</label>
            <textarea
              rows={3}
              placeholder="Record inquiry findings, telephonic discussions with college director, or interim instructions..."
              value={newRemarkText}
              onChange={(e) => setNewRemarkText(e.target.value)}
              className="w-full p-2 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setRemarkModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!newRemarkText.trim()}
              onClick={() => {
                addComplaintRemark(complaint.id, newRemarkText);
                setRemarkModalOpen(false);
                setNewRemarkText("");
              }}
            >
              Save Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
