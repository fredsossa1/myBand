"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  handleAdminLogout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const response = await fetch("/api/admin/verify", { method: "POST" });
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin === true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetch("/api/admin/verify", { method: "POST" })
        .then((r) => r.json())
        .then((data) => setIsAdmin(data.isAdmin === true))
        .catch((err) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Admin verify failed:", err);
          }
          setIsAdmin(false);
        });
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAdminLogout = async () => {
    const supabase = createClient();
    setIsAdmin(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, handleAdminLogout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
