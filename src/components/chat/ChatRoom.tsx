import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useUsers } from "@/hooks/useUsers";
import MessageItem from "@/components/chat/MessageItem";
import MessageInput from "@/components/chat/MessageInput";
import UserSidebar from "@/components/chat/UserSidebar";
import { LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleBadge from "@/components/chat/RoleBadge";

const ChatRoom = () => {
  const { user, role, isAdmin, signOut, profile } = useAuth();
  const { messages, loading: msgsLoading, sendMessage, deleteMessage } = useMessages();
  const { users, updateRole } = useUsers(isAdmin);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build role map from users
  const roleMap = new Map(users.map((u) => [u.id, u.role]));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (content: string) => {
    if (user) sendMessage(content, user.id);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold font-heading text-foreground"># general</h1>
              <p className="text-[11px] text-muted-foreground">{users.length} members</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/80">{profile?.username}</span>
              <RoleBadge role={role} />
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
          {msgsLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                currentUserId={user?.id ?? ""}
                isAdmin={isAdmin}
                userRoles={roleMap}
                onDelete={deleteMessage}
              />
            ))
          )}
        </div>

        {/* Input */}
        <MessageInput onSend={handleSend} />
      </div>

      {/* User sidebar */}
      <UserSidebar
        users={users}
        currentUserId={user?.id ?? ""}
        isAdmin={isAdmin}
        onUpdateRole={updateRole}
      />
    </div>
  );
};

export default ChatRoom;
