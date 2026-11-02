"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Building2,
  GitCompare,
  Users2,
  Clock,
  BarChart3,
  ShieldCheck,
  PlayCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSamanvayStore } from "@/store/useSamanvayStore";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeVariant?: "warning" | "blue";
  highlight?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { overlaps, coordinations } = useSamanvayStore();

  const pendingOverlaps = overlaps.filter(
    (o) => o.reviewStatus === "PENDING_OFFICER_REVIEW"
  ).length;

  const activeCoordinations = coordinations.filter(
    (c) => c.status !== "RESOLVED"
  ).length;

  const navGroups: NavGroup[] = [
    {
      group: "Operations",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Complaints",
          href: "/complaints",
          icon: FileText,
        },
        {
          name: "Institution 360°",
          href: "/institutions",
          icon: Building2,
        },
      ],
    },
    {
      group: "Intelligence & Hub",
      items: [
        {
          name: "AI Overlap Engine",
          href: "/intelligence",
          icon: GitCompare,
          badge: pendingOverlaps > 0 ? pendingOverlaps : undefined,
          badgeVariant: "warning",
        },
        {
          name: "Coordination Hub",
          href: "/coordination",
          icon: Users2,
          badge: activeCoordinations > 0 ? activeCoordinations : undefined,
          badgeVariant: "blue",
        },
      ],
    },
    {
      group: "Oversight",
      items: [
        {
          name: "SLA Monitor",
          href: "/sla",
          icon: Clock,
        },
        {
          name: "Reports & Analytics",
          href: "/reports",
          icon: BarChart3,
        },
        {
          name: "Audit Trail",
          href: "/audit",
          icon: ShieldCheck,
        },
      ],
    },
    {
      group: "Demonstration",
      items: [
        {
          name: "Guided SIH Demo",
          href: "/demo",
          icon: PlayCircle,
          highlight: true,
        },
        {
          name: "Settings & Reset",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-[#FAFAFA] transition-all duration-200 select-none shrink-0 z-30",
        collapsed ? "w-16" : "w-[240px]"
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-border/80 bg-white">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Landmark className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-neutral-900 tracking-wider">
                SAMANVAY AI
              </span>
              <span className="text-[10px] text-muted-foreground truncate leading-tight font-medium">
                AICTE Regulatory Intel
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors group relative",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80",
                    item.highlight && !isActive && "text-blue-700 bg-blue-50/40 font-medium"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-700",
                        item.highlight && !isActive && "text-blue-600"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {!collapsed && item.badge !== undefined && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 text-[10px] rounded-full font-semibold",
                        item.badgeVariant === "warning"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bureau Info Footer */}
      {!collapsed ? (
        <div className="p-3 border-t border-border/70 bg-white m-2 rounded-md">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-neutral-800">Coordination Mesh</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Cross-linking RB, PGRC, AB & Regional Offices
          </p>
        </div>
      ) : (
        <div className="p-2 border-t border-border/70 flex justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Coordination Active" />
        </div>
      )}
    </aside>
  );
};
