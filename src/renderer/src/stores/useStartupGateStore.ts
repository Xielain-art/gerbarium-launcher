import { create } from "zustand";

interface StartupGateState {
  updateGatePassed: boolean;
  setUpdateGatePassed: (value: boolean) => void;
}

export const useStartupGateStore = create<StartupGateState>((set) => ({
  updateGatePassed: false,
  setUpdateGatePassed: (value) => set({ updateGatePassed: value }),
}));

