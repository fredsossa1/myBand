"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-switcher";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface NavItem {
  href: string;
  labelKey: keyof ReturnType<typeof useTranslations>;
  icon: string;
}

export function Sidebar() {
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
    },
    {
      href: "/availability",
      labelKey: "availability",
      icon: "📅",
    },
    {
      href: "/stats",
      labelKey: "statistics",
      icon: "📊",
    },
  ];

  return (
    <div className="glass rounded-xl border border-white/20 p-4 h-fit">
      <div className="space-y-6">
        {/* Navigation Links */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isStatsPage = item.href === "/stats";
            const isDisabled = isStatsPage && !isAdmin;

            return isDisabled ? (
              <div
                key={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sm text-white/40 border border-transparent cursor-not-allowed opacity-50"
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="font-medium">
                  {t[item.labelKey] as string}
                </span>
                <span className="ml-auto text-xs">🔒</span>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full",
                  "hover:bg-white/10 hover:text-white text-sm",
                  isActive
                    ? "bg-white/20 text-white border border-white/30"
                    : "text-white/70 border border-transparent"
                )}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="font-medium">
                  {t[item.labelKey] as string}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-white/20"></div>

        {/* Admin Section */}
        <div className="space-y-3">
          {!isAdmin ? (
            !showAdminLogin ? (
              <Button
                onClick={() => setShowAdminLogin(true)}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start"
              >
                <span className="mr-3">🔑</span>
                {t.adminLogin}
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={t.adminPassword}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                  className="w-full bg-white/10 border-white/20 text-white text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAdminLogin}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    {t.login}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminPassword("");
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                  >
                    {t.cancel}
                  </Button>
                </div>
                {loginError && (
                  <p className="text-red-400 text-xs mt-2">{loginError}</p>
                )}
              </div>
            )
          ) : (
            <Button
              onClick={handleAdminLogout}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start text-sm"
            >
              <span className="mr-3">🚪</span>
              {t.logout}
            </Button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-white/20"></div>

        {/* Language Toggle */}
        <div className="space-y-3">
          <div className="text-white/60 text-xs font-medium uppercase tracking-wide px-4">
            {t.language}
          </div>
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
