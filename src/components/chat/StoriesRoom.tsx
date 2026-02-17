import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoomMessages } from "@/hooks/useRoomMessages";
import { useStories } from "@/hooks/useStories";
import { useUsers } from "@/hooks/useUsers";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

const StoriesRoom = () => {
  const { user, isAdmin } = useAuth();
  const { messages, loading, sendMessage, deleteMessage } = useRoomMessages("stories");
  const { stories, addStory, deleteStory } = useStories();
  const { users } = useUsers(isAdmin);
  const roleMap = new Map(users.map((u) => [u.id, u.role]));
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;
    try {
      await addStory(title.trim(), content.trim(), user.id);
      setTitle("");
      setContent("");
      setShowAdd(false);
      toast.success("Story published!");
    } catch {
      toast.error("Failed to publish story");
    }
  };

  return (
    <div className="flex flex-1 flex-col min-w-0 h-full">
      {/* Stories section */}
      <div className="border-b border-border bg-card p-4 max-h-[50%] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold font-heading text-foreground">Stories</h2>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="h-4 w-4 mr-1" /> New Story
            </Button>
          )}
        </div>

        {showAdd && isAdmin && (
          <form onSubmit={handleAddStory} className="space-y-2 mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Story title..."
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story..."
              rows={4}
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <Button type="submit" size="sm">Publish</Button>
          </form>
        )}

        {stories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No stories yet. {isAdmin ? "Write one!" : "Wait for an admin to publish a story."}
          </p>
        ) : (
          <div className="space-y-2">
            {stories.map((story) => (
              <div key={story.id} className="rounded-lg bg-secondary/50 border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === story.id ? null : story.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/80 transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{story.title}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(story.created_at), "MMM d, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteStory(story.id); }}
                        className="text-destructive/60 hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {expandedId === story.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedId === story.id && (
                  <div className="px-3 pb-3 text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap border-t border-border pt-3">
                    {story.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Discuss the stories here!</p>
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
    </div>
  );
};

export default StoriesRoom;
