import { Shield, User } from "lucide-react";
import type { UserRole } from "@/hooks/useAuth";

const RoleBadge = ({ role }: { role: UserRole }) => {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-admin/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-admin">
        <Shield className="h-3 w-3" />
        Admin
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <User className="h-3 w-3" />
      User
    </span>
  );
};

export default RoleBadge;
