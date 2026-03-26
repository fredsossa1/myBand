"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";

export function PageHeader() {
  const pathname = usePathname();
  const t = useTranslations();
  const { isAdmin } = useAdmin();

  const getPageInfo = () => {
    switch (pathname) {
      case "/":
        return { title: "Schedule", description: "Your upcoming events" };
      case "/stats":
        return { title: "Analytics", description: "Band coverage and response rates", adminOnly: true };
      default:
        return { title: "Page", description: "" };
    }
  };

  const pageInfo = getPageInfo();
  const isRestricted = pageInfo.adminOnly && !isAdmin;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <h1
          className="text-xl font-semibold tracking-tight"
          style={{ color: isRestricted ? "var(--app-text-muted)" : "var(--app-text)" }}
        >
          {pageInfo.title}
        </h1>
        {isRestricted && (
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
            style={{ borderColor: "rgba(248, 81, 73, 0.3)", color: "#f85149", backgroundColor: "rgba(248, 81, 73, 0.08)" }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 5V3.5C4 2.67 4.67 2 5.5 2H6.5C7.33 2 8 2.67 8 3.5V5" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            Admin Only
          </span>
        )}
        {pathname === "/stats" && isAdmin && (
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(45, 212, 191, 0.1)", color: "var(--app-accent)" }}
          >
            Admin
          </span>
        )}
      </div>
      {pageInfo.description && (
        <p className="mt-1 text-sm" style={{ color: "var(--app-text-muted)" }}>
          {isRestricted ? "This page requires admin access." : pageInfo.description}
        </p>
      )}
    </div>
  );
}
