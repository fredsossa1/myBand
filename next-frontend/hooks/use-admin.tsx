"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  showAdminLogin: boolean;
  setShowAdminLogin: (show: boolean) => void;
  handleAdminLogin: () => Promise<void>;
  handleAdminLogout: () => void;
  loginError: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check for existing admin session on mount
  useEffect(() => {
    const savedAdminSession = localStorage.getItem("adminSession");
    if (savedAdminSession) {
      // Verify the session is still valid
      fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: savedAdminSession }),
      })
        .then((response) => {
          if (response.ok) {
            setIsAdmin(true);
          } else {
            // Session invalid, clear it
            localStorage.removeItem("adminSession");
          }
        })
        .catch(() => {
          // Network error or other issue, clear session
          localStorage.removeItem("adminSession");
        });
    }
  }, []);

  const handleAdminLogin = async () => {
    setLoginError(null);

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (response.ok) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        localStorage.setItem("adminSession", adminPassword);
        setAdminPassword("");
      } else {
        setLoginError("Invalid admin password");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setLoginError("Login failed - network error");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminPassword("");
    setShowAdminLogin(false);
    setLoginError(null);
    localStorage.removeItem("adminSession");
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        setIsAdmin,
        adminPassword,
        setAdminPassword,
        showAdminLogin,
        setShowAdminLogin,
        handleAdminLogin,
        handleAdminLogout,
        loginError,
      }}
    >
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
