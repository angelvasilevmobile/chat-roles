import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, UserRole } from "@/hooks/useAuth";

export interface UserWithRole extends Profile {
  role: UserRole;
}

export const useUsers = (isAdmin: boolean) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    // Get all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url");

    if (!profiles) {
      setLoading(false);
      return;
    }

    if (isAdmin) {
      // Admins can see all roles
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role as UserRole]));
      setUsers(
        profiles.map((p) => ({ ...p, role: roleMap.get(p.id) ?? "user" }))
      );
    } else {
      setUsers(profiles.map((p) => ({ ...p, role: "user" as UserRole })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const updateRole = async (userId: string, newRole: UserRole) => {
    // Upsert: if role exists update, else insert
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
    } else {
      await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return { users, loading, updateRole, refetch: fetchUsers };
};
