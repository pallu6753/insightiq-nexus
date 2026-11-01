import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type ChatBody = { messages?: ChatMessage[]; model?: string };

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "AI is not configured. LOVABLE_API_KEY missing." }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }

        let body: ChatBody;
        try {
          body = (await request.json()) as ChatBody;
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
          return new Response(JSON.stringify({ error: "messages required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const upstream = await fetch(GATEWAY_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: body.model || DEFAULT_MODEL,
            messages,
            stream: true,
          }),
        });

        if (!upstream.ok) {
          const text = await upstream.text();
          console.error(`[copilot] gateway ${upstream.status}: ${text}`);
          if (upstream.status === 402) {
            return new Response(
              JSON.stringify({
                error:
                  "AI credits exhausted. Add credits to your workspace to continue using Copilot.",
              }),
              { status: 402, headers: { "content-type": "application/json" } },
            );
          }
          if (upstream.status === 429) {
            return new Response(
              JSON.stringify({
                error: "Rate limit reached. Please wait a moment and try again.",
              }),
              { status: 429, headers: { "content-type": "application/json" } },
            );
          }
          return new Response(
            JSON.stringify({ error: `AI request failed (${upstream.status}).` }),
            { status: 502, headers: { "content-type": "application/json" } },
          );
        }

        // Pass through SSE stream as-is (OpenAI-compatible).
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": "text/event-stream; charset=utf-8",
            "cache-control": "no-cache, no-transform",
            connection: "keep-alive",
          },
        });
      },
    },
  },
});
