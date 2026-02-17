import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoomMessages } from "@/hooks/useRoomMessages";
import { useUsers } from "@/hooks/useUsers";
import MessageItem from "@/components/chat/MessageItem";
import MessageInput from "@/components/chat/MessageInput";
import UserSidebar from "@/components/chat/UserSidebar";
import MusicRoom from "@/components/chat/MusicRoom";
import DrawingRoom from "@/components/chat/DrawingRoom";
import StoriesRoom from "@/components/chat/StoriesRoom";
import { LogOut, MessageCircle, Music, Paintbrush, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleBadge from "@/components/chat/RoleBadge";

type RoomTab = "general" | "music" | "drawing" | "stories";

const TABS: { id: RoomTab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <MessageCircle className="h-4 w-4" /> },
  { id: "music", label: "Music", icon: <Music className="h-4 w-4" /> },
  { id: "drawing", label: "Drawing", icon: <Paintbrush className="h-4 w-4" /> },
  { id: "stories", label: "Stories", icon: <BookOpen className="h-4 w-4" /> },
];

const ChatRoom = () => {
  const { user, role, isAdmin, signOut, profile } = useAuth();
  const { users, updateRole } = useUsers(isAdmin);
  const [activeTab, setActiveTab] = useState<RoomTab>("general");

  return (
    <div className="flex h-screen bg-background">
      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {TABS.find((t) => t.id === activeTab)?.icon}
            </div>
            <div>
              <h1 className="text-sm font-semibold font-heading text-foreground">
                # {activeTab}
              </h1>
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

        {/* Tabs */}
        <div className="flex border-b border-border bg-card/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Room content */}
        {activeTab === "general" && <GeneralChat user={user} isAdmin={isAdmin} users={users} />}
        {activeTab === "music" && <MusicRoom />}
        {activeTab === "drawing" && <DrawingRoom />}
        {activeTab === "stories" && <StoriesRoom />}
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

// General chat extracted as sub-component
const GeneralChat = ({ user, isAdmin, users }: { user: any; isAdmin: boolean; users: any[] }) => {
  const { messages, loading, sendMessage, deleteMessage } = useRoomMessages("general");
  const roleMap = new Map(users.map((u: any) => [u.id, u.role]));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {loading ? (
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
      <MessageInput onSend={(content) => user && sendMessage(content, user.id)} />
    </>
  );
};

export default ChatRoom;
