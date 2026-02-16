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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Fetch role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id)
            .maybeSingle();
          setRole((roleData?.role as UserRole) ?? "user");

          // Fetch profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", currentUser.id)
            .maybeSingle();
          setProfile(profileData);
        } else {
          setRole("user");
          setProfile(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole("user");
    setProfile(null);
  };

  return { user, loading, role, profile, signOut, isAdmin: role === "admin" };
};
