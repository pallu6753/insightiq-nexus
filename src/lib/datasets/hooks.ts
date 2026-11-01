import { useEffect, useState } from "react";
import { useDatasetMeta, ensureSamplesSeeded, getRows } from "./store";
import type { Dataset } from "./types";

export function useActiveDataset(): { dataset: Dataset | null; loading: boolean } {
  const activeId = useDatasetMeta((s) => s.activeId);
  const meta = useDatasetMeta((s) => s.metas.find((m) => m.id === s.activeId) ?? null);
  const [rows, setRows] = useState<Dataset["rows"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ensureSamplesSeeded().then(async () => {
      const id = useDatasetMeta.getState().activeId;
      if (!id) { if (!cancelled) { setRows([]); setLoading(false); } return; }
      const r = await getRows(id);
      if (!cancelled) { setRows(r); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [activeId]);

  if (!meta || rows === null) return { dataset: null, loading };
  return { dataset: { ...meta, rows }, loading };
}

export function useSeedSamples() {
  useEffect(() => { ensureSamplesSeeded(); }, []);
}
