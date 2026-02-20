import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "user";

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("user");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async (userId: string) => {
      try {
        const [{ data: roleData }, { data: profileData }] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
          supabase.from("profiles").select("id, username, avatar_url").eq("id", userId).maybeSingle(),
        ]);
        if (!isMounted) return;
        setRole((roleData?.role as UserRole) ?? "user");
        setProfile(profileData);
      } catch {
        if (!isMounted) return;
        setRole("user");
        setProfile(null);
      }
    };

    // Set up listener FIRST — but avoid awaiting Supabase calls inside callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Dispatch after callback to avoid deadlock
          setTimeout(() => fetchUserData(currentUser.id), 0);
        } else {
          setRole("user");
          setProfile(null);
        }
      }
    );

    // Initial load
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserData(session.user.id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole("user");
    setProfile(null);
  };

  return { user, loading, role, profile, signOut, isAdmin: role === "admin" };
};
