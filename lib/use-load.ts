"use client";

import { useCallback, useEffect, useState } from "react";

/** Runs an async loader on mount (and when deps change); `reload` runs it again. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  const reload = useCallback(async () => {
    try {
      setData(await run());
      setError("");
    } catch (e) {
      console.error(e);
      setError("Couldn't load the studio records. Check your connection and refresh.");
    }
  }, [run]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, reload };
}
