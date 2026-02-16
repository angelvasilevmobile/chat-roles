import { Trash2 } from "lucide-react";
import type { ChatMessage } from "@/hooks/useMessages";
import type { UserRole } from "@/hooks/useAuth";
import RoleBadge from "./RoleBadge";
import { format } from "date-fns";

interface MessageItemProps {
  message: ChatMessage;
  currentUserId: string;
  isAdmin: boolean;
  userRoles: Map<string, UserRole>;
  onDelete: (id: string) => void;
}

const MessageItem = ({ message, currentUserId, isAdmin, userRoles, onDelete }: MessageItemProps) => {
  const isOwn = message.user_id === currentUserId;
  const canDelete = isOwn || isAdmin;
  const senderRole = userRoles.get(message.user_id) ?? "user";
  const username = message.profiles?.username ?? "Unknown";
  const time = format(new Date(message.created_at), "HH:mm");

  return (
    <div className={`group flex gap-3 px-4 py-2 animate-message-in hover:bg-secondary/30 transition-colors`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${
          senderRole === "admin"
            ? "bg-admin/20 text-admin"
            : "bg-primary/15 text-primary"
        }`}>
          {username.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${
            senderRole === "admin" ? "text-admin" : "text-foreground"
          }`}>
            {username}
          </span>
          <RoleBadge role={senderRole} />
          <span className="text-[11px] text-muted-foreground">{time}</span>
          {canDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-destructive/60 hover:text-destructive p-1 rounded"
              title="Delete message"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;
