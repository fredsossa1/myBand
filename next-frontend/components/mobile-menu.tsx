"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { LanguageToggle } from "./language-switcher";

interface NavItem {
  href: string;
  labelKey: keyof ReturnType<typeof useTranslations>;
  icon: string;
}

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowAdminLogin(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowAdminLogin]);

  const handleNavClick = () => {
    setIsOpen(false);
    setShowAdminLogin(false);
  };

  return (
    <div className="lg:hidden relative" ref={dropdownRef}>
      {/* Menu Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
      >
        <span className="text-lg">{isOpen ? "✕" : "☰"}</span>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed top-16 right-4 z-40 w-64 glass rounded-xl border border-white/20 p-4 backdrop-blur-lg shadow-2xl">
          <div className="space-y-4">
            {/* Navigation Links */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isStatsPage = item.href === "/stats";
                const isDisabled = isStatsPage && !isAdmin;

                return isDisabled ? (
                  <div
                    key={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm text-white/40 border border-transparent cursor-not-allowed opacity-50"
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <span className="font-medium">
                      {t[item.labelKey] as string}
                    </span>
                    <span className="ml-auto text-xs">🔒</span>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-sm",
                      "hover:bg-white/10 hover:text-white",
                      isActive
                        ? "bg-white/20 text-white border border-white/30"
                        : "text-white/80 border border-transparent"
                    )}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
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
            <div className="space-y-2">
              {!isAdmin ? (
                !showAdminLogin ? (
                  <Button
                    onClick={() => setShowAdminLogin(true)}
                    variant="outline"
                    size="sm"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start text-sm"
                  >
                    <span className="mr-2">🔑</span>
                    {t.adminLogin}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={t.adminPassword}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAdminLogin()
                      }
                      className="w-full bg-white/10 border-white/20 text-white text-xs placeholder:text-white/50"
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
                      <p className="text-red-400 text-xs">{loginError}</p>
                    )}
                  </div>
                )
              ) : (
                <Button
                  onClick={() => {
                    handleAdminLogout();
                    setIsOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start text-sm"
                >
                  <span className="mr-2">🚪</span>
                  {t.logout}
                </Button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/20"></div>

            {/* Language Toggle */}
            <div className="space-y-2">
              <div className="text-white/60 text-xs font-medium uppercase tracking-wide">
                {t.language}
              </div>
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
