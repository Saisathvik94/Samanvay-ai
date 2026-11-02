"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  ArrowRight,
  Clock,
  UserCheck,
  FileText,
  GitCompare,
  Building2,
  Users2,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { exportToCsv } from "@/lib/exportCsv";

export default function AuditTrailPage() {
  const { auditLogs } = useSamanvayStore();

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedBureau, setSelectedBureau] = useState("ALL");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        search === "" ||
        log.officer.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.remarks.toLowerCase().includes(search.toLowerCase()) ||
        log.targetReference.toLowerCase().includes(search.toLowerCase());

      const matchType = selectedType === "ALL" || log.targetType === selectedType;
      const matchBureau = selectedBureau === "ALL" || log.bureau.includes(selectedBureau);

      return matchSearch && matchType && matchBureau;
    });
  }, [auditLogs, search, selectedType, selectedBureau]);

  const handleExport = () => {
    const data = filteredLogs.map((log) => ({
      Audit_ID: log.id,
      Timestamp: log.timestamp,
      Officer: log.officer,
      Bureau: log.bureau,
      Target_Type: log.targetType,
      Target_Reference: log.targetReference,
      Action_Taken: log.action,
      Previous_Status: log.previousStatus || "—",
      Updated_Status: log.updatedStatus || "—",
      Remarks: log.remarks,
    }));
    exportToCsv("AICTE_Samanvay_Audit_Trail", data);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
              Administrative Audit Trail
            </h1>
            <Badge variant="outline" size="sm">
              Tamper-Evident History
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable system logs capturing every complaint status mutation, officer reassignment, overlap confirmation, and coordination event.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export Audit Trail ({filteredLogs.length})
          </Button>
        </div>
      </div>

      {/* Audit Banner Note */}
      <div className="p-3 bg-slate-50 border border-border rounded-md text-[11px] text-slate-600 flex items-center justify-between">
        <span>
          <strong>Simulated Audit System:</strong> Every interaction performed during your session creates a typed audit event persisted in frontend storage for SIH demonstration fidelity.
        </span>
        <Badge variant="secondary" size="sm">Append-Only UI Log</Badge>
      </div>

      {/* Filter and Search Bar */}
      <Card compact className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by officer name, action, docket ID, or remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs border border-border rounded-md text-neutral-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Target Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 text-xs border border-border rounded-md text-neutral-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Entity Types</option>
              <option value="COMPLAINT">Complaint Events</option>
              <option value="OVERLAP">AI Overlap Validations</option>
              <option value="COORDINATION">Coordination Actions</option>
              <option value="INSTITUTION">Institution Updates</option>
            </select>
          </div>

          {/* Bureau Filter */}
          <div>
            <select
              value={selectedBureau}
              onChange={(e) => setSelectedBureau(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 text-xs border border-border rounded-md text-neutral-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Bureaus</option>
              <option value="Regulation">Regulation Bureau</option>
              <option value="PGRC">PGRC Cell</option>
              <option value="Approval">Approval Bureau</option>
              <option value="Regional">Regional Offices</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Log Chronology Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-slate-500 bg-slate-50/80">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Officer &amp; Bureau</th>
                <th className="py-2.5 px-3 font-semibold">Target Entity</th>
                <th className="py-2.5 px-3 font-semibold">Action Performed</th>
                <th className="py-2.5 px-3 font-semibold">Status Change</th>
                <th className="py-2.5 px-3 font-semibold">Audit Remarks / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  // Resolve Target Link
                  let targetHref = "#";
                  if (log.targetType === "COMPLAINT") {
                    targetHref = `/complaints/${log.targetReference}`;
                  } else if (log.targetType === "OVERLAP") {
                    targetHref = `/intelligence?group=${log.targetReference}`;
                  } else if (log.targetType === "COORDINATION") {
                    targetHref = `/coordination?id=${log.targetReference}`;
                  } else if (log.targetType === "INSTITUTION") {
                    targetHref = `/institutions/${log.targetReference}`;
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {formatDateTime(log.timestamp)}
                      </td>

                      {/* Officer & Bureau */}
                      <td className="py-3 px-3">
                        <p className="font-semibold text-neutral-900">{log.officer}</p>
                        <p className="text-[10px] text-slate-500">{log.bureau.split(" ")[0]}</p>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-3">
                        <Link
                          href={targetHref}
                          className="font-mono text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {log.targetType === "COMPLAINT" && (
                            <FileText className="w-3 h-3 text-slate-400" />
                          )}
                          {log.targetType === "OVERLAP" && (
                            <GitCompare className="w-3 h-3 text-amber-500" />
                          )}
                          {log.targetType === "COORDINATION" && (
                            <Users2 className="w-3 h-3 text-emerald-600" />
                          )}
                          {log.targetType === "INSTITUTION" && (
                            <Building2 className="w-3 h-3 text-slate-400" />
                          )}
                          {log.targetReference}
                        </Link>
                        <span className="text-[10px] text-slate-400 block">{log.targetType}</span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{log.action}</span>
                      </td>

                      {/* Status Change */}
                      <td className="py-3 px-3">
                        {log.previousStatus && log.updatedStatus ? (
                          <div className="flex items-center gap-1 text-[11px] font-mono">
                            <span className="text-slate-400 line-through">
                              {log.previousStatus}
                            </span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="text-blue-700 font-bold">
                              {log.updatedStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-3 text-slate-700 max-w-xs text-[11px]">
                        {log.remarks}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
