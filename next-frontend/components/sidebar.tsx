"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-switcher";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-user";
import { getRoleDisplayName } from "@/lib/constants";

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 6.5H14.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 1.5V3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M11 1.5V3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L5.5 7.5L8.5 10L11.5 5L14 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 14H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M6 13H2.5C2.22 13 2 12.78 2 12.5V2.5C2 2.22 2.22 2 2.5 2H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M10 10L13 7.5L10 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 7.5H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { isAdmin, handleAdminLogout } = useAdmin();
  const { member } = useUser();

  const navItems = [
    { href: "/", label: "Schedule", icon: <CalendarIcon /> },
    { href: "/stats", label: "Analytics", icon: <ChartIcon />, adminOnly: true },
  ];

  return (
    <div className="flex flex-col h-full py-4">
      {/* Brand */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "var(--app-accent)", color: "#0d1117" }}>
            ♪
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
            Band
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = item.adminOnly && !isAdmin;

          if (isLocked) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-not-allowed select-none"
                style={{ color: "var(--app-text-muted)", opacity: 0.4 }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
                <svg className="ml-auto w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 5V3.5C4 2.67 4.67 2 5.5 2H6.5C7.33 2 8 2.67 8 3.5V5" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150",
                isActive
                  ? "font-medium"
                  : "hover:bg-white/5"
              )}
              style={isActive ? {
                backgroundColor: "var(--app-accent-dim)",
                color: "var(--app-accent)",
              } : {
                color: "var(--app-text-muted)",
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 mt-4 space-y-4">
        <div className="h-px" style={{ backgroundColor: "var(--app-border)" }} />

        {/* User info */}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider font-medium" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
            Signed in as
          </p>
          {member ? (
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>{member.name}</p>
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{getRoleDisplayName(member.role)}</p>
            </div>
          ) : (
            <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
              {isAdmin ? "Administrator" : "Guest"}
            </p>
          )}
          {isAdmin && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: "rgba(45, 212, 191, 0.1)", color: "var(--app-accent)" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1L6.5 3.5H9L7 5.5L7.5 8.5L5 7L2.5 8.5L3 5.5L1 3.5H3.5L5 1Z" fill="currentColor"/>
              </svg>
              Admin
            </span>
          )}
        </div>

        <button
          onClick={handleAdminLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors duration-150 hover:bg-white/5"
          style={{ color: "var(--app-text-muted)" }}
        >
          <LogoutIcon />
          <span>{t.logout}</span>
        </button>

        <div className="h-px" style={{ backgroundColor: "var(--app-border)" }} />

        {/* Language */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-medium" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
            {t.language}
          </p>
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
