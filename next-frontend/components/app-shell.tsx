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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900">
      <MobileMenu />
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 flex-shrink-0 hidden lg:block">
            <Sidebar />
          </div>
          <div className="flex-1 min-w-0">
            <PageHeader />
            <main>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
