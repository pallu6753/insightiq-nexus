import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  Check,
  Copy,
  Loader2,
  Pin,
  PinOff,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveDataset } from "@/lib/datasets/hooks";
import {
  ensureActiveConversation,
  useCopilot,
  type ChatMessage,
} from "@/lib/copilot/store";
import { streamChat } from "@/lib/copilot/stream";
import { buildSystemPrompt, suggestedPromptsFor } from "@/lib/copilot/context";

export const Route = createFileRoute("/app/copilot")({
  component: CopilotPage,
});

function CopilotPage() {
  const { dataset } = useActiveDataset();
  const conversations = useCopilot((s) => s.conversations);
  const activeId = useCopilot((s) => s.activeId);
  const createConversation = useCopilot((s) => s.createConversation);
  const selectConversation = useCopilot((s) => s.selectConversation);
  const deleteConversation = useCopilot((s) => s.deleteConversation);
  const renameConversation = useCopilot((s) => s.renameConversation);
  const togglePin = useCopilot((s) => s.togglePin);
  const appendMessage = useCopilot((s) => s.appendMessage);
  const updateMessage = useCopilot((s) => s.updateMessage);
  const removeMessage = useCopilot((s) => s.removeMessage);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId) ensureActiveConversation();
  }, [activeId]);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const suggestions = useMemo(() => suggestedPromptsFor(dataset), [dataset]);

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      }),
    [conversations],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages.length, streaming]);

  async function runCompletion(convId: string, historyOverride?: ChatMessage[]) {
    const conv = useCopilot.getState().conversations.find((c) => c.id === convId);
    if (!conv) return;
    const history = historyOverride ?? conv.messages;

    const assistantId = crypto.randomUUID();
    appendMessage(convId, {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      datasetId: dataset?.id ?? null,
    });

    const ac = new AbortController();
    abortRef.current = ac;
    setStreaming(true);
    try {
      const messages = [
        { role: "system" as const, content: buildSystemPrompt(dataset) },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ];
      let acc = "";
      await streamChat({
        messages,
        signal: ac.signal,
        onDelta: (d) => {
          acc += d;
          updateMessage(convId, assistantId, { content: acc });
        },
      });
      if (!acc.trim()) {
        updateMessage(convId, assistantId, {
          content: "_(No response received. Try again.)_",
        });
      }
    } catch (err) {
      const message =
        (err as Error)?.name === "AbortError"
          ? "_(Stopped)_"
          : `⚠️ ${(err as Error).message || "Something went wrong."}`;
      updateMessage(convId, assistantId, { content: message });
      if ((err as Error)?.name !== "AbortError") toast.error((err as Error).message);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function send(text: string) {
    const value = text.trim();
    if (!value || streaming) return;
    const convId = ensureActiveConversation();
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: value,
      createdAt: Date.now(),
      datasetId: dataset?.id ?? null,
    };
    appendMessage(convId, userMsg);
    setInput("");
    // history now includes the user message
    const conv = useCopilot.getState().conversations.find((c) => c.id === convId);
    void runCompletion(convId, conv?.messages ?? [userMsg]);
  }

  function regenerate() {
    if (!active || streaming) return;
    const msgs = active.messages;
    let lastAssistantIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "assistant") { lastAssistantIdx = i; break; }
    }
    if (lastAssistantIdx < 0) return;
    const priorUser = msgs.slice(0, lastAssistantIdx).filter((m) => m.role === "user");
    if (!priorUser.length) return;
    removeMessage(active.id, msgs[lastAssistantIdx].id);
    const historyAfter = useCopilot
      .getState()
      .conversations.find((c) => c.id === active.id)?.messages ?? [];
    void runCompletion(active.id, historyAfter);
  }

  function stop() { abortRef.current?.abort(); }

  return (
    <>
      <AppHeader
        title="AI Copilot"
        subtitle={
          dataset
            ? `Grounded on ${dataset.name} — ${dataset.rowCount.toLocaleString()} rows`
            : "Ask anything about your business in natural language"
        }
      />
      <main className="grid h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-border bg-card/30 p-4 lg:flex lg:flex-col">
          <Button
            size="sm"
            className="w-full gradient-primary border-0"
            onClick={() => createConversation()}
          >
            <Plus className="mr-1.5 h-4 w-4" /> New conversation
          </Button>
          <div className="mt-5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Recent
          </div>
          <div className="mt-2 flex-1 space-y-1 overflow-y-auto pr-1">
            {sortedConversations.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                No conversations yet. Ask something to get started.
              </div>
            )}
            {sortedConversations.map((c) => {
              const isActive = c.id === activeId;
              return (
                <div
                  key={c.id}
                  className={`group flex items-start gap-1 rounded-lg px-2 py-2 transition ${
                    isActive ? "bg-accent/40" : "hover:bg-accent/20"
                  }`}
                >
                  <button
                    onClick={() => selectConversation(c.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      {c.pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
                      <div className="truncate text-sm font-medium">{c.title}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(c.updatedAt).toLocaleString()}
                    </div>
                  </button>
                  <div className="flex opacity-0 transition group-hover:opacity-100">
                    <button
                      title={c.pinned ? "Unpin" : "Pin"}
                      onClick={() => togglePin(c.id)}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      {c.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                    </button>
                    <button
                      title="Rename"
                      onClick={() => {
                        const name = window.prompt("Rename conversation", c.title);
                        if (name) renameConversation(c.id, name);
                      }}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => deleteConversation(c.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-3xl space-y-4">
              {active && active.messages.length === 0 && (
                <EmptyState
                  suggestions={suggestions}
                  onPick={(s) => send(s)}
                  datasetName={dataset?.name}
                />
              )}
              {active?.messages.map((m) => (
                <MessageBubble key={m.id} msg={m} />
              ))}
              {streaming && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Copilot is thinking…
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border bg-card/30 p-4">
            <div className="mx-auto max-w-3xl">
              {active && active.messages.some((m) => m.role === "assistant") && !streaming && (
                <div className="mb-2 flex justify-end">
                  <Button size="sm" variant="ghost" onClick={regenerate}>
                    <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                  </Button>
                </div>
              )}
              <form
                className="flex items-end gap-2 rounded-2xl border border-border bg-background/60 p-2 focus-within:border-primary"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  disabled={streaming}
                  placeholder={
                    dataset
                      ? `Ask InsightIQ about ${dataset.name}…`
                      : "Ask InsightIQ anything…"
                  }
                  className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none disabled:opacity-60"
                />
                {streaming ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={stop}
                    className="shrink-0"
                    title="Stop"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 gradient-primary border-0"
                    disabled={!input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </form>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Copilot can make mistakes. Verify important results.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function EmptyState({
  suggestions,
  onPick,
  datasetName,
}: {
  suggestions: string[];
  onPick: (s: string) => void;
  datasetName?: string;
}) {
  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold">How can I help today?</div>
          <div className="text-xs text-muted-foreground">
            {datasetName
              ? `Grounded on ${datasetName}. Answers cite the active dataset.`
              : "Upload or pick a dataset for grounded answers."}
          </div>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border glass p-3 text-left text-sm transition hover:border-primary/40 hover:bg-accent/20"
          >
            <Sparkles className="mr-2 inline h-3.5 w-3.5 text-primary" />
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  if (msg.role === "user") {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
          {msg.content}
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-xs">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-primary shadow-glow">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="rounded-2xl rounded-tl-sm border border-border glass px-4 py-3 text-sm">
          {msg.content ? (
            <div className="prose prose-sm prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-1 prose-p:my-2 prose-pre:bg-background/60 prose-pre:border prose-pre:border-border prose-code:before:hidden prose-code:after:hidden">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Generating…
            </div>
          )}
        </div>
        {msg.content && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={copy}>
              {copied ? (
                <><Check className="mr-1 h-3 w-3" /> Copied</>
              ) : (
                <><Copy className="mr-1 h-3 w-3" /> Copy</>
              )}
            </Button>
            {msg.datasetId && (
              <Badge variant="outline" className="text-[10px]">
                Grounded on active dataset
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
