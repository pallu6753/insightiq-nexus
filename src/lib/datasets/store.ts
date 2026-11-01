import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from "idb-keyval";
import type { Dataset, DatasetMeta, Row } from "./types";
import { inferSchema, coerceRows, qualityScore } from "./profile";
import { SAMPLE_DATASETS } from "./samples";

interface MetaState {
  metas: DatasetMeta[];
  activeId: string | null;
  hasSeeded: boolean;
  setActive: (id: string) => void;
  addMeta: (m: DatasetMeta) => void;
  updateMeta: (id: string, patch: Partial<DatasetMeta>) => void;
  removeMeta: (id: string) => void;
  markSeeded: () => void;
}

export const useDatasetMeta = create<MetaState>()(
  persist(
    (set) => ({
      metas: [],
      activeId: null,
      hasSeeded: false,
      setActive: (id) => set({ activeId: id }),
      addMeta: (m) => set((s) => ({ metas: [m, ...s.metas.filter((x) => x.id !== m.id)], activeId: m.id })),
      updateMeta: (id, patch) =>
        set((s) => ({ metas: s.metas.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m)) })),
      removeMeta: (id) =>
        set((s) => {
          const metas = s.metas.filter((m) => m.id !== id);
          return { metas, activeId: s.activeId === id ? metas[0]?.id ?? null : s.activeId };
        }),
      markSeeded: () => set({ hasSeeded: true }),
    }),
    { name: "insightiq.datasets", storage: createJSONStorage(() => localStorage) },
  ),
);

const rowsCache = new Map<string, Row[]>();

const rowsKey = (id: string) => `ds-rows-${id}`;

export async function getRows(id: string): Promise<Row[]> {
  if (rowsCache.has(id)) return rowsCache.get(id)!;
  const rows = ((await idbGet(rowsKey(id))) as Row[] | undefined) ?? [];
  rowsCache.set(id, rows);
  return rows;
}

export async function saveDataset(meta: DatasetMeta, rows: Row[]): Promise<void> {
  rowsCache.set(meta.id, rows);
  await idbSet(rowsKey(meta.id), rows);
  useDatasetMeta.getState().addMeta(meta);
}

export async function deleteDataset(id: string): Promise<void> {
  rowsCache.delete(id);
  await idbDel(rowsKey(id));
  useDatasetMeta.getState().removeMeta(id);
}

export async function duplicateDataset(id: string, newName: string): Promise<string> {
  const meta = useDatasetMeta.getState().metas.find((m) => m.id === id);
  if (!meta) throw new Error("Dataset not found");
  const rows = await getRows(id);
  const newId = crypto.randomUUID();
  const clone: DatasetMeta = { ...meta, id: newId, name: newName, source: "upload", createdAt: Date.now(), updatedAt: Date.now() };
  await saveDataset(clone, rows);
  return newId;
}

export async function buildDataset(name: string, rows: Row[], source: DatasetMeta["source"], format: DatasetMeta["format"], sizeBytes = 0): Promise<DatasetMeta> {
  const columns = inferSchema(rows);
  const coerced = coerceRows(rows, columns);
  const finalCols = inferSchema(coerced);
  const quality = qualityScore(coerced, finalCols);
  const meta: DatasetMeta = {
    id: crypto.randomUUID(),
    name,
    source,
    format,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rowCount: coerced.length,
    columnCount: finalCols.length,
    sizeBytes,
    columns: finalCols,
    qualityScore: quality,
  };
  await saveDataset(meta, coerced);
  return meta;
}

export async function getDataset(id: string): Promise<Dataset | null> {
  const meta = useDatasetMeta.getState().metas.find((m) => m.id === id);
  if (!meta) return null;
  const rows = await getRows(id);
  return { ...meta, rows };
}

let seedPromise: Promise<void> | null = null;

export function ensureSamplesSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const state = useDatasetMeta.getState();
    if (state.hasSeeded) return;
    // Check what actually exists in IDB
    const existing = new Set((await idbKeys()).map(String));
    for (const s of SAMPLE_DATASETS) {
      const already = state.metas.find((m) => m.id === s.id);
      const hasRows = existing.has(rowsKey(s.id));
      if (already && hasRows) continue;
      const rows = s.build();
      const columns = inferSchema(rows);
      const coerced = coerceRows(rows, columns);
      const finalCols = inferSchema(coerced);
      const meta: DatasetMeta = {
        id: s.id,
        name: s.name,
        source: "sample",
        format: "json",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        rowCount: coerced.length,
        columnCount: finalCols.length,
        sizeBytes: 0,
        columns: finalCols,
        qualityScore: qualityScore(coerced, finalCols),
      };
      rowsCache.set(s.id, coerced);
      await idbSet(rowsKey(s.id), coerced);
      useDatasetMeta.setState((cur) => ({
        metas: [...cur.metas.filter((m) => m.id !== s.id), meta],
      }));
    }
    const cur = useDatasetMeta.getState();
    if (!cur.activeId && cur.metas.length) useDatasetMeta.setState({ activeId: cur.metas[0].id });
    useDatasetMeta.getState().markSeeded();
  })();
  return seedPromise;
}
