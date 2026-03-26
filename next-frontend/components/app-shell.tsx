"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileMenu } from "./mobile-menu";
import { PageHeader } from "./page-header";

// Paths that should NOT have the app shell (sidebar, header)
const AUTH_PATHS = ["/login", "/auth/"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--app-bg)" }}>
      {/* Sidebar — hidden on mobile */}
      <div className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r" style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-bg)" }}>
        <Sidebar />
      </div>

      {/* Mobile menu trigger */}
      <MobileMenu />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-6 lg:p-8">
          <PageHeader />
          {children}
        </main>
      </div>
    </div>
  );
}
