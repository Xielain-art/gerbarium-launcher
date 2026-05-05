import type { GetState, SetState } from "./authStoreActionTypes";
import { createAuthStoreAccountActions } from "./authStoreAccountActions";
import { createAuthStoreEmailActions } from "./authStoreEmailActions";
import { createAuthStoreSessionActions } from "./authStoreSessionActions";

export function createAuthStoreActions(set: SetState, get: GetState) {
  return {
    clearError: () => set({ error: null }),
    ...createAuthStoreSessionActions(set, get),
    ...createAuthStoreAccountActions(set, get),
    ...createAuthStoreEmailActions(set, get),
  };
}
