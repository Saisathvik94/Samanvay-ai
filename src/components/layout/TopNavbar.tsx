"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  ChevronDown,
  Building2,
  FileText,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { useSamanvayStore } from "@/store/useSamanvayStore";
import { MOCK_OFFICERS } from "@/data/mockData";
import { Badge } from "@/components/ui/Badge";

export const TopNavbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentOfficer, setCurrentOfficer, resetToDefaults, complaints, institutions } =
    useSamanvayStore();

  const [showOfficerMenu, setShowOfficerMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Generate breadcrumb from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumb = pathSegments.length === 0 ? ["Dashboard"] : pathSegments;

  // Search filtering
  const filteredComplaints = searchQuery.trim()
    ? complaints
        .filter(
          (c) =>
            c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 4)
    : [];

  const filteredInstitutions = searchQuery.trim()
    ? institutions
        .filter(
          (i) =>
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.permanentId.includes(searchQuery) ||
            i.state.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 z-20 shrink-0">
      {/* Left: Breadcrumbs & Page title */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-800 transition-colors font-normal"
        >
          AICTE Samanvay
        </Link>
        <span className="text-slate-300">/</span>
        {breadcrumb.map((seg, idx) => {
          const isLast = idx === breadcrumb.length - 1;
          const href = `/${breadcrumb.slice(0, idx + 1).join("/")}`;
          const formatted =
            seg.charAt(0).toUpperCase() + seg.slice(1).replace("-", " ");

          return (
            <React.Fragment key={seg}>
              {isLast ? (
                <span className="font-semibold text-neutral-900">{formatted}</span>
              ) : (
                <Link
                  href={href}
                  className="text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {formatted}
                </Link>
              )}
              {!isLast && <span className="text-slate-300">/</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Middle: Global Search */}
      <div className="relative w-80 max-w-sm hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaint, institution, ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs border border-border rounded-md text-neutral-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchOpen && searchQuery.trim().length > 1 && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSearchOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
              {filteredComplaints.length === 0 && filteredInstitutions.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-500 text-center">
                  No matching records found.
                </p>
              ) : (
                <>
                  {filteredComplaints.length > 0 && (
                    <div className="mb-2">
                      <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Complaints
                      </p>
                      {filteredComplaints.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                            router.push(`/complaints/${c.id}`);
                          }}
                          className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-medium text-neutral-900 truncate flex items-center gap-1.5">
                              <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                              {c.id}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {c.institutionName}
                            </p>
                          </div>
                          <Badge variant="secondary" size="sm">
                            {c.bureau.split(" ")[0]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredInstitutions.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Institutions
                      </p>
                      {filteredInstitutions.map((i) => (
                        <div
                          key={i.id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                            router.push(`/institutions/${i.id}`);
                          }}
                          className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-medium text-neutral-900 truncate flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              {i.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              PID: {i.permanentId} • {i.state}
                            </p>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {i.region}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: Environment Tag, Notifications, Officer Selector */}
      <div className="flex items-center gap-3">
        {/* Demo Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-800 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Demo Environment (SIH-26264)</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors relative"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-xl p-3 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <span className="font-semibold text-neutral-900">
                    Regulatory Overlap Alerts
                  </span>
                  <Badge variant="warning" size="sm">
                    3 Action Required
                  </Badge>
                </div>
                <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                  <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80">
                    <p className="font-semibold text-amber-900 text-[11px]">
                      Potential Regulatory Conflict Detected
                    </p>
                    <p className="text-[10px] text-amber-800 mt-0.5">
                      National Inst of Adv Science: RB intake curtailment vs AB seat expansion.
                    </p>
                    <Link
                      href="/intelligence"
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] font-semibold text-blue-700 hover:underline mt-1 inline-block"
                    >
                      Review in Overlap Engine &rarr;
                    </Link>
                  </div>

                  <div className="p-2 rounded bg-blue-50/70 border border-blue-200/80">
                    <p className="font-semibold text-blue-900 text-[11px]">
                      Material Duplicate Grievance
                    </p>
                    <p className="text-[10px] text-blue-800 mt-0.5">
                      Apex Inst Jaipur: Same ₹45,000 fee complaint flagged across PGRC and RB.
                    </p>
                    <Link
                      href="/intelligence"
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] font-semibold text-blue-700 hover:underline mt-1 inline-block"
                    >
                      Review Evidence &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Officer Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowOfficerMenu(!showOfficerMenu)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 text-xs border border-border rounded-md hover:bg-slate-50 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px]">
              {currentOfficer.name.split(" ").slice(-1)[0][0]}
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-neutral-900 leading-none text-xs">
                {currentOfficer.name}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                {currentOfficer.bureau.split(" ")[0]} • {currentOfficer.designation}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showOfficerMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowOfficerMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white border border-border rounded-lg shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-border/80">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Active Demonstrating Officer
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Switch role to test cross-bureau actions and approval workflows
                  </p>
                </div>

                <div className="py-1">
                  {MOCK_OFFICERS.slice(0, 5).map((off) => (
                    <button
                      key={off.id}
                      onClick={() => {
                        setCurrentOfficer(off);
                        setShowOfficerMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">{off.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {off.bureau} • {off.designation}
                        </p>
                      </div>
                      {currentOfficer.id === off.id && (
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-border/80 pt-1 px-1">
                  <button
                    onClick={() => {
                      if (confirm("Reset synthetic demonstration data to initial state?")) {
                        resetToDefaults();
                        setShowOfficerMenu(false);
                      }
                    }}
                    className="w-full px-3 py-1.5 text-left text-[11px] text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Prototype State
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
