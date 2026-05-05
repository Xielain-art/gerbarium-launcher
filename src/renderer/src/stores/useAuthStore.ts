import { create } from "zustand";
import { createAuthStoreActions } from "./authStoreActions";
import { authDefaultState, type AuthStoreState } from "./authStoreTypes";

export const useAuthStore = create<AuthStoreState>()((set, get) => ({
  ...authDefaultState,
  ...createAuthStoreActions(set, get),
}));
