"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Complaint,
  Institution,
  OverlapGroup,
  CoordinationTask,
  AuditRecord,
  Officer,
  Bureau,
  ComplaintStatus,
  ReviewStatus,
  Priority,
} from "../types";
import {
  MOCK_INSTITUTIONS,
  ALL_COMPLAINTS,
  MOCK_OVERLAPS,
  MOCK_COORDINATION_TASKS,
  MOCK_AUDIT_LOGS,
  MOCK_OFFICERS,
} from "../data/mockData";

interface SamanvayStore {
  // Data
  institutions: Institution[];
  complaints: Complaint[];
  overlaps: OverlapGroup[];
  coordinations: CoordinationTask[];
  auditLogs: AuditRecord[];
  currentOfficer: Officer;

  // Analysis status
  isAnalyzing: boolean;
  analysisMessage: string | null;

  // Actions
  setCurrentOfficer: (officer: Officer) => void;
  
  // Complaint actions
  updateComplaintStatus: (id: string, newStatus: ComplaintStatus, remarks: string) => void;
  assignComplaintOfficer: (id: string, officer: Officer, remarks: string) => void;
  transferComplaint: (id: string, newBureau: Bureau, remarks: string) => void;
  escalateComplaint: (id: string, remarks: string) => void;
  addComplaintRemark: (id: string, remarks: string) => void;

  // Overlap Intelligence actions
  confirmOverlap: (overlapId: string, notes: string, assignedOwnerName?: string) => void;
  markOverlapUnrelated: (overlapId: string, notes: string) => void;
  requestCoordination: (overlapId: string, notes: string, ownerOfficer?: Officer, deadline?: string) => string;
  runSimulatedAnalysis: (overlapId?: string) => Promise<void>;

  // Coordination actions
  assignCoordinationOwner: (coordinationId: string, officer: Officer, remarks: string) => void;
  addCoordinationTimelineItem: (
    coordinationId: string,
    message: string,
    actionType: "NOTE" | "JOINT_NOTICE" | "HEARING_SCHEDULED" | "STATUS_UPDATE" | "ESCALATED"
  ) => void;
  updateCoordinationStatus: (
    coordinationId: string,
    newStatus: "OPEN" | "IN_REVIEW" | "JOINT_ACTION_SCHEDULED" | "RESOLVED",
    remarks: string
  ) => void;

  // System & Reset
  resetToDefaults: () => void;
}

