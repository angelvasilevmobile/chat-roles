import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Story {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    const { data } = await supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setStories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStories();
    const channel = supabase
      .channel("realtime-stories")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => {
        fetchStories();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchStories]);

  const addStory = async (title: string, content: string, userId: string) => {
    await supabase.from("stories").insert({ title, content, user_id: userId });
  };

  const deleteStory = async (storyId: string) => {
    await supabase.from("stories").delete().eq("id", storyId);
  };

  return { stories, loading, addStory, deleteStory };
};
