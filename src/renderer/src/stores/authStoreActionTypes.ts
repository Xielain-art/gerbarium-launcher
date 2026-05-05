import type { StoreApi } from "zustand";
import type { AuthStoreState } from "./authStoreTypes";

export type SetState = StoreApi<AuthStoreState>["setState"];
export type GetState = StoreApi<AuthStoreState>["getState"];
