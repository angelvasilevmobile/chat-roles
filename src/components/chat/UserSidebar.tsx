import { Shield, ChevronDown, ChevronUp, User } from "lucide-react";
import type { UserWithRole } from "@/hooks/useUsers";
import type { UserRole } from "@/hooks/useAuth";
import RoleBadge from "./RoleBadge";

interface UserSidebarProps {
  users: UserWithRole[];
  currentUserId: string;
  isAdmin: boolean;
  onUpdateRole: (userId: string, role: UserRole) => void;
}

const UserSidebar = ({ users, currentUserId, isAdmin, onUpdateRole }: UserSidebarProps) => {
  const admins = users.filter((u) => u.role === "admin");
  const normalUsers = users.filter((u) => u.role === "user");

  return (
    <aside className="w-60 border-l border-border bg-sidebar flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Online — {users.length}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Admins */}
        {admins.length > 0 && (
          <div>
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-admin/70">
              Admins — {admins.length}
            </p>
            {admins.map((u) => (
              <UserItem
                key={u.id}
                user={u}
                isSelf={u.id === currentUserId}
                isAdmin={isAdmin}
                onUpdateRole={onUpdateRole}
              />
            ))}
          </div>
        )}

        {/* Users */}
        {normalUsers.length > 0 && (
          <div>
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Members — {normalUsers.length}
            </p>
            {normalUsers.map((u) => (
              <UserItem
                key={u.id}
                user={u}
                isSelf={u.id === currentUserId}
                isAdmin={isAdmin}
                onUpdateRole={onUpdateRole}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

const UserItem = ({
  user,
  isSelf,
  isAdmin,
  onUpdateRole,
}: {
  user: UserWithRole;
  isSelf: boolean;
  isAdmin: boolean;
  onUpdateRole: (userId: string, role: UserRole) => void;
}) => {
  const canManage = isAdmin && !isSelf;

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent transition-colors group">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        user.role === "admin"
          ? "bg-admin/20 text-admin"
          : "bg-primary/15 text-primary"
      }`}>
        {(user.username ?? "?").charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${
          user.role === "admin" ? "text-admin font-medium" : "text-sidebar-foreground"
        }`}>
          {user.username ?? "Unknown"}
          {isSelf && <span className="text-muted-foreground text-xs ml-1">(you)</span>}
        </p>
      </div>
      {canManage && (
        <button
          onClick={() => onUpdateRole(user.id, user.role === "admin" ? "user" : "admin")}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
          title={user.role === "admin" ? "Demote to user" : "Promote to admin"}
        >
          {user.role === "admin" ? (
            <ChevronDown className="h-3.5 w-3.5 text-destructive" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-primary" />
          )}
        </button>
      )}
    </div>
  );
};

export default UserSidebar;
