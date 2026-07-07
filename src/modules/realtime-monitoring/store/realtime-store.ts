"use client";

import { create } from "zustand";
import type { Alert, AlertStatus } from "@/shared/types";
import { createRandomAlert } from "@/shared/lib/mock-data";

const MAX_FEED_SIZE = 50;
const MIN_INTERVAL_MS = 1800;
const MAX_INTERVAL_MS = 4200;

function randomDelay() {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

interface RealtimeMonitoringState {
  alerts: Alert[];
  isStreaming: boolean;
  totalEventsReceived: number;
  timerId: ReturnType<typeof setTimeout> | null;
  actions: {
    start: () => void;
    stop: () => void;
    setStatus: (id: string, status: AlertStatus) => void;
    clear: () => void;
  };
}

export const useRealtimeMonitoringStore = create<RealtimeMonitoringState>((set, get) => ({
  alerts: [],
  isStreaming: false,
  totalEventsReceived: 0,
  timerId: null,

  actions: {
    start: () => {
      if (get().isStreaming) return;

      const tick = () => {
        set((state) => ({
          alerts: [createRandomAlert(), ...state.alerts].slice(0, MAX_FEED_SIZE),
          totalEventsReceived: state.totalEventsReceived + 1,
          timerId: setTimeout(tick, randomDelay()),
        }));
      };

      set({ isStreaming: true, timerId: setTimeout(tick, randomDelay()) });
    },

    stop: () => {
      const { timerId } = get();
      if (timerId) clearTimeout(timerId);
      set({ isStreaming: false, timerId: null });
    },

    setStatus: (id, status) =>
      set((state) => ({
        alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, status } : alert)),
      })),

    clear: () => set({ alerts: [], totalEventsReceived: 0 }),
  },
}));

/** Dispatchers only — stable reference, never causes re-renders. */
export const useRealtimeMonitoringActions = () => useRealtimeMonitoringStore((s) => s.actions);
