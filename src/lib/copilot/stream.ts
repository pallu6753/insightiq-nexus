export interface StreamOptions {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  signal?: AbortSignal;
  onDelta: (delta: string) => void;
}

/**
 * Streams an OpenAI-compatible SSE response from /api/chat.
 * Returns the final assembled text or throws with a user-readable message.
 */
export async function streamChat(opts: StreamOptions): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages: opts.messages }),
    signal: opts.signal,
  });

  if (!res.ok) {
    let msg = `AI request failed (${res.status})`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  if (!res.body) throw new Error("No response body from AI");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const rawLine = buffer.slice(0, idx).replace(/\r$/, "");
      buffer = buffer.slice(idx + 1);
      if (!rawLine.startsWith("data:")) continue;
      const data = rawLine.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const json = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          opts.onDelta(delta);
        }
      } catch {
        /* skip malformed chunk */
      }
    }
  }
  return full;
}
