"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  UserCheck,
  Server,
  Database,
  Layers,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_OFFICERS } from "@/data/mockData";

export default function SettingsPage() {
  const { currentOfficer, setCurrentOfficer, resetToDefaults, complaints, overlaps, coordinations } =
    useSamanvayStore();

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (confirm("Reset all synthetic demonstration data to default state? Any added notes and coordination tasks will be reset.")) {
      resetToDefaults();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
              Demonstration &amp; System Settings
            </h1>
            <Badge variant="outline" size="sm">SIH Prototype Controls</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure active officer personas, reset local storage state, and inspect technical architectural mapping.
          </p>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset State to Default
          </Button>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Default synthetic dataset restored successfully.
        </div>
      )}

      {/* Grid: Officer Switcher & State Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Officer Switcher */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Active Officer Persona</CardTitle>
              <CardDescription>
                Select an administrative role to test bureau-specific permissions and authorization flows
              </CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-2">
            {MOCK_OFFICERS.map((off) => {
              const isSelected = currentOfficer.id === off.id;
              return (
                <div
                  key={off.id}
                  onClick={() => setCurrentOfficer(off)}
                  className={`p-3 rounded-md border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-50/50 border-blue-500 ring-1 ring-blue-500"
                      : "bg-white border-border hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-neutral-900">{off.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {off.bureau} • {off.designation}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{off.email}</p>
                  </div>
                  {isSelected && (
                    <Badge variant="default" size="sm">
                      <UserCheck className="w-3 h-3 mr-1" /> Active
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Local Storage & Cache Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Frontend Mock State Telemetry</CardTitle>
                <CardDescription>
                  In-browser persistent storage via Zustand and localStorage
                </CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-slate-500">Active Complaints in Memory:</span>
                <span className="font-semibold text-neutral-900">{complaints.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-slate-500">Detected Overlap Groups:</span>
                <span className="font-semibold text-amber-900">{overlaps.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-slate-500">Coordinated Workflows:</span>
                <span className="font-semibold text-blue-600">{coordinations.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-slate-500">Storage Mechanism:</span>
                <span className="font-mono text-slate-700">localStorage (samanvay-ai-storage-v1)</span>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={handleReset} className="w-full text-xs">
                  Purge &amp; Reset Demo Memory
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Hackathon Specification</CardTitle>
                <CardDescription>Problem Statement 26264 details</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-2 text-xs text-slate-600">
              <p>
                <strong>Organization:</strong> All India Council for Technical Education (AICTE)
              </p>
              <p>
                <strong>Theme:</strong> Smart Automation &amp; Regulatory Coordination
              </p>
              <p>
                <strong>Core Innovation:</strong> Institutional Identity Resolution, Semantic Vector Matching, and Human-in-the-Loop Coordination Mesh.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Production Architecture Roadmap (Section 3 of Master Prompt) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <div>
              <CardTitle>Future Production Architecture Blueprint</CardTitle>
              <CardDescription>
                Frontend decoupled with service/repository interfaces ready for enterprise backend integration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-1">
          <div className="p-3 bg-slate-50 rounded border border-border space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              API Gateway
            </div>
            <p className="text-[11px] text-slate-600">
              Node.js / Express microservices with OpenAPI contract compliance and JWT RBAC.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-border space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Relational Storage
            </div>
            <p className="text-[11px] text-slate-600">
              PostgreSQL with strict foreign key constraints between Permanent IDs and complaints.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-border space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              Vector Engine
            </div>
            <p className="text-[11px] text-slate-600">
              pgvector extension for high-dimensional semantic search and similarity clustering.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-border space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Async Queues
            </div>
            <p className="text-[11px] text-slate-600">
              Redis &amp; BullMQ worker queues for continuous background overlap ingestion and SLA alerts.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
