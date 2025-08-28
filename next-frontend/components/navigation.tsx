"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-switcher";
import { useTranslations } from "@/hooks/use-language";

interface NavItem {
  href: string;
  labelKey: keyof ReturnType<typeof useTranslations>;
  icon: string;
  descriptionKey: keyof ReturnType<typeof useTranslations>;
}

export function Navigation() {
  const pathname = usePathname();
  const t = useTranslations();

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
    <nav className="glass rounded-xl border border-white/20 p-2">
      <div className="flex items-center justify-between">
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
        
        {/* Language Switcher */}
        <LanguageToggle />
      </div>
    </nav>
  );
}
