import { create } from "zustand";

export const useMenuPrepStore = create((set) => ({
  prepStatus: null,
  currentEventId: null,
  setPrepStatus: (status, eventId = null) =>
    set((state) => ({
      prepStatus: status,
      currentEventId: eventId !== null ? eventId : state.currentEventId,
    })),
  resetPrepStatus: () => set({ prepStatus: null, currentEventId: null }),
}));
