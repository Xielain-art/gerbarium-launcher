import type {
  AuthCredentials,
  AuthEmailVerificationState,
  AuthRegisterCredentials,
  AuthUser,
} from "../types";

export interface AuthStoreState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  emailVerification: AuthEmailVerificationState | null;
  isLoading: boolean;
  isSessionLoading: boolean;
  hasCheckedSession: boolean;
  error: string | null;
  login: (
    credentials: AuthCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    payload: AuthRegisterCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (
    code: string,
  ) => Promise<{ success: boolean; error?: string }>;
  refreshEmailVerificationStatus: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  resendEmailVerification: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  loadToken: () => Promise<void>;
  loginOffline: (
    username: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

export const authDefaultState = {
  user: null,
  isAuthenticated: false,
  emailVerification: null,
  isLoading: false,
  isSessionLoading: false,
  hasCheckedSession: false,
  error: null,
};
