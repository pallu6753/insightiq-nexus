import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Report } from "./build";

interface ReportsState {
  reports: Report[];
  addReport: (r: Report) => void;
  removeReport: (id: string) => void;
  renameReport: (id: string, name: string) => void;
  toggleFavorite: (id: string) => void;
  duplicateReport: (id: string) => string | null;
  clearForDataset: (datasetId: string) => void;
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: [],
      addReport: (r) => set((s) => ({ reports: [r, ...s.reports] })),
      removeReport: (id) => set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),
      renameReport: (id, name) =>
        set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, name: name.trim() || r.name } : r)) })),
      toggleFavorite: (id) =>
        set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)) })),
      duplicateReport: (id) => {
        const r = get().reports.find((x) => x.id === id);
        if (!r) return null;
        const clone: Report = { ...r, id: crypto.randomUUID(), name: `${r.name} (copy)`, generatedAt: Date.now() };
        set((s) => ({ reports: [clone, ...s.reports] }));
        return clone.id;
      },
      clearForDataset: (datasetId) =>
        set((s) => ({ reports: s.reports.filter((r) => r.datasetId !== datasetId) })),
    }),
    { name: "insightiq.reports", storage: createJSONStorage(() => localStorage) },
  ),
);
