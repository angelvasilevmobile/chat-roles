import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoomMessages } from "@/hooks/useRoomMessages";
import { useUsers } from "@/hooks/useUsers";
import { useStoryteller } from "@/hooks/useStoryteller";
import MessageItem from "@/components/chat/MessageItem";
import MessageInput from "@/components/chat/MessageInput";
import UserSidebar from "@/components/chat/UserSidebar";
import MusicRoom from "@/components/chat/MusicRoom";
import DrawingRoom from "@/components/chat/DrawingRoom";
import StoriesRoom from "@/components/chat/StoriesRoom";
import ContactRoom from "@/components/chat/ContactRoom";
import BedRoom from "@/components/chat/BedRoom";
import { LogOut, MessageCircle, Music, Paintbrush, BookOpen, Sparkles, Trash2, Phone, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleBadge from "@/components/chat/RoleBadge";

type RoomTab = "general" | "music" | "drawing" | "stories" | "contact" | "beds";

const TABS: { id: RoomTab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <MessageCircle className="h-4 w-4" /> },
  { id: "music", label: "Music", icon: <Music className="h-4 w-4" /> },
  { id: "drawing", label: "Drawing", icon: <Paintbrush className="h-4 w-4" /> },
  { id: "stories", label: "Stories", icon: <BookOpen className="h-4 w-4" /> },
  { id: "contact", label: "Contact", icon: <Phone className="h-4 w-4" /> },
  { id: "beds", label: "Beds", icon: <BedDouble className="h-4 w-4" /> },
];

const ChatRoom = () => {
  const { user, role, isAdmin, signOut, profile } = useAuth();
  const { users, updateRole } = useUsers(isAdmin);
  const [activeTab, setActiveTab] = useState<RoomTab>("general");

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col min-w-0">
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

        {activeTab === "general" && <GeneralChat user={user} isAdmin={isAdmin} users={users} />}
        {activeTab === "music" && <MusicRoom />}
        {activeTab === "drawing" && <DrawingRoom />}
        {activeTab === "stories" && <StoriesRoom />}
        {activeTab === "contact" && <ContactRoom />}
        {activeTab === "beds" && <BedRoom />}
      </div>

      <UserSidebar
        users={users}
        currentUserId={user?.id ?? ""}
        isAdmin={isAdmin}
        onUpdateRole={updateRole}
      />
    </div>
  );
};

const GeneralChat = ({ user, isAdmin, users }: { user: any; isAdmin: boolean; users: any[] }) => {
  const { messages, loading, sendMessage, deleteMessage } = useRoomMessages("general");
  const { botMessages, isStreaming, askStoryteller, clearBotMessages } = useStoryteller();
  const roleMap = new Map(users.map((u: any) => [u.id, u.role]));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [botMode, setBotMode] = useState(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, botMessages]);

  const handleSend = (content: string) => {
    if (!user) return;
    if (botMode) {
      askStoryteller(content);
    } else {
      sendMessage(content, user.id);
    }
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Loading messages...</p>
          </div>
        ) : (
          <>
            {messages.length === 0 && !botMode && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">No messages yet. Say hello!</p>
              </div>
            )}
            {!botMode &&
              messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  currentUserId={user?.id ?? ""}
                  isAdmin={isAdmin}
                  userRoles={roleMap}
                  onDelete={deleteMessage}
                />
              ))}
            {botMode && (
              <>
                {botMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                    <Sparkles className="h-12 w-12 text-primary/40" />
                    <p className="text-muted-foreground text-sm max-w-md">
                      The Storyteller awaits your command. Type a message to begin an epic tale! ✨
                    </p>
                  </div>
                )}
                {botMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`group flex gap-3 px-4 py-2 animate-message-in hover:bg-secondary/30 transition-colors`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          msg.role === "assistant"
                            ? "bg-primary/20 text-primary"
                            : "bg-accent/20 text-accent-foreground"
                        }`}
                      >
                        {msg.role === "assistant" ? "🔮" : (user?.email?.[0]?.toUpperCase() ?? "U")}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            msg.role === "assistant" ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {msg.role === "assistant" ? "🧙 Storyteller" : "You"}
                        </span>
                        {msg.role === "assistant" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            BOT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed break-words whitespace-pre-wrap">
                        {msg.content}
                        {isStreaming && msg === botMessages[botMessages.length - 1] && msg.role === "assistant" && (
                          <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-middle" />
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Bot toggle bar */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-t border-border bg-card/50">
        <Button
          variant={botMode ? "default" : "outline"}
          size="sm"
          onClick={() => setBotMode(!botMode)}
          className="gap-1.5 text-xs"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {botMode ? "Storyteller Mode" : "Chat Mode"}
        </Button>
        {botMode && botMessages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearBotMessages} className="gap-1 text-xs text-muted-foreground">
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        )}
        {botMode && (
          <span className="text-[11px] text-muted-foreground ml-auto">
            🔮 Storyteller is listening...
          </span>
        )}
      </div>

      <MessageInput onSend={handleSend} disabled={isStreaming} />
    </>
  );
};

export default ChatRoom;
