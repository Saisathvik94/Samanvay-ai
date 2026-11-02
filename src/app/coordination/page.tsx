"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  MessageSquare,
  UserCheck,
  Send,
  Plus,
  Share2,
  ExternalLink,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatDateTime } from "@/lib/utils";
import { CoordinationTask, Officer, Bureau } from "@/types";
import { MOCK_OFFICERS } from "@/data/mockData";

export default function CoordinationPage() {
  const searchParams = useSearchParams();
  const initialCoordId = searchParams.get("id");

  const {
    coordinations,
    complaints,
    currentOfficer,
    assignCoordinationOwner,
    addCoordinationTimelineItem,
    updateCoordinationStatus,
  } = useSamanvayStore();

  const [selectedCoordId, setSelectedCoordId] = useState<string>(
    initialCoordId && coordinations.some((c) => c.id === initialCoordId)
      ? initialCoordId
      : coordinations[0]?.id || ""
  );

  const [filterStatus, setFilterStatus] = useState("ALL");

  // Interaction dialog states
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [noteActionType, setNoteActionType] = useState<
    "NOTE" | "JOINT_NOTICE" | "HEARING_SCHEDULED" | "STATUS_UPDATE" | "ESCALATED"
  >("NOTE");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState(currentOfficer.id);
  const [assignRemarks, setAssignRemarks] = useState("");

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "OPEN" | "IN_REVIEW" | "JOINT_ACTION_SCHEDULED" | "RESOLVED"
  >("IN_REVIEW");
  const [statusRemarks, setStatusRemarks] = useState("");

  useEffect(() => {
    if (initialCoordId) {
      setSelectedCoordId(initialCoordId);
    }
  }, [initialCoordId]);

  const filteredTasks = coordinations.filter((c) => {
    if (filterStatus === "ALL") return true;
    return c.status === filterStatus;
  });

  const selectedTask: CoordinationTask | undefined =
    coordinations.find((c) => c.id === selectedCoordId) || filteredTasks[0] || coordinations[0];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
              Cross-Bureau Coordination Hub
            </h1>
            <Badge variant="default" size="sm">
              Inter-Agency Mesh
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synchronize investigations, prevent contradictory regulatory rulings, and align hearings between RB, PGRC, Approval Bureau, and Regional Offices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/intelligence">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              Open Overlap Engine &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Tasks List (4 columns) */}
        <div className="lg:col-span-4 space-y-3">
          <Card compact className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">
                Active Coordination Tasks ({filteredTasks.length})
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1 px-1.5 bg-slate-50 border border-border rounded text-[11px]"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="JOINT_ACTION_SCHEDULED">Joint Action Scheduled</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </Card>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <Card className="py-6 text-center text-xs text-slate-500">
                No coordination tasks match filter.
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const isSelected = selectedTask?.id === task.id;

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedCoordId(task.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50/40 border-blue-500 shadow-xs ring-1 ring-blue-500"
                        : "bg-white border-border hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        {task.id}
                      </span>
                      <Badge
                        variant={
                          task.status === "RESOLVED"
                            ? "success"
                            : task.status === "JOINT_ACTION_SCHEDULED"
                            ? "warning"
                            : "default"
                        }
                        size="sm"
                      >
                        {task.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <p className="font-semibold text-neutral-900 mt-2 line-clamp-1">
                      {task.institutionName}
                    </p>

                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      {task.requiredAction}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Lead: <strong>{task.coordinationOwner.name}</strong></span>
                      <span className="font-mono text-blue-700 font-medium">
                        {task.caseIds.join(" • ")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Coordination Workspace (8 columns) */}
        {selectedTask ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Coordination Header Card */}
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-3 border-b border-border/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedTask.id}
                    </span>
                    <Badge
                      variant={
                        selectedTask.status === "RESOLVED"
                          ? "success"
                          : selectedTask.status === "JOINT_ACTION_SCHEDULED"
                          ? "warning"
                          : "default"
                      }
                    >
                      {selectedTask.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-rose-700 font-semibold">
                      Priority: {selectedTask.priority}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-neutral-900 mt-2">
                    {selectedTask.institutionName}
                  </h2>
                  <p className="text-xs text-slate-700 mt-1">
                    <strong>Action Required:</strong> {selectedTask.requiredAction}
                  </p>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignModalOpen(true)}
                    className="text-xs h-8 gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Reassign Lead
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusModalOpen(true)}
                    className="text-xs h-8 gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Update Status
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setNoteModalOpen(true)}
                    className="text-xs h-8 gap-1.5 bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Record Joint Action
                  </Button>
                </div>
              </div>

              {/* Task Metadata Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Lead Coordinator
                  </span>
                  <p className="font-semibold text-neutral-900 mt-0.5">
                    {selectedTask.coordinationOwner.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {selectedTask.coordinationOwner.bureau.split(" ")[0]}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Target Resolution Deadline
                  </span>
                  <p className="font-semibold text-neutral-900 mt-0.5">
                    {formatDate(selectedTask.deadline)}
                  </p>
                  <p className="text-[10px] text-amber-700 font-medium">Enforcement SLA</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Participating Bureaus
                  </span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {selectedTask.bureaus.map((b) => (
                      <Badge key={b} variant="secondary" size="sm">
                        {b.split(" ")[0]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Source Overlap Dossier
                  </span>
                  <Link
                    href={`/intelligence?group=${selectedTask.overlapGroupId}`}
                    className="font-mono text-blue-600 hover:underline font-semibold text-xs mt-0.5 inline-block"
                  >
                    {selectedTask.overlapGroupId} &rarr;
                  </Link>
                </div>
              </div>
            </Card>

            {/* Linked Complaints Cards */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                Linked Bureau Dockets ({selectedTask.caseIds.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTask.caseIds.map((cId) => {
                  const comp = complaints.find((c) => c.id === cId);
                  return (
                    <Card key={cId} compact className="space-y-2 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/complaints/${cId}`}
                          className="font-mono text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-slate-400" /> {cId}
                        </Link>
                        {comp && (
                          <Badge variant="outline" size="sm">
                            {comp.bureau.split(" ")[0]}
                          </Badge>
                        )}
                      </div>
                      {comp ? (
                        <>
                          <p className="text-xs font-medium text-neutral-900 line-clamp-1">
                            {comp.subject}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-border/60">
                            <span>Officer: {comp.assignedOfficer.name}</span>
                            <Badge variant="secondary" size="sm">
                              {comp.currentStatus}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400">Loading case details...</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Chronological Action Timeline */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Cross-Bureau Action Timeline &amp; Meeting Record</CardTitle>
                  <CardDescription>
                    Append-only record of joint notices, hearings, and inter-bureau agreements
                  </CardDescription>
                </div>
              </CardHeader>

              <div className="space-y-4">
                {selectedTask.timeline.map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-3.5 text-xs">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ring-4 mt-1 shrink-0 ${
                        item.actionType === "HEARING_SCHEDULED"
                          ? "bg-amber-600 ring-amber-100"
                          : item.actionType === "STATUS_UPDATE"
                          ? "bg-emerald-600 ring-emerald-100"
                          : "bg-blue-600 ring-blue-50"
                      }`}
                    />
                    <div className="flex-1 pb-3 border-b border-border/60">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">
                          {item.actionType.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Recorded by <strong>{item.officer}</strong> ({item.bureau})
                      </p>
                      <p className="text-xs text-slate-800 mt-1.5 p-2.5 bg-slate-50 rounded border border-border/60 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-8 py-12 text-center text-xs text-slate-500">
            No active coordination task selected.
          </div>
        )}
      </div>

      {/* MODAL: Record Joint Action / Timeline Item */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Record Joint Regulatory Action"
        description="Add a binding coordination note, hearing schedule, or joint directive"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Action Category</label>
            <select
              value={noteActionType}
              onChange={(e) => setNoteActionType(e.target.value as any)}
              className="w-full p-2 border border-border rounded-md bg-white text-xs"
            >
              <option value="NOTE">Inter-Bureau Working Note</option>
              <option value="HEARING_SCHEDULED">Joint Hearing Scheduled</option>
              <option value="JOINT_NOTICE">Joint Show Cause / Order Issued</option>
              <option value="STATUS_UPDATE">Progress Status Update</option>
              <option value="ESCALATED">Escalate to Member Secretary</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Directive / Minutes of Meeting</label>
            <textarea
              rows={4}
              placeholder="Record exact joint instructions, committee dates, room numbers, or mutual evidence exchange conclusions..."
              value={noteMessage}
              onChange={(e) => setNoteMessage(e.target.value)}
              className="w-full p-2 border border-border rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!noteMessage.trim()}
              onClick={() => {
                if (selectedTask) {
                  addCoordinationTimelineItem(selectedTask.id, noteMessage, noteActionType);
                }
                setNoteModalOpen(false);
                setNoteMessage("");
              }}
            >
              Post to Coordination Log
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Reassign Lead */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Reassign Coordination Lead Officer"
        description="Designate primary owner accountable for this inter-bureau task"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Lead Officer</label>
            <select
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
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
            <label className="font-semibold text-neutral-800 block mb-1">Assignment Rationale</label>
            <textarea
              rows={2}
              placeholder="State reason for lead transfer..."
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
                const targetOff = MOCK_OFFICERS.find((o) => o.id === selectedOwnerId);
                if (selectedTask && targetOff) {
                  assignCoordinationOwner(selectedTask.id, targetOff, assignRemarks);
                }
                setAssignModalOpen(false);
                setAssignRemarks("");
              }}
            >
              Confirm Lead Reassignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Update Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Coordination Status"
        description="Record resolution or transition in joint coordination"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full p-2 border border-border rounded-md bg-white text-xs"
            >
              <option value="IN_REVIEW">In Review (Active Joint Scrutiny)</option>
              <option value="JOINT_ACTION_SCHEDULED">Joint Action / Hearing Scheduled</option>
              <option value="RESOLVED">Resolved (Joint Order Executed &amp; Closed)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-neutral-800 block mb-1">Closing / Status Remarks</label>
            <textarea
              rows={3}
              placeholder="Document order reference numbers, joint settlement terms, or penal compliance satisfaction..."
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
                if (selectedTask) {
                  updateCoordinationStatus(selectedTask.id, selectedStatus, statusRemarks);
                }
                setStatusModalOpen(false);
                setStatusRemarks("");
              }}
            >
              Update Coordination Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
