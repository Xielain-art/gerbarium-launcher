import { IPC_CHANNELS } from "../../shared/constants/ipc-chanels";
import { typedInvoke } from "../ipc";
import type {
  AuthEmailVerificationStatus,
  AuthSessionUser,
} from "../../shared/constants/ipc-chanels";

export function createAuthApi() {
  return {
    login: (credentials: { login: string; password: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.LOGIN, credentials),
    register: (payload: { email: string; username: string; password: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.REGISTER, payload),
    registerTest: (payload: { email: string; username: string; password: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.REGISTER_TEST, payload),
    requestDeleteCode: () => typedInvoke(IPC_CHANNELS.AUTH.REQUEST_DELETE_CODE),
    deleteAccount: (payload: { code: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.DELETE_ACCOUNT, payload),
    verifyEmail: (payload: { code: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.VERIFY_EMAIL, payload),
    getEmailVerificationStatus: (): Promise<{
      success: boolean;
      emailVerification?: AuthEmailVerificationStatus;
      error?: string;
    }> => typedInvoke(IPC_CHANNELS.AUTH.GET_EMAIL_VERIFICATION_STATUS),
    resendEmailVerification: (): Promise<{
      success: boolean;
      emailVerification?: AuthEmailVerificationStatus;
      error?: string;
    }> => typedInvoke(IPC_CHANNELS.AUTH.RESEND_EMAIL_VERIFICATION),
    loginOffline: (payload: { username: string }) =>
      typedInvoke(IPC_CHANNELS.AUTH.LOGIN_OFFLINE, payload),
    getSession: () => typedInvoke(IPC_CHANNELS.AUTH.GET_SESSION),
    logout: () => typedInvoke(IPC_CHANNELS.AUTH.LOGOUT),
    getProfile: async (): Promise<AuthSessionUser | null> => {
      const session = await typedInvoke(IPC_CHANNELS.AUTH.GET_SESSION);
      return session.success && session.isAuthenticated ? (session.user ?? null) : null;
    },
  };
}