export const useSamanvayStore = create<SamanvayStore>()(
  persist(
    (set, get) => ({
      institutions: MOCK_INSTITUTIONS,
      complaints: ALL_COMPLAINTS,
      overlaps: MOCK_OVERLAPS,
      coordinations: MOCK_COORDINATION_TASKS,
      auditLogs: MOCK_AUDIT_LOGS,
      currentOfficer: MOCK_OFFICERS[0], // Default: Dr. R. K. Srivastava

      isAnalyzing: false,
      analysisMessage: null,

      setCurrentOfficer: (officer: Officer) => {
        set({ currentOfficer: officer });
      },

      updateComplaintStatus: (id: string, newStatus: ComplaintStatus, remarks: string) => {
        const { complaints, currentOfficer, auditLogs } = get();
        const target = complaints.find((c) => c.id === id);
        if (!target) return;

        const prevStatus = target.currentStatus;
        const now = new Date().toISOString();

        const updatedComplaints = complaints.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              currentStatus: newStatus,
              lastAction: `Status changed to ${newStatus}: ${remarks}`,
              lastActionDate: now.split("T")[0],
              actionHistory: [
                {
                  id: `ACT-${Date.now()}`,
                  date: now.split("T")[0],
                  action: `Status Update: ${newStatus}`,
                  officer: currentOfficer.name,
                  bureau: currentOfficer.bureau,
                  remarks,
                },
                ...c.actionHistory,
              ],
            };
          }
          return c;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "COMPLAINT",
          targetReference: id,
          action: `Status Changed to ${newStatus}`,
          previousStatus: prevStatus,
          updatedStatus: newStatus,
          remarks,
        };

        set({
          complaints: updatedComplaints,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      assignComplaintOfficer: (id: string, officer: Officer, remarks: string) => {
        const { complaints, currentOfficer, auditLogs } = get();
        const target = complaints.find((c) => c.id === id);
        if (!target) return;

        const now = new Date().toISOString();
        const updatedComplaints = complaints.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              assignedOfficer: officer,
              lastAction: `Reassigned to ${officer.name} (${officer.designation})`,
              lastActionDate: now.split("T")[0],
              actionHistory: [
                {
                  id: `ACT-${Date.now()}`,
                  date: now.split("T")[0],
                  action: `Officer Assigned: ${officer.name}`,
                  officer: currentOfficer.name,
                  bureau: currentOfficer.bureau,
                  remarks: remarks || `Reassigned from ${c.assignedOfficer.name}`,
                },
                ...c.actionHistory,
              ],
            };
          }
          return c;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "COMPLAINT",
          targetReference: id,
          action: `Reassigned Officer to ${officer.name}`,
          remarks: remarks || `Reassigned from ${target.assignedOfficer.name}`,
        };

        set({
          complaints: updatedComplaints,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      transferComplaint: (id: string, newBureau: Bureau, remarks: string) => {
        const { complaints, currentOfficer, auditLogs } = get();
        const target = complaints.find((c) => c.id === id);
        if (!target) return;

        const prevBureau = target.bureau;
        const now = new Date().toISOString();

        const updatedComplaints = complaints.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              bureau: newBureau,
              lastAction: `Transferred jurisdiction to ${newBureau}`,
              lastActionDate: now.split("T")[0],
              actionHistory: [
                {
                  id: `ACT-${Date.now()}`,
                  date: now.split("T")[0],
                  action: `Jurisdiction Transferred`,
                  officer: currentOfficer.name,
                  bureau: currentOfficer.bureau,
                  remarks: `Transferred from ${prevBureau} to ${newBureau}. ${remarks}`,
                },
                ...c.actionHistory,
              ],
            };
          }
          return c;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "COMPLAINT",
          targetReference: id,
          action: `Transferred Bureau Jurisdiction`,
          remarks: `Transferred from ${prevBureau} to ${newBureau}: ${remarks}`,
        };

        set({
          complaints: updatedComplaints,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      escalateComplaint: (id: string, remarks: string) => {
        const { complaints, currentOfficer, auditLogs } = get();
        const target = complaints.find((c) => c.id === id);
        if (!target) return;

        const now = new Date().toISOString();
        const updatedComplaints = complaints.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              priority: "CRITICAL" as Priority,
              slaCondition: "ESCALATED" as const,
              lastAction: `Escalated by ${currentOfficer.name}: ${remarks}`,
              lastActionDate: now.split("T")[0],
              actionHistory: [
                {
                  id: `ACT-${Date.now()}`,
                  date: now.split("T")[0],
                  action: `Case Escalated`,
                  officer: currentOfficer.name,
                  bureau: currentOfficer.bureau,
                  remarks,
                },
                ...c.actionHistory,
              ],
            };
          }
          return c;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "COMPLAINT",
          targetReference: id,
          action: "Case Escalated to Supervisory Review",
          previousStatus: target.priority,
          updatedStatus: "CRITICAL",
          remarks,
        };

        set({
          complaints: updatedComplaints,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      addComplaintRemark: (id: string, remarks: string) => {
        const { complaints, currentOfficer, auditLogs } = get();
        const now = new Date().toISOString();

        const updatedComplaints = complaints.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              lastAction: remarks,
              lastActionDate: now.split("T")[0],
              actionHistory: [
                {
                  id: `ACT-${Date.now()}`,
                  date: now.split("T")[0],
                  action: "Officer Note Added",
                  officer: currentOfficer.name,
                  bureau: currentOfficer.bureau,
                  remarks,
                },
                ...c.actionHistory,
              ],
            };
          }
          return c;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "COMPLAINT",
          targetReference: id,
          action: "Added Officer Case Note",
          remarks,
        };

        set({
          complaints: updatedComplaints,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      confirmOverlap: (overlapId: string, notes: string, assignedOwnerName?: string) => {
        const { overlaps, currentOfficer, auditLogs } = get();
        const target = overlaps.find((o) => o.id === overlapId);
        if (!target) return;

        const now = new Date().toISOString();
        const updatedOverlaps = overlaps.map((o) => {
          if (o.id === overlapId) {
            return {
              ...o,
              reviewStatus: "CONFIRMED_RELATIONSHIP" as ReviewStatus,
              officerDecision: {
                officerName: currentOfficer.name,
                officerBureau: currentOfficer.bureau,
                decisionDate: now,
                action: "Confirm Relationship",
                notes,
                assignedOwner: assignedOwnerName || currentOfficer.name,
              },
            };
          }
          return o;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "OVERLAP",
          targetReference: overlapId,
          action: "Confirmed Regulatory Relationship",
          previousStatus: target.reviewStatus,
          updatedStatus: "CONFIRMED_RELATIONSHIP",
          remarks: notes || "Officer validated AI matching hypothesis",
        };

        set({
          overlaps: updatedOverlaps,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      markOverlapUnrelated: (overlapId: string, notes: string) => {
        const { overlaps, currentOfficer, auditLogs } = get();
        const target = overlaps.find((o) => o.id === overlapId);
        if (!target) return;

        const now = new Date().toISOString();
        const updatedOverlaps = overlaps.map((o) => {
          if (o.id === overlapId) {
            return {
              ...o,
              reviewStatus: "MARKED_UNRELATED" as ReviewStatus,
              classification: "UNRELATED" as const,
              officerDecision: {
                officerName: currentOfficer.name,
                officerBureau: currentOfficer.bureau,
                decisionDate: now,
                action: "Mark Unrelated",
                notes: notes || "Dismissed as unrelated distinct institutional matters.",
              },
            };
          }
          return o;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "OVERLAP",
          targetReference: overlapId,
          action: "Marked Cases Unrelated",
          previousStatus: target.reviewStatus,
          updatedStatus: "MARKED_UNRELATED",
          remarks: notes || "Officer determined complaints are independent without regulatory conflict",
        };

        set({
          overlaps: updatedOverlaps,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      requestCoordination: (
        overlapId: string,
        notes: string,
        ownerOfficer?: Officer,
        deadline?: string
      ) => {
        const { overlaps, coordinations, currentOfficer, auditLogs, complaints } = get();
        const target = overlaps.find((o) => o.id === overlapId);
        if (!target) return "";

        const assignedOfficer = ownerOfficer || currentOfficer;
        const now = new Date().toISOString();
        const targetDeadline =
          deadline ||
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const newCoordinationId = `COORD-2026-${String(coordinations.length + 1).padStart(3, "0")}`;

        const newCoordination: CoordinationTask = {
          id: newCoordinationId,
          overlapGroupId: overlapId,
          institutionId: target.institutionId,
          institutionName: target.institutionName,
          caseIds: [target.caseAId, target.caseBId],
          bureaus: [target.bureauA, target.bureauB],
          coordinationOwner: assignedOfficer,
          status: "OPEN",
          priority: target.priority,
          requiredAction: notes || `Cross-bureau coordination between ${target.bureauA} and ${target.bureauB}`,
          deadline: targetDeadline,
          createdAt: now,
          updatedAt: now,
          timeline: [
            {
              id: `CTL-${Date.now()}`,
              timestamp: now,
              officer: currentOfficer.name,
              bureau: currentOfficer.bureau,
              message: `Coordination task created from Overlap Hub. Assigned owner: ${assignedOfficer.name} (${assignedOfficer.bureau}). Remarks: ${notes}`,
              actionType: "ASSIGNED",
            },
          ],
        };

        // Update Overlap review status
        const updatedOverlaps = overlaps.map((o) => {
          if (o.id === overlapId) {
            return {
              ...o,
              reviewStatus: "COORDINATION_ACTIVE" as ReviewStatus,
              officerDecision: {
                officerName: currentOfficer.name,
                officerBureau: currentOfficer.bureau,
                decisionDate: now,
                action: "Requested Cross-Bureau Coordination",
                notes,
                assignedOwner: assignedOfficer.name,
              },
            };
          }
          return o;
        });

        // Update connected complaints to COORDINATION_REQUIRED
        const updatedComplaints = complaints.map((c) => {
          if (c.id === target.caseAId || c.id === target.caseBId) {
            return {
              ...c,
              currentStatus: "COORDINATION_REQUIRED" as ComplaintStatus,
              lastAction: `Active in Coordination Task ${newCoordinationId}`,
              lastActionDate: now.split("T")[0],
            };
          }
          return c;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "COORDINATION",
          targetReference: newCoordinationId,
          action: "Initiated Cross-Bureau Coordination Task",
          previousStatus: target.reviewStatus,
          updatedStatus: "COORDINATION_ACTIVE",
          remarks: `Linked cases ${target.caseAId} & ${target.caseBId} under ${assignedOfficer.name}`,
        };

        set({
          overlaps: updatedOverlaps,
          coordinations: [newCoordination, ...coordinations],
          complaints: updatedComplaints,
          auditLogs: [newAudit, ...auditLogs],
        });

        return newCoordinationId;
      },

      runSimulatedAnalysis: async (overlapId?: string) => {
        set({
          isAnalyzing: true,
          analysisMessage: "Step 1/5: Resolving AICTE Permanent Institution Identity...",
        });

        await new Promise((res) => setTimeout(res, 600));

        set({
          analysisMessage: "Step 2/5: Extracting semantic allegations & computing embedding similarity...",
        });

        await new Promise((res) => setTimeout(res, 700));

        set({
          analysisMessage: "Step 3/5: Cross-referencing regulatory clauses & active Bureau dockets...",
        });

        await new Promise((res) => setTimeout(res, 600));

        set({
          analysisMessage: "Step 4/5: Synthesizing explainable evidence & conflict classification...",
        });

        await new Promise((res) => setTimeout(res, 500));

        set({
          analysisMessage: "Step 5/5: Analysis complete. Presenting decision dossier for human officer validation.",
        });

        await new Promise((res) => setTimeout(res, 400));

        set({
          isAnalyzing: false,
          analysisMessage: null,
        });
      },

      assignCoordinationOwner: (coordinationId: string, officer: Officer, remarks: string) => {
        const { coordinations, currentOfficer, auditLogs } = get();
        const target = coordinations.find((c) => c.id === coordinationId);
        if (!target) return;

        const now = new Date().toISOString();
        const updated = coordinations.map((c) => {
          if (c.id === coordinationId) {
            return {
              ...c,
              coordinationOwner: officer,
              updatedAt: now,
              timeline: [
                {
                  id: `CTL-${Date.now()}`,
                  timestamp: now,
                  officer: currentOfficer.name,
                  bureau: currentOfficer.bureau,
                  message: `Reassigned coordination lead to ${officer.name} (${officer.bureau}). ${remarks}`,
                  actionType: "ASSIGNED" as const,
                },
                ...c.timeline,
              ],
            };
          }
          return c;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "COORDINATION",
          targetReference: coordinationId,
          action: `Assigned Lead Owner: ${officer.name}`,
          remarks,
        };

        set({
          coordinations: updated,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      addCoordinationTimelineItem: (
        coordinationId: string,
        message: string,
        actionType: "NOTE" | "JOINT_NOTICE" | "HEARING_SCHEDULED" | "STATUS_UPDATE" | "ESCALATED"
      ) => {
        const { coordinations, currentOfficer, auditLogs } = get();
        const now = new Date().toISOString();

        const updated = coordinations.map((c) => {
          if (c.id === coordinationId) {
            return {
              ...c,
              updatedAt: now,
              timeline: [
                {
                  id: `CTL-${Date.now()}`,
                  timestamp: now,
                  officer: currentOfficer.name,
                  bureau: currentOfficer.bureau,
                  message,
                  actionType,
                },
                ...c.timeline,
              ],
            };
          }
          return c;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "COORDINATION",
          targetReference: coordinationId,
          action: `Recorded Coordination Event: ${actionType}`,
          remarks: message,
        };

        set({
          coordinations: updated,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      updateCoordinationStatus: (
        coordinationId: string,
        newStatus: "OPEN" | "IN_REVIEW" | "JOINT_ACTION_SCHEDULED" | "RESOLVED",
        remarks: string
      ) => {
        const { coordinations, currentOfficer, auditLogs } = get();
        const target = coordinations.find((c) => c.id === coordinationId);
        if (!target) return;

        const prev = target.status;
        const now = new Date().toISOString();

        const updated = coordinations.map((c) => {
          if (c.id === coordinationId) {
            return {
              ...c,
              status: newStatus,
              updatedAt: now,
              timeline: [
                {
                  id: `CTL-${Date.now()}`,
                  timestamp: now,
                  officer: currentOfficer.name,
                  bureau: currentOfficer.bureau,
                  message: `Coordination status changed from ${prev} to ${newStatus}. ${remarks}`,
                  actionType: "STATUS_UPDATE" as const,
                },
                ...c.timeline,
              ],
            };
          }
          return c;
        });

        const newAudit: AuditRecord = {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          officer: currentOfficer.name,
          bureau: currentOfficer.bureau,
          targetType: "COORDINATION",
          targetReference: coordinationId,
          action: `Updated Coordination Status to ${newStatus}`,
          previousStatus: prev,
          updatedStatus: newStatus,
          remarks,
        };

        set({
          coordinations: updated,
          auditLogs: [newAudit, ...auditLogs],
        });
      },

      resetToDefaults: () => {
        set({
          institutions: MOCK_INSTITUTIONS,
          complaints: ALL_COMPLAINTS,
          overlaps: MOCK_OVERLAPS,
          coordinations: MOCK_COORDINATION_TASKS,
          auditLogs: MOCK_AUDIT_LOGS,
          currentOfficer: MOCK_OFFICERS[0],
          isAnalyzing: false,
          analysisMessage: null,
        });
      },
    }),
    {
      name: "samanvay-ai-storage-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        institutions: state.institutions,
        complaints: state.complaints,
        overlaps: state.overlaps,
        coordinations: state.coordinations,
        auditLogs: state.auditLogs,
        currentOfficer: state.currentOfficer,
      }),
    }
  )
);
