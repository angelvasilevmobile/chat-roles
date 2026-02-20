import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useRoomMessages } from "@/hooks/useRoomMessages";
import { useDrawings } from "@/hooks/useDrawings";
import { useUsers } from "@/hooks/useUsers";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import { Paintbrush, Save, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const COLORS = ["#ffffff", "#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#f97316", "#ec4899"];
const SIZES = [2, 4, 8, 16];

const DrawingRoom = () => {
  const { user, isAdmin } = useAuth();
  const { messages, loading, sendMessage, deleteMessage } = useRoomMessages("drawing");
  const { drawings, saveDrawing, deleteDrawing } = useDrawings();
  const { users } = useUsers(isAdmin);
  const roleMap = new Map(users.map((u) => [u.id, u.role]));
  const scrollRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(4);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "hsl(228, 14%, 11%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasRef.current!.width,
      y: ((e.clientY - rect.top) / rect.height) * canvasRef.current!.height,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!drawing || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx || !lastPos.current) return;
      const pos = getPos(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    },
    [drawing, color, size]
  );

  const stopDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = "hsl(228, 14%, 11%)";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleSave = async () => {
    if (!canvasRef.current || !user) return;
    try {
      const blob = await new Promise<Blob>((res) =>
        canvasRef.current!.toBlob((b) => res(b!), "image/png")
      );
      await saveDrawing(blob, null, user.id);
      toast.success("Drawing saved!");
    } catch {
      toast.error("Failed to save drawing");
    }
  };

  return (
    <div className="flex flex-1 flex-col min-w-0 h-full">
      {/* Canvas area */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold font-heading text-foreground">Drawing Canvas</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearCanvas}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5 mr-1" /> Save
            </Button>
          </div>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full border-2 transition-transform ${color === c ? "border-primary scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex items-center justify-center h-7 w-7 rounded-lg transition-colors ${size === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
              >
                <div className="rounded-full bg-current" style={{ width: s + 2, height: s + 2 }} />
              </button>
            ))}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="w-full rounded-lg cursor-crosshair border border-border"
          style={{ touchAction: "none" }}
        />

        {/* Gallery */}
        {drawings.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Gallery</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {drawings.slice(0, 10).map((d) => (
                <div key={d.id} className="relative group shrink-0">
                  <img
                    src={d.image_url}
                    alt={d.title ?? "Drawing"}
                    className="h-16 w-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(d.image_url)}
                  />
                  {(d.user_id === user?.id || isAdmin) && (
                    <button
                      onClick={() => deleteDrawing(d.id)}
                      className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 bg-destructive/80 rounded p-0.5"
                    >
                      <Trash2 className="h-3 w-3 text-destructive-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
            <Paintbrush className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Share your thoughts on the art!</p>
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

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {selectedImage && (
            <img src={selectedImage} alt="Drawing" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrawingRoom;
