"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Member } from "@/lib/types";

interface UserContextType {
  member: Member | null;
  loading: boolean;
}

const UserContextApi = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadMember() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMember(null);
        setLoading(false);
        return;
      }

      // Fetch the member record linked to this auth user
      const { data } = await supabase
        .from("members")
        .select("id, name, role")
        .eq("user_id", user.id)
        .single();

      setMember(data ?? null);
      setLoading(false);
    }

    loadMember();

    // Keep in sync with auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadMember();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContextApi.Provider value={{ member, loading }}>
      {children}
    </UserContextApi.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContextApi);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
