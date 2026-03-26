"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-user";
import { getRoleDisplayName } from "@/lib/constants";
import { LanguageToggle } from "./language-switcher";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = useTranslations();
  const { isAdmin, handleAdminLogout } = useAdmin();
  const { member } = useUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on nav
  useEffect(() => { setIsOpen(false); }, [pathname]);

  const navItems = [
    { href: "/", label: "Schedule" },
    { href: "/stats", label: "Analytics", adminOnly: true },
  ];

  return (
    <div className="lg:hidden" ref={dropdownRef}>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-lg border transition-colors"
        style={{
          backgroundColor: "var(--app-surface)",
          borderColor: "var(--app-border)",
          color: "var(--app-text)",
        }}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
            <path d="M1 1H14M1 6H14M1 11H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="fixed top-16 right-4 z-40 w-60 rounded-xl shadow-2xl border p-3"
          style={{
            backgroundColor: "var(--app-surface)",
            borderColor: "var(--app-border)",
          }}
        >
          <div className="space-y-3">
            {/* Brand */}
            <div className="flex items-center gap-2 px-2 pb-1">
              <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "var(--app-accent)", color: "#0d1117" }}>
                ♪
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>Band</span>
            </div>

            <div className="h-px" style={{ backgroundColor: "var(--app-border)" }} />

            {/* Nav */}
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isLocked = item.adminOnly && !isAdmin;

                if (isLocked) {
                  return (
                    <div
                      key={item.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-not-allowed"
                      style={{ color: "var(--app-text-muted)", opacity: 0.4 }}
                    >
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
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive ? "font-medium" : "hover:bg-white/5"
                    )}
                    style={isActive ? {
                      backgroundColor: "var(--app-accent-dim)",
                      color: "var(--app-accent)",
                    } : {
                      color: "var(--app-text-muted)",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="h-px" style={{ backgroundColor: "var(--app-border)" }} />

            {/* User */}
            <div className="px-2 space-y-1">
              {member ? (
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>{member.name}</p>
                  <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{getRoleDisplayName(member.role)}</p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--app-text)" }}>{isAdmin ? "Administrator" : "Guest"}</p>
              )}
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(45, 212, 191, 0.1)", color: "var(--app-accent)" }}>
                  Admin
                </span>
              )}
            </div>

            <button
              onClick={() => { handleAdminLogout(); setIsOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/5"
              style={{ color: "var(--app-text-muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 12H2C1.72 12 1.5 11.78 1.5 11.5V2.5C1.5 2.22 1.72 2 2 2H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M9.5 9.5L12.5 7L9.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.5 7H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {t.logout}
            </button>

            <div className="h-px" style={{ backgroundColor: "var(--app-border)" }} />

            <div className="px-2 space-y-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>{t.language}</p>
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
