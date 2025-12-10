import { create } from "zustand";

export type DriverStatus = "online" | "offline";

type DriverSummary = {
  todaysEarnings: number;
  pendingPayout: number;
  activeJobId?: string | null;
};

type DriverState = DriverSummary & {
  driverStatus: DriverStatus;
  currentJobId: string | null;
  setDriverStatus: (s: DriverStatus) => void;
  setCurrentJobId: (id: string | null) => void;
  setSummary: (s: Partial<DriverSummary>) => void;
};

export const useDriverStore = create<DriverState>((set) => ({
  driverStatus: "offline",
  currentJobId: null,
  todaysEarnings: 0,
  pendingPayout: 0,
  setDriverStatus: (driverStatus) => set({ driverStatus }),
  setCurrentJobId: (currentJobId) => set({ currentJobId }),
  setSummary: (s) =>
    set((state) => ({
      todaysEarnings: s.todaysEarnings ?? state.todaysEarnings,
      pendingPayout: s.pendingPayout ?? state.pendingPayout,
      currentJobId:
        s.activeJobId !== undefined
          ? s.activeJobId ?? null
          : state.currentJobId,
    })),
}));
