import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MusicTrack {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
}

export const useMusicTracks = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = useCallback(async () => {
    const { data } = await supabase
      .from("music_tracks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setTracks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTracks();
    const channel = supabase
      .channel("realtime-music")
      .on("postgres_changes", { event: "*", schema: "public", table: "music_tracks" }, () => {
        fetchTracks();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchTracks]);

  const addTrack = async (title: string, url: string, userId: string) => {
    await supabase.from("music_tracks").insert({ title, url, user_id: userId });
  };

  const deleteTrack = async (trackId: string) => {
    await supabase.from("music_tracks").delete().eq("id", trackId);
  };

  return { tracks, loading, addTrack, deleteTrack };
};
