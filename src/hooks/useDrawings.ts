import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Drawing {
  id: string;
  user_id: string;
  title: string | null;
  image_url: string;
  created_at: string;
  username?: string;
}

export const useDrawings = () => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrawings = useCallback(async () => {
    const { data } = await supabase
      .from("drawings")
      .select("*, profiles:user_id(username)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      setDrawings(data.map((d: any) => ({
        ...d,
        username: d.profiles?.username ?? "Unknown",
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDrawings();
    const channel = supabase
      .channel("realtime-drawings")
      .on("postgres_changes", { event: "*", schema: "public", table: "drawings" }, () => {
        fetchDrawings();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchDrawings]);

  const saveDrawing = async (imageBlob: Blob, title: string | null, userId: string) => {
    const fileName = `${userId}/${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("drawings")
      .upload(fileName, imageBlob, { contentType: "image/png" });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("drawings")
      .getPublicUrl(fileName);

    await supabase.from("drawings").insert({
      user_id: userId,
      title,
      image_url: urlData.publicUrl,
    });
  };

  const deleteDrawing = async (drawingId: string) => {
    await supabase.from("drawings").delete().eq("id", drawingId);
  };

  return { drawings, loading, saveDrawing, deleteDrawing };
};
