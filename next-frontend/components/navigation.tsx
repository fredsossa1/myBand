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
    loginError
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                  "hover:bg-white/10 hover:text-white",
                  isActive
                    ? "bg-white/20 text-white border border-white/30"
                    : "text-white/70 border border-transparent"
                )}
                title={t[item.descriptionKey] as string}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{t[item.labelKey] as string}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Admin Section & Language Switcher */}
        <div className="flex items-center gap-4">
          {/* Admin Status/Login */}
          {!isAdmin ? (
            <div className="flex items-center gap-2">
              {showAdminLogin ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    placeholder={t.adminPassword}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                    className="w-40 bg-white/10 border-white/20 text-white text-sm"
                  />
                  <Button
                    onClick={handleAdminLogin}
                    disabled={!adminPassword}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {t.login}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAdminLogin(false)}
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {t.cancel}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAdminLogin(true)}
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  🔓 {t.adminLogin}
                </Button>
              )}
              {loginError && (
                <span className="text-red-300 text-sm">{loginError}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-300 border-green-500/30"
              >
                🔑 {t.adminAccessGranted}
              </Badge>
              <Button
                variant="outline"
                onClick={handleAdminLogout}
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                🚪 {t.logout}
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
