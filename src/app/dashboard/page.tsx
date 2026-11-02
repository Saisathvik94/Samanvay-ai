"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { complaints, overlaps, auditLogs } = useSamanvayStore();

  // KPI Calculations from shared mock state
  const totalComplaints = complaints.length;
  const pendingCases = complaints.filter(
    (c) => c.currentStatus === "RECEIVED" || c.currentStatus === "PENDING_INQUIRY"
  ).length;
  const underProcess = complaints.filter(
    (c) =>
      c.currentStatus === "UNDER_PROCESS" ||
      c.currentStatus === "SHOW_CAUSE_ISSUED" ||
      c.currentStatus === "COORDINATION_REQUIRED"
  ).length;
  const disposedCases = complaints.filter((c) => c.currentStatus === "DISPOSED").length;
  const potentialOverlaps = overlaps.filter(
    (o) => o.reviewStatus === "PENDING_OFFICER_REVIEW" || o.reviewStatus === "COORDINATION_REQUESTED"
  ).length;
  const slaBreaches = complaints.filter(
    (c) => c.slaCondition === "OVERDUE" || c.slaCondition === "ESCALATED"
  ).length;

  // Chart Data 1: Monthly Trend
  const monthlyTrendData = [
    { month: "Sep 2025", received: 24, disposed: 18 },
    { month: "Oct 2025", received: 32, disposed: 26 },
    { month: "Nov 2025", received: 28, disposed: 24 },
    { month: "Dec 2025", received: 35, disposed: 29 },
    { month: "Jan 2026", received: 42, disposed: 31 },
    { month: "Feb 2026", received: complaints.length, disposed: disposedCases },
  ];

  // Chart Data 2: Bureau-wise Workload
  const bureauDistribution = [
    {
      bureau: "Regulation Bureau",
      active: complaints.filter(
        (c) => c.bureau.includes("Regulation") && c.currentStatus !== "DISPOSED"
      ).length,
      disposed: complaints.filter(
        (c) => c.bureau.includes("Regulation") && c.currentStatus === "DISPOSED"
      ).length,
    },
    {
      bureau: "PGRC Cell",
      active: complaints.filter(
        (c) => c.bureau.includes("PGRC") && c.currentStatus !== "DISPOSED"
      ).length,
      disposed: complaints.filter(
        (c) => c.bureau.includes("PGRC") && c.currentStatus === "DISPOSED"
      ).length,
    },
    {
      bureau: "Approval Bureau",
      active: complaints.filter(
        (c) => c.bureau.includes("Approval") && c.currentStatus !== "DISPOSED"
      ).length,
      disposed: complaints.filter(
        (c) => c.bureau.includes("Approval") && c.currentStatus === "DISPOSED"
      ).length,
    },
    {
      bureau: "Regional Offices",
      active: complaints.filter(
        (c) => c.bureau.includes("Regional") && c.currentStatus !== "DISPOSED"
      ).length,
      disposed: complaints.filter(
        (c) => c.bureau.includes("Regional") && c.currentStatus === "DISPOSED"
      ).length,
    },
  ];

  // Chart Data 3: Status Distribution
  const statusPieData = [
    { name: "Under Process", value: underProcess, color: "#2563EB" },
    { name: "Pending Inquiry", value: pendingCases, color: "#F59E0B" },
    { name: "Disposed", value: disposedCases, color: "#10B981" },
    { name: "Coordination Req.", value: potentialOverlaps * 2, color: "#8B5CF6" },
  ];

  // Top Coordination Required list
  const priorityOverlaps = overlaps.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
            Complaint Monitoring Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track institutional complaints, cross-bureau overlap detection, and coordinated regulatory action.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/demo">
            <Button variant="outline" size="sm" className="gap-1.5 text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-50">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Guided SIH Walkthrough
            </Button>
          </Link>
          <Link href="/intelligence">
            <Button size="sm" className="gap-1.5">
              <GitCompare className="w-3.5 h-3.5" />
              AI Overlap Engine
            </Button>
          </Link>
        </div>
      </div>

      {/* Six KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Complaints */}
        <Card compact className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Complaints</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-neutral-900">{totalComplaints}</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> +12% MoM
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Across all bureaus</p>
        </Card>

        {/* Pending Cases */}
        <Card compact className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Pending Initial</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-neutral-900">{pendingCases}</span>
            <Badge variant="warning" size="sm">Scrutiny</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Awaiting officer action</p>
        </Card>

        {/* Under Process */}
        <Card compact className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Under Process</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-neutral-900">{underProcess}</span>
            <span className="text-[10px] text-blue-600 font-medium">Inquiry active</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Active investigations</p>
        </Card>

        {/* Disposed Cases */}
        <Card compact className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium uppercase tracking-wider">Disposed Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-neutral-900">{disposedCases}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Resolved</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Compliance satisfied</p>
        </Card>

        {/* Potential Overlaps */}
        <Card compact className="border-amber-200 bg-amber-50/20 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Potential Overlaps</span>
            <GitCompare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-900">{potentialOverlaps}</span>
            <Badge variant="warning" size="sm">Review Req</Badge>
          </div>
          <p className="text-[10px] text-amber-700 mt-1">Cross-bureau matches</p>
        </Card>

        {/* SLA Breaches */}
        <Card compact className="border-rose-200 bg-rose-50/20 hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider">SLA Breaches</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-900">{slaBreaches}</span>
            <Badge variant="danger" size="sm">Attention</Badge>
          </div>
          <p className="text-[10px] text-rose-700 mt-1">Overdue & escalated</p>
        </Card>
      </div>

      {/* Priority Actions: Coordination Required Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-100 text-amber-800">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Priority Action: Cross-Bureau Overlaps Requiring Officer Validation</CardTitle>
              <CardDescription>
                AICTE permanent institute identity matches with multi-bureau allegations or conflicting sanctions.
              </CardDescription>
            </div>
          </div>
          <Link href="/intelligence">
            <Button variant="ghost" size="sm" className="gap-1 text-blue-600 hover:text-blue-700">
              View All Intelligence <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>

        {/* Table of Flagged Overlaps */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-slate-500 bg-slate-50/60">
                <th className="py-2.5 px-3 font-semibold">Institution & Permanent ID</th>
                <th className="py-2.5 px-3 font-semibold">Related Cases</th>
                <th className="py-2.5 px-3 font-semibold">Bureaus Involved</th>
                <th className="py-2.5 px-3 font-semibold">Overlap Classification</th>
                <th className="py-2.5 px-3 font-semibold">Confidence</th>
                <th className="py-2.5 px-3 font-semibold">Review Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {priorityOverlaps.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-neutral-900">{item.institutionName}</p>
                    <p className="text-[11px] text-slate-500">PID: {item.institutionPermanentId}</p>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                    <span className="text-blue-600 font-medium">{item.caseAId}</span> &amp;{" "}
                    <span className="text-blue-600 font-medium">{item.caseBId}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-slate-700">{item.bureauA.split(" ")[0]}</span>
                      <span className="text-[11px] text-slate-500 font-normal">vs {item.bureauB.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {item.classification === "DUPLICATE" && (
                      <Badge variant="warning">Duplicate Allegation</Badge>
                    )}
                    {item.classification === "RELATED" && (
                      <Badge variant="default">Related Context</Badge>
                    )}
                    {item.classification === "POTENTIAL_CONFLICT" && (
                      <Badge variant="danger">Potential Conflict</Badge>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-neutral-800">{item.confidence}%</span>
                    <span className="text-[10px] text-slate-400 block">Hybrid match</span>
                  </td>
                  <td className="py-3 px-3">
                    {item.reviewStatus === "PENDING_OFFICER_REVIEW" && (
                      <Badge variant="warning" size="sm">Officer Review Pending</Badge>
                    )}
                    {item.reviewStatus === "COORDINATION_REQUESTED" && (
                      <Badge variant="default" size="sm">Coordination Requested</Badge>
                    )}
                    {item.reviewStatus === "CONFIRMED_RELATIONSHIP" && (
                      <Badge variant="success" size="sm">Relationship Confirmed</Badge>
                    )}
                    {item.reviewStatus === "COORDINATION_ACTIVE" && (
                      <Badge variant="info" size="sm">Coordination Active</Badge>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 gap-1"
                      onClick={() => router.push(`/intelligence?group=${item.id}`)}
                    >
                      Review &amp; Coordinate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Complaint Inflow vs Disposal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Complaint Inflow vs Disposal Trajectory</CardTitle>
              <CardDescription>
                Monthly volumes received through CPGRAMS, direct petitions, and vigilance referrals.
              </CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7EB",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Line
                  type="monotone"
                  dataKey="received"
                  name="Complaints Received"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#2563EB" }}
                />
                <Line
                  type="monotone"
                  dataKey="disposed"
                  name="Cases Disposed"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#10B981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Status Breakdown Donut */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Case Status Distribution</CardTitle>
              <CardDescription>Live disposition of 120 institutional dockets</CardDescription>
            </div>
          </CardHeader>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7EB",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-semibold text-neutral-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bureau Workload Bar Chart & Audit Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bureau Workload */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Bureau-Wise Workload & Disposal</CardTitle>
              <CardDescription>
                Active vs disposed complaint caseload across AICTE administrative divisions.
              </CardDescription>
            </div>
          </CardHeader>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauDistribution} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="active" name="Active Inquiries" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="disposed" name="Disposed" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live Administrative Audit Feed */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Administrative Actions</CardTitle>
              <CardDescription>Live audit events and officer decisions</CardDescription>
            </div>
            <Link href="/audit" className="text-xs text-blue-600 hover:underline">
              Full Log
            </Link>
          </CardHeader>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="text-xs border-l-2 border-blue-500 pl-2.5 py-0.5 space-y-0.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-700">{log.officer}</span>
                  <span>{formatDate(log.timestamp)}</span>
                </div>
                <p className="font-medium text-neutral-900 text-[11px]">{log.action}</p>
                <p className="text-[10px] text-slate-500 truncate">{log.remarks}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
