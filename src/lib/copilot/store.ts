import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  model?: string;
  datasetId?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
}

interface CopilotState {
  conversations: Conversation[];
  activeId: string | null;
  createConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  appendMessage: (id: string, msg: ChatMessage) => void;
  updateMessage: (convId: string, msgId: string, patch: Partial<ChatMessage>) => void;
  replaceLastAssistant: (convId: string, content: string) => void;
  removeMessage: (convId: string, msgId: string) => void;
}

const newConversation = (): Conversation => ({
  id: crypto.randomUUID(),
  title: "New conversation",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
});

export const useCopilot = create<CopilotState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,
      createConversation: () => {
        const c = newConversation();
        set((s) => ({ conversations: [c, ...s.conversations], activeId: c.id }));
        return c.id;
      },
      selectConversation: (id) => set({ activeId: id }),
      deleteConversation: (id) =>
        set((s) => {
          const conversations = s.conversations.filter((c) => c.id !== id);
          return {
            conversations,
            activeId: s.activeId === id ? conversations[0]?.id ?? null : s.activeId,
          };
        }),
      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title: title.trim() || c.title, updatedAt: Date.now() } : c,
          ),
        })),
      togglePin: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c,
          ),
        })),
      appendMessage: (id, msg) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== id) return c;
            const messages = [...c.messages, msg];
            const title =
              c.title === "New conversation" && msg.role === "user"
                ? msg.content.slice(0, 60)
                : c.title;
            return { ...c, messages, title, updatedAt: Date.now() };
          }),
        })),
      updateMessage: (convId, msgId, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)),
                  updatedAt: Date.now(),
                }
              : c,
          ),
        })),
      replaceLastAssistant: (convId, content) => {
        const conv = get().conversations.find((c) => c.id === convId);
        if (!conv) return;
        const last = [...conv.messages].reverse().find((m) => m.role === "assistant");
        if (last) get().updateMessage(convId, last.id, { content });
      },
      removeMessage: (convId, msgId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) } : c,
          ),
        })),
    }),
    { name: "insightiq.copilot", storage: createJSONStorage(() => localStorage) },
  ),
);

export function ensureActiveConversation(): string {
  const s = useCopilot.getState();
  if (s.activeId && s.conversations.find((c) => c.id === s.activeId)) return s.activeId;
  return s.createConversation();
}
