"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-user";
import { getRoleDisplayName } from "@/lib/constants";
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
  const { isAdmin, handleAdminLogout } = useAdmin();
  const { member } = useUser();

  const navItems: NavItem[] = [
    { href: "/", labelKey: "home", icon: "🏠" },
    { href: "/availability", labelKey: "availability", icon: "📅" },
    { href: "/stats", labelKey: "statistics", icon: "📊" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lg:hidden relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
      >
        <span className="text-lg">{isOpen ? "✕" : "☰"}</span>
      </Button>

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
                    <span className="font-medium">{t[item.labelKey] as string}</span>
                    <span className="ml-auto text-xs">🔒</span>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-sm",
                      "hover:bg-white/10 hover:text-white",
                      isActive
                        ? "bg-white/20 text-white border border-white/30"
                        : "text-white/80 border border-transparent"
                    )}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <span className="font-medium">{t[item.labelKey] as string}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-white/20"></div>

            {/* Session Section */}
            <div className="space-y-2">
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Signed in as</div>
                {member ? (
                  <div>
                    <div className="text-white text-sm font-medium">{member.name}</div>
                    <div className="text-white/50 text-xs">{getRoleDisplayName(member.role)}</div>
                  </div>
                ) : (
                  <div className="text-white/70 text-sm font-medium">{isAdmin ? "Administrator" : "Guest"}</div>
                )}
              </div>
              {isAdmin && (
                <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-medium">
                  🔑 {t.adminAccessGranted}
                </div>
              )}
              <Button
                onClick={() => { handleAdminLogout(); setIsOpen(false); }}
                variant="outline"
                size="sm"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start text-sm"
              >
                <span className="mr-2">🚪</span>
                {t.logout}
              </Button>
            </div>

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
