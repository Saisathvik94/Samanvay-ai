"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  FileText,
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  GitCompare,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { exportToCsv } from "@/lib/exportCsv";
import { formatDate } from "@/lib/utils";
import { Bureau, ComplaintStatus, Priority, SLACondition } from "@/types";

export default function ComplaintsPage() {
  const router = useRouter();
  const { complaints } = useSamanvayStore();

  // Filters & State
  const [search, setSearch] = useState("");
  const [selectedBureau, setSelectedBureau] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedSla, setSelectedSla] = useState<string>("ALL");
  const [sortField, setSortField] = useState<string>("dateReceived");
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Filtered and sorted complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        search === "" ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.institutionName.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.assignedOfficer.name.toLowerCase().includes(search.toLowerCase()) ||
        c.subject.toLowerCase().includes(search.toLowerCase());

      const matchBureau =
        selectedBureau === "ALL" || c.bureau.includes(selectedBureau);

      const matchStatus =
        selectedStatus === "ALL" || c.currentStatus === selectedStatus;

      const matchPriority =
        selectedPriority === "ALL" || c.priority === selectedPriority;

      const matchSla =
        selectedSla === "ALL" || c.slaCondition === selectedSla;

      return matchSearch && matchBureau && matchStatus && matchPriority && matchSla;
    });
  }, [complaints, search, selectedBureau, selectedStatus, selectedPriority, selectedSla]);

  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (typeof valA === "string") {
        return sortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredComplaints, sortField, sortAsc]);

  // Paginated items
  const totalPages = Math.ceil(sortedComplaints.length / pageSize) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedComplaints.slice(start, start + pageSize);
  }, [sortedComplaints, page, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExport = () => {
    const exportData = sortedComplaints.map((c) => ({
      Complaint_ID: c.id,
      Institution: c.institutionName,
      Permanent_ID: c.institutionPermanentId,
      Bureau: c.bureau,
      Category: c.category,
      Status: c.currentStatus,
      Priority: c.priority,
      Officer: c.assignedOfficer.name,
      Date_Received: c.dateReceived,
      Expected_Disposal: c.expectedDisposalDate,
      SLA_Condition: c.slaCondition,
      Subject: c.subject,
    }));
    exportToCsv("AICTE_Complaints_Registry", exportData);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
            Institutional Complaint Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidated regulatory complaints received across Regulation Bureau, PGRC, Approval Bureau, and Regional Offices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV ({sortedComplaints.length})
          </Button>
          <Link href="/intelligence">
            <Button size="sm" className="gap-1.5 text-xs">
              <GitCompare className="w-3.5 h-3.5" /> Check Overlaps
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card compact className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by case ID, college, allegation or officer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs border border-border rounded-md text-neutral-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Bureau Filter */}
          <div>
            <select
              value={selectedBureau}
              onChange={(e) => {
                setSelectedBureau(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-50 text-xs border border-border rounded-md text-neutral-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Bureaus</option>
              <option value="Regulation">Regulation Bureau (RB)</option>
              <option value="PGRC">PGRC Cell</option>
              <option value="Approval">Approval Bureau (AB)</option>
              <option value="Regional">Regional Offices</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-50 text-xs border border-border rounded-md text-neutral-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Case Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="UNDER_PROCESS">Under Process</option>
              <option value="PENDING_INQUIRY">Pending Inquiry</option>
              <option value="SHOW_CAUSE_ISSUED">Show Cause Issued</option>
              <option value="COORDINATION_REQUIRED">Coordination Required</option>
              <option value="DISPOSED">Disposed</option>
            </select>
          </div>

          {/* SLA Condition Filter */}
          <div>
            <select
              value={selectedSla}
              onChange={(e) => {
                setSelectedSla(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-50 text-xs border border-border rounded-md text-neutral-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All SLA Statuses</option>
              <option value="ON_TRACK">On Track</option>
              <option value="NEARING_DEADLINE">Nearing Deadline (&lt; 7 Days)</option>
              <option value="OVERDUE">Overdue</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Counters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60 text-[11px] text-slate-500">
          <span>Active filter results: <strong>{sortedComplaints.length}</strong> cases</span>
          {(selectedBureau !== "ALL" || selectedStatus !== "ALL" || selectedSla !== "ALL" || search) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedBureau("ALL");
                setSelectedStatus("ALL");
                setSelectedPriority("ALL");
                setSelectedSla("ALL");
                setPage(1);
              }}
              className="text-blue-600 hover:underline font-medium ml-2"
            >
              Reset filters
            </button>
          )}
        </div>
      </Card>

      {/* Main Complaints Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-slate-500 bg-slate-50/80 select-none">
                <th
                  onClick={() => handleSort("id")}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Complaint ID
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">Institution &amp; Permanent ID</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Bureau &amp; Officer</th>
                <th
                  onClick={() => handleSort("currentStatus")}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">Priority</th>
                <th
                  onClick={() => handleSort("dateReceived")}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Date Received
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">SLA Health</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No complaints matched the current query or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/complaints/${c.id}`)}
                  >
                    {/* Complaint ID */}
                    <td className="py-3 px-3 font-mono font-medium text-blue-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400 group-hover:text-blue-500 shrink-0" />
                        <span>{c.id}</span>
                      </div>
                      {c.overlapGroupId && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded inline-block mt-0.5">
                          Overlap Flagged
                        </span>
                      )}
                    </td>

                    {/* Institution */}
                    <td className="py-3 px-3 max-w-[220px]">
                      <p className="font-semibold text-neutral-900 truncate">{c.institutionName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">PID: {c.institutionPermanentId}</p>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 max-w-[180px]">
                      <span className="text-slate-800 truncate block font-medium">{c.category}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{c.complainantType}</span>
                    </td>

                    {/* Bureau & Officer */}
                    <td className="py-3 px-3">
                      <p className="font-medium text-neutral-800 truncate">{c.bureau.split(" ")[0]}</p>
                      <p className="text-[11px] text-slate-500 truncate">{c.assignedOfficer.name}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      {c.currentStatus === "RECEIVED" && (
                        <Badge variant="secondary">Received</Badge>
                      )}
                      {c.currentStatus === "UNDER_PROCESS" && (
                        <Badge variant="default">Under Process</Badge>
                      )}
                      {c.currentStatus === "PENDING_INQUIRY" && (
                        <Badge variant="warning">Pending Inquiry</Badge>
                      )}
                      {c.currentStatus === "SHOW_CAUSE_ISSUED" && (
                        <Badge variant="danger">Show Cause</Badge>
                      )}
                      {c.currentStatus === "COORDINATION_REQUIRED" && (
                        <Badge variant="warning">Coordination Req</Badge>
                      )}
                      {c.currentStatus === "DISPOSED" && (
                        <Badge variant="success">Disposed</Badge>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      {c.priority === "CRITICAL" && (
                        <span className="font-semibold text-rose-700">Critical</span>
                      )}
                      {c.priority === "HIGH" && (
                        <span className="font-medium text-amber-700">High</span>
                      )}
                      {c.priority === "MEDIUM" && (
                        <span className="text-slate-600">Medium</span>
                      )}
                      {c.priority === "LOW" && (
                        <span className="text-slate-400">Low</span>
                      )}
                    </td>

                    {/* Date Received */}
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(c.dateReceived)}
                    </td>

                    {/* SLA Condition */}
                    <td className="py-3 px-3">
                      {c.slaCondition === "ON_TRACK" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          On Track
                        </span>
                      )}
                      {c.slaCondition === "NEARING_DEADLINE" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Due Soon
                        </span>
                      )}
                      {c.slaCondition === "OVERDUE" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          Overdue
                        </span>
                      )}
                      {c.slaCondition === "ESCALATED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-900 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Escalated
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/complaints/${c.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="View Full Case File"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-slate-50/50 text-xs text-slate-600">
          <div>
            Showing <strong>{Math.min(sortedComplaints.length, (page - 1) * pageSize + 1)}</strong> to{" "}
            <strong>{Math.min(sortedComplaints.length, page * pageSize)}</strong> of{" "}
            <strong>{sortedComplaints.length}</strong> records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 border border-border rounded bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 border border-border rounded bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
