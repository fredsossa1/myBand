"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-switcher";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const {
    isAdmin,
    adminPassword,
    setAdminPassword,
    showAdminLogin,
    setShowAdminLogin,
    handleAdminLogin,
    handleAdminLogout,
    loginError,
  } = useAdmin();

  const navItems: NavItem[] = [
    {
      href: "/",
      labelKey: "home",
      icon: "🏠",
      descriptionKey: "home",
    },
    {
      href: "/availability",
      labelKey: "availability",
      icon: "📅",
      descriptionKey: "availability",
    },
    {
      href: "/stats",
      labelKey: "statistics",
      icon: "📊",
      descriptionKey: "statistics",
    },
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
                <span className="font-medium">
                  {t[item.labelKey] as string}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Admin Section & Language Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Admin Status/Login */}
          {!isAdmin ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              {showAdminLogin ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <Input
                    type="password"
                    placeholder={t.adminPassword}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                    className="w-full sm:w-32 md:w-40 bg-white/10 border-white/20 text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAdminLogin}
                      disabled={!adminPassword}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                    >
                      {t.login}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAdminLogin(false)}
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm"
                    >
                      {t.cancel}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAdminLogin(true)}
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm"
                >
                  🔓 <span className="hidden sm:inline">{t.adminLogin}</span>
                </Button>
              )}
              {loginError && (
                <span className="text-red-300 text-xs sm:text-sm">
                  {loginError}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-300 border-green-500/30 text-xs sm:text-sm"
              >
                🔑{" "}
                <span className="hidden sm:inline">{t.adminAccessGranted}</span>
              </Badge>
              <Button
                variant="outline"
                onClick={handleAdminLogout}
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm"
              >
                🚪 <span className="hidden sm:inline">{t.logout}</span>
              </Button>
            </div>
          )}

          {/* Language Switcher */}
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}
