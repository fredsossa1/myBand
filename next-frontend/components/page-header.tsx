"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PageHeader() {
  const pathname = usePathname();
  const t = useTranslations();
  const { isAdmin } = useAdmin();

  // Define page configurations
  const getPageInfo = () => {
    switch (pathname) {
      case "/":
        return {
          title: t.home,
          icon: "🏠",
          description: "Dashboard overview",
        };
      case "/availability":
        return {
          title: t.availability,
          icon: "📅",
          description: t.manageAvailabilityDescription,
        };
      case "/stats":
        return {
          title: t.statistics,
          icon: "📊",
          description: "Band statistics and analytics",
          adminOnly: true,
        };
      default:
        return {
          title: "Unknown Page",
          icon: "📄",
          description: "",
        };
    }
  };

  const pageInfo = getPageInfo();

  // If this is an admin-only page and user is not admin, show restricted message
  const isRestrictedPage = pageInfo.adminOnly && !isAdmin;

  return (
    <Card className="glass border-white/20 mb-6">
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl lg:text-3xl ${
              isRestrictedPage ? "opacity-50" : ""
            }`}
          >
            {pageInfo.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1
                className={`text-white text-lg lg:text-xl font-semibold ${
                  isRestrictedPage ? "opacity-50" : ""
                }`}
              >
                {pageInfo.title}
              </h1>
              {isRestrictedPage && (
                <Badge
                  variant="outline"
                  className="border-red-500/50 text-red-300 text-xs"
                >
                  🔒 Admin Only
                </Badge>
              )}
              {pathname === "/stats" && isAdmin && (
                <Badge
                  variant="outline"
                  className="border-green-500/50 text-green-300 text-xs"
                >
                  👑 Admin Access
                </Badge>
              )}
            </div>
            {pageInfo.description && (
              <p
                className={`text-white/70 text-sm lg:text-base mt-1 ${
                  isRestrictedPage ? "opacity-50" : ""
                }`}
              >
                {isRestrictedPage
                  ? "This page requires admin access. Please log in as admin to view statistics."
                  : pageInfo.description}
              </p>
            )}
          </div>
          {/* Breadcrumb trail */}
          <div className="hidden sm:flex items-center text-white/60 text-sm">
            <span>🎵</span>
            <span className="mx-2">/</span>
            <span
              className={`text-white/80 ${
                isRestrictedPage ? "opacity-50" : ""
              }`}
            >
              {pageInfo.title}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
