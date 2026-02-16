import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

export const useMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(id, username, avatar_url)")
      .order("created_at", { ascending: true })
      .limit(200);

    if (data) setMessages(data as ChatMessage[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", payload.new.user_id)
            .maybeSingle();

          const newMsg: ChatMessage = {
            ...payload.new as any,
            profiles: profile,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  const sendMessage = async (content: string, userId: string) => {
    await supabase.from("messages").insert({ content, user_id: userId });
  };

  const deleteMessage = async (messageId: string) => {
    await supabase.from("messages").delete().eq("id", messageId);
  };

  return { messages, loading, sendMessage, deleteMessage, bottomRef };
};
