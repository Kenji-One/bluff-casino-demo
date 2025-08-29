"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type UIContextShape = {
  busyCount: number;
  isBusy: boolean;
  startBusy: () => void;
  stopBusy: () => void;
  withBusy: <T>(fn: () => Promise<T>) => Promise<T>;
};

const UIContext = createContext<UIContextShape>({} as UIContextShape);

export function UIProvider({ children }: { children: ReactNode }) {
  const [busyCount, setBusyCount] = useState(0);
  const seq = useRef(0);

  const startBusy = () => setBusyCount((c) => c + 1);
  const stopBusy = () => setBusyCount((c) => Math.max(0, c - 1));

  const withBusy = async <T,>(fn: () => Promise<T>) => {
    startBusy();
    const id = ++seq.current;
    try {
      return await fn();
    } finally {
      if (seq.current === id) stopBusy();
    }
  };

  const value = useMemo(
    () => ({ busyCount, isBusy: busyCount > 0, startBusy, stopBusy, withBusy }),
    [busyCount]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  return useContext(UIContext);
}
