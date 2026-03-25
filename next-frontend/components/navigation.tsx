"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-switcher";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  href: string;
  labelKey: keyof ReturnType<typeof useTranslations>;
  icon: string;
  descriptionKey: keyof ReturnType<typeof useTranslations>;
}

export function Navigation() {
  const pathname = usePathname();
  const t = useTranslations();
  const { isAdmin, handleAdminLogout } = useAdmin();

  const navItems: NavItem[] = [
    { href: "/", labelKey: "home", icon: "🏠", descriptionKey: "home" },
    { href: "/availability", labelKey: "availability", icon: "📅", descriptionKey: "availability" },
    { href: "/stats", labelKey: "statistics", icon: "📊", descriptionKey: "statistics" },
  ];

  return (
    <nav className="glass rounded-xl border border-white/20 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 sm:px-3 sm:py-2 rounded-lg transition-all duration-200",
                  "hover:bg-white/10 hover:text-white text-sm sm:text-base min-h-[44px] sm:min-h-0",
                  isActive
                    ? "bg-white/20 text-white border border-white/30"
                    : "text-white/70 border border-transparent"
                )}
                title={t[item.descriptionKey] as string}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="font-medium">{t[item.labelKey] as string}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin Status & Language */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {isAdmin && (
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-300 border-green-500/30 text-xs sm:text-sm"
            >
              🔑 <span className="hidden sm:inline">{t.adminAccessGranted}</span>
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleAdminLogout}
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm"
          >
            🚪 <span className="hidden sm:inline">{t.logout}</span>
          </Button>
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}
