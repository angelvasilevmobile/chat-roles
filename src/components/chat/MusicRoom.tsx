import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoomMessages } from "@/hooks/useRoomMessages";
import { useMusicTracks } from "@/hooks/useMusicTracks";
import { useUsers } from "@/hooks/useUsers";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import { Music, Plus, Trash2, ExternalLink, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MusicRoom = () => {
  const { user, isAdmin } = useAuth();
  const { messages, loading, sendMessage, deleteMessage } = useRoomMessages("music");
  const { tracks, addTrack, deleteTrack } = useMusicTracks();
  const { users } = useUsers(isAdmin);
  const roleMap = new Map(users.map((u) => [u.id, u.role]));
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= tracks.length && tracks.length > 0) setCurrentIndex(0);
  }, [tracks, currentIndex]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !user) return;
    try {
      await addTrack(title.trim(), url.trim(), user.id);
      setTitle("");
      setUrl("");
      setShowAdd(false);
      setCurrentIndex(0); // new track appears first (ordered by created_at desc)
      toast.success("Track added!");
    } catch {
      toast.error("Failed to add track");
    }
  };

  const getEmbedUrl = (rawUrl: string) => {
    const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    if (rawUrl.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(rawUrl)}&color=%23ff5500&auto_play=false`;
    }
    return null;
  };

  const currentTrack = tracks.length > 0 ? tracks[currentIndex] : null;
  const embedUrl = currentTrack ? getEmbedUrl(currentTrack.url) : null;

  const goPrev = () => setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
  const goNext = () => setCurrentIndex((i) => (i + 1) % tracks.length);

  return (
    <div className="flex flex-1 flex-col min-w-0 h-full">
      {/* Now Playing */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold font-heading text-foreground">Now Playing</h2>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="h-4 w-4 mr-1" /> Add Track
            </Button>
          )}
        </div>

        {showAdd && isAdmin && (
          <form onSubmit={handleAddTrack} className="flex gap-2 mb-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track title..."
              className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="YouTube or SoundCloud URL..."
              className="flex-[2] rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button type="submit" size="sm">Add</Button>
          </form>
        )}

        {currentTrack ? (
          <div>
            {embedUrl ? (
              <div className="rounded-lg overflow-hidden bg-secondary aspect-video">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={currentTrack.title}
                />
              </div>
            ) : (
              <a href={currentTrack.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary text-sm hover:underline">
                <ExternalLink className="h-4 w-4" /> {currentTrack.title}
              </a>
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">🎵 {currentTrack.title}</p>
              <div className="flex items-center gap-1">
                {tracks.length > 1 && (
                  <>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goPrev}>
                      <SkipBack className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground">{currentIndex + 1}/{tracks.length}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goNext}>
                      <SkipForward className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                {isAdmin && (
                  <button onClick={() => deleteTrack(currentTrack.id)} className="text-destructive/60 hover:text-destructive p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No tracks yet. {isAdmin ? "Add one!" : "Wait for an admin to add music."}</p>
        )}

        {/* Track list */}
        {tracks.length > 1 && (
          <div className="mt-3 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Queue</p>
            {tracks.map((t, idx) => idx === currentIndex ? null : (
              <div key={t.id} className="flex items-center justify-between text-xs text-foreground/70 px-2 py-1 rounded hover:bg-secondary/50 cursor-pointer" onClick={() => setCurrentIndex(idx)}>
                <span>🎵 {t.title}</span>
                {isAdmin && (
                  <button onClick={(e) => { e.stopPropagation(); deleteTrack(t.id); }} className="text-destructive/60 hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
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
            <Music className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Chat about the music!</p>
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

export default MusicRoom;
