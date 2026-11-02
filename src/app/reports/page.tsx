"use client";

import React, { useMemo } from "react";
import { Download } from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { exportToCsv } from "@/lib/exportCsv";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ReportsPage() {
  const { complaints, institutions, overlaps, coordinations } = useSamanvayStore();

  // Regional distribution computed from live complaints & institutions
  const regionalData = useMemo(() => {
    const regionMap: Record<string, number> = {
      "Northern": 0,
      "North-West": 0,
      "Western": 0,
      "Southern": 0,
      "South-West": 0,
      "Central": 0,
      "Eastern": 0,
    };

    complaints.forEach((c) => {
      const inst = institutions.find((i) => i.id === c.institutionId);
      if (inst && regionMap[inst.region] !== undefined) {
        regionMap[inst.region]++;
      } else {
        regionMap["Northern"]++;
      }
    });

    return Object.entries(regionMap).map(([region, total]) => ({
      region,
      total,
    }));
  }, [complaints, institutions]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    complaints.forEach((c) => {
      catMap[c.category] = (catMap[c.category] || 0) + 1;
    });

    return Object.entries(catMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  // Top Repeatedly Complained Institutions
  const topInstitutions = useMemo(() => {
    return institutions
      .map((inst) => {
        const count = complaints.filter((c) => c.institutionId === inst.id).length;
        const active = complaints.filter(
          (c) => c.institutionId === inst.id && c.currentStatus !== "DISPOSED"
        ).length;
        return {
          id: inst.id,
          name: inst.name,
          pid: inst.permanentId,
          region: inst.region,
          totalComplaints: count,
          activeComplaints: active,
          risk: inst.riskRating,
        };
      })
      .sort((a, b) => b.totalComplaints - a.totalComplaints)
      .slice(0, 7);
  }, [institutions, complaints]);

  const handleExportFull = () => {
    const data = complaints.map((c) => ({
      Case_ID: c.id,
      Institution: c.institutionName,
      Permanent_ID: c.institutionPermanentId,
      Bureau: c.bureau,
      Category: c.category,
      Status: c.currentStatus,
      Priority: c.priority,
      Date_Received: c.dateReceived,
      Expected_Disposal: c.expectedDisposalDate,
      SLA_Condition: c.slaCondition,
    }));
    exportToCsv("AICTE_Complete_Analytics_Report", data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
              Regulatory Intelligence &amp; Analytics
            </h1>
            <Badge variant="default" size="sm">Executive View</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-bureau statistical aggregates, regional clustering, and institution recidivism metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportFull} className="text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export Comprehensive Data
          </Button>
        </div>
      </div>

      {/* Top High-level Metric Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card compact>
          <span className="text-[10px] font-semibold uppercase text-slate-400">Total Docket Inflow</span>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{complaints.length}</p>
          <p className="text-[10px] text-slate-500">All registered institutional complaints</p>
        </Card>

        <Card compact>
          <span className="text-[10px] font-semibold uppercase text-slate-400">Overlap Detection Rate</span>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {((overlaps.length * 2 / complaints.length) * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-amber-700">Dockets linked across multiple bureaus</p>
        </Card>

        <Card compact>
          <span className="text-[10px] font-semibold uppercase text-slate-400">Active Joint Tasks</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{coordinations.length}</p>
          <p className="text-[10px] text-slate-500">Cross-bureau coordinated workflows</p>
        </Card>

        <Card compact>
          <span className="text-[10px] font-semibold uppercase text-slate-400">System Disposal Rate</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {((complaints.filter((c) => c.currentStatus === "DISPOSED").length / complaints.length) * 100).toFixed(0)}%
          </p>
          <p className="text-[10px] text-emerald-600">Disposed with verified compliance</p>
        </Card>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Breakdown */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Regional Complaint Distribution</CardTitle>
              <CardDescription>Territorial distribution of complaints across AICTE Regional Jurisdictions</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize: 10, fill: "#64748B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7EB",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total" name="Complaints" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Bar */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Allegation Category Breakdown</CardTitle>
              <CardDescription>Primary nature of statutory violations reported</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 10, fill: "#171717" }}
                  width={130}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7EB",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Case Count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recidivist Institutions Ranking Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-slate-50/50">
          <CardTitle>Institutions with Multiple Multi-Bureau Dockets</CardTitle>
          <CardDescription>
            Recidivism index highlighting campuses under concurrent investigation across distinct bureaus
          </CardDescription>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-slate-500 bg-slate-50/80">
                <th className="py-2.5 px-3 font-semibold">AICTE Permanent ID</th>
                <th className="py-2.5 px-3 font-semibold">Institution Name</th>
                <th className="py-2.5 px-3 font-semibold">Region</th>
                <th className="py-2.5 px-3 font-semibold">Total Complaints</th>
                <th className="py-2.5 px-3 font-semibold">Active Inquiries</th>
                <th className="py-2.5 px-3 font-semibold">Regulatory Risk</th>
                <th className="py-2.5 px-3 font-semibold text-right">View 360°</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {topInstitutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-blue-700">
                    {inst.pid}
                  </td>
                  <td className="py-3 px-3 font-semibold text-neutral-900">
                    {inst.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{inst.region}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {inst.totalComplaints}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-rose-700">{inst.activeComplaints} Active</span>
                  </td>
                  <td className="py-3 px-3">
                    {inst.risk === "HIGH" && <Badge variant="danger" size="sm">High Risk</Badge>}
                    {inst.risk === "MEDIUM" && <Badge variant="warning" size="sm">Medium Risk</Badge>}
                    {inst.risk === "LOW" && <Badge variant="success" size="sm">Low Risk</Badge>}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => (window.location.href = `/institutions/${inst.id}`)}
                    >
                      Inspect Profile &rarr;
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
