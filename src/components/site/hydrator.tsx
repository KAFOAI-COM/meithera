"use client";

import { useEffect, useState } from "react";
import { useDemo } from "@/lib/store";

/** Rehydrates the demo store from sessionStorage after mount (avoids SSR mismatches). */
export function StoreHydrator() {
  useEffect(() => {
    void useDemo.persist.rehydrate();
  }, []);
  return null;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    if (useDemo.persist.hasHydrated()) setH(true);
    const unsub = useDemo.persist.onFinishHydration(() => setH(true));
    return unsub;
  }, []);
  return h;
}
