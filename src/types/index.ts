export type Bureau =
  | "Regulation Bureau (RB)"
  | "Public Grievance Redressal Cell (PGRC)"
  | "Approval Bureau (AB)"
  | "Regional Office - North (RO-N)"
  | "Regional Office - South (RO-S)"
  | "Regional Office - West (RO-W)";

export type ShortBureau = "RB" | "PGRC" | "AB" | "RO-N" | "RO-S" | "RO-W";

export type ComplaintStatus =
  | "RECEIVED"
  | "UNDER_PROCESS"
  | "PENDING_INQUIRY"
  | "SHOW_CAUSE_ISSUED"
  | "COORDINATION_REQUIRED"
  | "DISPOSED"
  | "REJECTED";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type OverlapClassification =
  | "DUPLICATE"
  | "RELATED"
  | "POTENTIAL_CONFLICT"
  | "UNRELATED";

export type ReviewStatus =
  | "PENDING_OFFICER_REVIEW"
  | "CONFIRMED_RELATIONSHIP"
  | "MARKED_UNRELATED"
  | "COORDINATION_REQUESTED"
  | "COORDINATION_ACTIVE";

export type SLACondition =
  | "ON_TRACK"
  | "NEARING_DEADLINE"
  | "OVERDUE"
  | "ESCALATED";

export interface Officer {
  id: string;
  name: string;
  designation: string;
  bureau: Bureau;
  email: string;
}

export interface SupportingDocument {
  name: string;
  size: string;
  dateUploaded: string;
  type: string;
}

export interface ComplaintActionItem {
  id: string;
  date: string;
  action: string;
  officer: string;
  bureau: Bureau;
  remarks: string;
}

export interface Complaint {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionPermanentId: string;
  category: string;
  bureau: Bureau;
  assignedOfficer: Officer;
  currentStatus: ComplaintStatus;
  priority: Priority;
  dateReceived: string;
  expectedDisposalDate: string;
  slaCondition: SLACondition;
  subject: string;
  description: string;
  complainantType: "Student" | "Faculty Member" | "Parent" | "Whistleblower" | "Citizen";
  lastAction: string;
  lastActionDate: string;
  nextRequiredAction: string;
  relatedCaseIds: string[];
  overlapGroupId?: string;
  supportingDocuments: SupportingDocument[];
  actionHistory: ComplaintActionItem[];
}

export interface Institution {
  id: string;
  permanentId: string; // Fictional AICTE Permanent Institute ID, e.g., 1-432891901
  name: string;
  shortName: string;
  region: string;
  state: string;
  address: string;
  type: "Private Un-aided" | "Government" | "Govt-Aided" | "Deemed University" | "Autonomous";
  establishedYear: number;
  approvedIntake: number;
  activeComplaintsCount: number;
  bureauInvolvement: Bureau[];
  latestAction: string;
  riskRating: "LOW" | "MEDIUM" | "HIGH";
  programmes: string[];
}

export interface MatchingEvidence {
  institutionMatch: {
    score: number;
    permanentIdMatched: boolean;
    nameSimilarity: number;
    addressMatch: boolean;
    normalizedAlias: string;
  };
  semanticSimilarity: {
    score: number;
    caseAExcerpt: string;
    caseBExcerpt: string;
    keyPhrases: string[];
    sharedAllegations: string[];
  };
  regulatoryContext: {
    sharedClauses: string[];
    categoryOverlap: boolean;
    potentialConflictDescription?: string;
  };
  crossBureauActivity: {
    rbAction: string;
    pgrcAction: string;
    riskSummary: string;
  };
}

export interface OfficerDecision {
  officerName: string;
  officerBureau: Bureau;
  decisionDate: string;
  action: string;
  notes: string;
  assignedOwner?: string;
}

export interface OverlapGroup {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionPermanentId: string;
  caseAId: string;
  caseBId: string;
  bureauA: Bureau;
  bureauB: Bureau;
  classification: OverlapClassification;
  confidence: number; // e.g. 96
  reviewStatus: ReviewStatus;
  priority: Priority;
  flaggedDate: string;
  evidence: MatchingEvidence;
  officerDecision?: OfficerDecision;
}

export interface CoordinationTimelineItem {
  id: string;
  timestamp: string;
  officer: string;
  bureau: Bureau;
  message: string;
  actionType: "ASSIGNED" | "NOTE" | "JOINT_NOTICE" | "HEARING_SCHEDULED" | "STATUS_UPDATE" | "ESCALATED";
}

export interface CoordinationTask {
  id: string;
  overlapGroupId: string;
  institutionId: string;
  institutionName: string;
  caseIds: string[];
  bureaus: Bureau[];
  coordinationOwner: Officer;
  status: "OPEN" | "IN_REVIEW" | "JOINT_ACTION_SCHEDULED" | "RESOLVED";
  priority: Priority;
  requiredAction: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  timeline: CoordinationTimelineItem[];
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  officer: string;
  bureau: Bureau;
  targetType: "COMPLAINT" | "OVERLAP" | "COORDINATION" | "INSTITUTION";
  targetReference: string;
  action: string;
  previousStatus?: string;
  updatedStatus?: string;
  remarks: string;
}
