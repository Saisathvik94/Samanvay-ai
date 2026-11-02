"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Download,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { exportToCsv } from "@/lib/exportCsv";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function SlaMonitoringPage() {
  const { complaints, escalateComplaint } = useSamanvayStore();

  const [selectedBureau, setSelectedBureau] = useState("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");

  // Escalation Modal
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [targetCaseId, setTargetCaseId] = useState("");
  const [escalateRemarks, setEscalateRemarks] = useState("");

  // SLA Metrics
  const onTrackCases = complaints.filter((c) => c.slaCondition === "ON_TRACK");
  const nearingDeadlineCases = complaints.filter((c) => c.slaCondition === "NEARING_DEADLINE");
  const overdueCases = complaints.filter((c) => c.slaCondition === "OVERDUE");
  const escalatedCases = complaints.filter((c) => c.slaCondition === "ESCALATED");

  // Ageing Breakdown (simulated brackets)
  const ageingData = [
    { bracket: "0–15 Days", count: 48, fill: "#10B981" },
    { bracket: "16–30 Days", count: 38, fill: "#2563EB" },
    { bracket: "31–45 Days", count: nearingDeadlineCases.length, fill: "#F59E0B" },
    { bracket: "46–60 Days", count: overdueCases.length, fill: "#EF4444" },
    { bracket: "> 60 Days", count: escalatedCases.length, fill: "#991B1B" },
  ];

  // Bureau SLA Compliance rates
  const bureauCompliance = [
    { bureau: "Regulation Bureau", onTime: 86, overdue: 14 },
    { bureau: "PGRC Cell", onTime: 79, overdue: 21 },
    { bureau: "Approval Bureau", onTime: 92, overdue: 8 },
    { bureau: "Regional Offices", onTime: 81, overdue: 19 },
  ];

  // Filtered Table
  const filteredList = useMemo(() => {
    return complaints.filter((c) => {
      const matchBureau = selectedBureau === "ALL" || c.bureau.includes(selectedBureau);
      const matchCondition = selectedCondition === "ALL" || c.slaCondition === selectedCondition;
      return matchBureau && matchCondition && c.currentStatus !== "DISPOSED";
    });
  }, [complaints, selectedBureau, selectedCondition]);

  const handleExport = () => {
    const data = filteredList.map((c) => ({
      Case_ID: c.id,
      Institution: c.institutionName,
      Permanent_ID: c.institutionPermanentId,
      Bureau: c.bureau,
      Officer: c.assignedOfficer.name,
      SLA_Condition: c.slaCondition,
      Received: c.dateReceived,
      Expected_Disposal: c.expectedDisposalDate,
      Current_Status: c.currentStatus,
    }));
    exportToCsv("AICTE_SLA_Monitoring_Report", data);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
              Smart SLA &amp; Case Ageing Monitor
            </h1>
            <Badge variant="warning" size="sm">
              Citizen Charter Compliance
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor 30-day statutory enquiry deadlines, track case ageing, and trigger supervisory escalations across bureaus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export SLA Report ({filteredList.length})
          </Button>
        </div>
      </div>

      {/* Demo Disclaimer Note */}
      <div className="p-3 bg-slate-50 border border-border rounded-md text-[11px] text-slate-600 flex items-center justify-between">
        <span>
          <strong>Administrative Notice:</strong> Case ageing calculations and 30-day thresholds are configured for this Smart India Hackathon prototype and do not represent official AICTE policy amendments.
        </span>
        <Badge variant="secondary" size="sm">SIH-26264 Sandbox</Badge>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* On Track */}
        <Card compact className="border-emerald-200 bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider">On Track</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-950">{onTrackCases.length}</span>
            <span className="text-[10px] text-emerald-700 font-medium">Within prescribed limits</span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-1">&gt; 7 days remaining</p>
        </Card>

        {/* Nearing Deadline */}
        <Card compact className="border-amber-200 bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Nearing Deadline</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-950">{nearingDeadlineCases.length}</span>
            <Badge variant="warning" size="sm">&lt; 7 Days</Badge>
          </div>
          <p className="text-[10px] text-amber-800 mt-1">Prompt officer follow-up</p>
        </Card>

        {/* Overdue */}
        <Card compact className="border-rose-200 bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Overdue Cases</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-950">{overdueCases.length}</span>
            <Badge variant="danger" size="sm">Breached</Badge>
          </div>
          <p className="text-[10px] text-rose-800 mt-1">Exceeded 30-day window</p>
        </Card>

        {/* Escalated */}
        <Card compact className="border-rose-300 bg-rose-100/30">
          <div className="flex items-center justify-between text-rose-900">
            <span className="text-[10px] font-bold uppercase tracking-wider">Supervisory Escalated</span>
            <AlertOctagon className="w-4 h-4 text-rose-700" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-950">{escalatedCases.length}</span>
            <Badge variant="danger" size="sm">Critical</Badge>
          </div>
          <p className="text-[10px] text-rose-900 mt-1">Member Secretary review</p>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Case Ageing Breakdown */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Case Ageing Distribution</CardTitle>
              <CardDescription>Active complaints classified by elapsed days since registration</CardDescription>
            </div>
          </CardHeader>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7EB",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Complaints in Bracket" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Bureau-Wise Compliance Rate */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Bureau SLA Compliance Comparison (%)</CardTitle>
              <CardDescription>Percentage of complaints disposed within target turnaround time</CardDescription>
            </div>
          </CardHeader>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauCompliance} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="bureau" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7EB",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="onTime" name="On-Time Rate %" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Breached Rate %" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Filterable SLA Action Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-3.5 border-b border-border bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xs font-semibold text-neutral-900">
            Active Dockets Requiring SLA Attention ({filteredList.length})
          </span>

          <div className="flex items-center gap-2">
            <select
              value={selectedBureau}
              onChange={(e) => setSelectedBureau(e.target.value)}
              className="py-1 px-2 bg-white border border-border rounded text-xs"
            >
              <option value="ALL">All Bureaus</option>
              <option value="Regulation">Regulation Bureau</option>
              <option value="PGRC">PGRC Cell</option>
              <option value="Approval">Approval Bureau</option>
              <option value="Regional">Regional Offices</option>
            </select>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="py-1 px-2 bg-white border border-border rounded text-xs"
            >
              <option value="ALL">All SLA States</option>
              <option value="OVERDUE">Overdue Only</option>
              <option value="NEARING_DEADLINE">Due Soon (&lt; 7 Days)</option>
              <option value="ESCALATED">Escalated Only</option>
              <option value="ON_TRACK">On Track</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-slate-500 bg-slate-50/80">
                <th className="py-2.5 px-3 font-semibold">Case ID</th>
                <th className="py-2.5 px-3 font-semibold">Institution</th>
                <th className="py-2.5 px-3 font-semibold">Bureau &amp; Officer</th>
                <th className="py-2.5 px-3 font-semibold">Received</th>
                <th className="py-2.5 px-3 font-semibold">Target Disposal</th>
                <th className="py-2.5 px-3 font-semibold">SLA Condition</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No active cases match filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.slice(0, 15).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-blue-600">
                      <Link href={`/complaints/${c.id}`} className="hover:underline">
                        {c.id}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <p className="font-semibold text-neutral-900 truncate">{c.institutionName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">PID: {c.institutionPermanentId}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-slate-800">{c.bureau.split(" ")[0]}</p>
                      <p className="text-[10px] text-slate-500">{c.assignedOfficer.name}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(c.dateReceived)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium whitespace-nowrap">
                      {formatDate(c.expectedDisposalDate)}
                    </td>
                    <td className="py-2.5 px-3">
                      {c.slaCondition === "ON_TRACK" && (
                        <Badge variant="success" size="sm">On Track</Badge>
                      )}
                      {c.slaCondition === "NEARING_DEADLINE" && (
                        <Badge variant="warning" size="sm">Due in &lt;7d</Badge>
                      )}
                      {c.slaCondition === "OVERDUE" && (
                        <Badge variant="danger" size="sm">Overdue</Badge>
                      )}
                      {c.slaCondition === "ESCALATED" && (
                        <Badge variant="danger" size="sm">Escalated</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.slaCondition !== "ESCALATED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[11px] h-6 px-2 text-rose-700 border-rose-200 hover:bg-rose-50"
                            onClick={() => {
                              setTargetCaseId(c.id);
                              setEscalateModalOpen(true);
                            }}
                          >
                            Escalate
                          </Button>
                        )}
                        <Link href={`/complaints/${c.id}`}>
                          <Button size="sm" variant="ghost" className="text-[11px] h-6 px-1.5 text-blue-600">
                            View &rarr;
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Escalation Modal */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title={`Trigger Supervisory Escalation — ${targetCaseId}`}
        description="Notify Bureau Head of SLA delinquency"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">
              Escalation Justification &amp; Supervisory Alert
            </label>
            <textarea
              rows={3}
              placeholder="State reason for escalation: unresponsiveness of institution to inquiry summons, overdue timeline exceeding citizen charter norms..."
              value={escalateRemarks}
              onChange={(e) => setEscalateRemarks(e.target.value)}
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
              disabled={!escalateRemarks.trim()}
              onClick={() => {
                if (targetCaseId) {
                  escalateComplaint(targetCaseId, escalateRemarks);
                }
                setEscalateModalOpen(false);
                setEscalateRemarks("");
              }}
            >
              Confirm Escalation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
