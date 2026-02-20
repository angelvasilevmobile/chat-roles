import { useState, useCallback } from "react";

const STORYTELLER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/storyteller`;

interface BotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const useStoryteller = () => {
  const [botMessages, setBotMessages] = useState<BotMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const askStoryteller = useCallback(async (userMessage: string) => {
    const userMsg: BotMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
    };

    setBotMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const allMessages = [...botMessages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    try {
      const resp = await fetch(STORYTELLER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setBotMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { id: assistantId, role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Storyteller error:", e);
      setBotMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "✨ The storyteller seems to have wandered off... Please try again." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [botMessages]);

  const clearBotMessages = useCallback(() => setBotMessages([]), []);

  return { botMessages, isStreaming, askStoryteller, clearBotMessages };
};
