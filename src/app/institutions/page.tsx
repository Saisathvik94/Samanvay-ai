"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  MapPin,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Download,
  Filter,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { exportToCsv } from "@/lib/exportCsv";

export default function InstitutionsPage() {
  const router = useRouter();
  const { institutions, complaints } = useSamanvayStore();

  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");

  // Calculate live active complaints per institution from complaints store
  const enrichedInstitutions = useMemo(() => {
    return institutions.map((inst) => {
      const activeCount = complaints.filter(
        (c) => c.institutionId === inst.id && c.currentStatus !== "DISPOSED"
      ).length;
      return {
        ...inst,
        activeComplaintsCount: activeCount,
      };
    });
  }, [institutions, complaints]);

  const filteredInstitutions = useMemo(() => {
    return enrichedInstitutions.filter((inst) => {
      const matchSearch =
        search === "" ||
        inst.name.toLowerCase().includes(search.toLowerCase()) ||
        inst.permanentId.includes(search) ||
        inst.state.toLowerCase().includes(search.toLowerCase()) ||
        inst.shortName.toLowerCase().includes(search.toLowerCase());

      const matchRegion =
        selectedRegion === "ALL" || inst.region === selectedRegion;

      const matchType = selectedType === "ALL" || inst.type === selectedType;

      const matchRisk =
        selectedRisk === "ALL" || inst.riskRating === selectedRisk;

      return matchSearch && matchRegion && matchType && matchRisk;
    });
  }, [enrichedInstitutions, search, selectedRegion, selectedType, selectedRisk]);

  const handleExport = () => {
    const data = filteredInstitutions.map((i) => ({
      Permanent_ID: i.permanentId,
      Institution_Name: i.name,
      Short_Name: i.shortName,
      Region: i.region,
      State: i.state,
      Type: i.type,
      Established: i.establishedYear,
      Approved_Intake: i.approvedIntake,
      Active_Complaints: i.activeComplaintsCount,
      Risk_Rating: i.riskRating,
      Latest_Action: i.latestAction,
    }));
    exportToCsv("AICTE_Institution_360_Registry", data);
  };

  const regions = Array.from(new Set(institutions.map((i) => i.region)));
  const types = Array.from(new Set(institutions.map((i) => i.type)));

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
            Institution 360° Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unified institutional profiles indexed by AICTE Permanent ID, linking multi-bureau regulatory history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export Directory ({filteredInstitutions.length})
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card compact className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, PID, state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs border border-border rounded-md text-neutral-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 text-xs border border-border rounded-md text-neutral-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r} Region
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 text-xs border border-border rounded-md text-neutral-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Institution Types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 text-xs border border-border rounded-md text-neutral-800 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Risk Ratings</option>
              <option value="HIGH">High Regulatory Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk / Normal</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Institution Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstitutions.map((inst) => (
          <Card
            key={inst.id}
            className="hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
            onClick={() => router.push(`/institutions/${inst.id}`)}
          >
            <div>
              {/* Header row: Permanent ID and Risk Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  PID: {inst.permanentId}
                </span>
                {inst.riskRating === "HIGH" && (
                  <Badge variant="danger" size="sm">
                    High Risk
                  </Badge>
                )}
                {inst.riskRating === "MEDIUM" && (
                  <Badge variant="warning" size="sm">
                    Medium Risk
                  </Badge>
                )}
                {inst.riskRating === "LOW" && (
                  <Badge variant="success" size="sm">
                    Low Risk
                  </Badge>
                )}
              </div>

              {/* Institution Title */}
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {inst.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {inst.state} • {inst.region} Region
                  </span>
                </div>
              </div>

              {/* Institution Details */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-border/60">
                <div>
                  <span className="text-slate-400 block text-[10px]">Type</span>
                  <span className="font-medium text-slate-800 truncate block">{inst.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Approved Intake</span>
                  <span className="font-medium text-slate-800">{inst.approvedIntake} seats</span>
                </div>
              </div>

              {/* Latest Regulatory Action */}
              <div className="mt-3 text-[11px]">
                <span className="text-slate-400 text-[10px] block font-medium uppercase">
                  Latest Action
                </span>
                <p className="text-slate-700 line-clamp-1 mt-0.5">{inst.latestAction}</p>
              </div>
            </div>

            {/* Footer row: Active Complaints & Profile Link */}
            <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-slate-700">
                  <strong>{inst.activeComplaintsCount}</strong> Active Cases
                </span>
              </div>
              <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[11px]">
                360° Profile &rarr;
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
