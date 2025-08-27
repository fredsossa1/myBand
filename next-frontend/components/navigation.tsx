"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    icon: "🏠",
    description: "Migration progress and demos",
  },
  {
    href: "/availability",
    label: "Availability",
    icon: "📅",
    description: "Manage your event availability",
  },
  {
    href: "/stats",
    label: "Statistics",
    icon: "📊",
    description: "View detailed analytics",
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="glass rounded-xl border border-white/20 p-2">
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
              title={item.description}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
