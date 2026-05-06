import type { components } from "../v1";

export type ApiWrappedData<T> = T | { data: T };

export type ApiSuccessResult<T> = {
  success: true;
  data: T;
  status: number;
  setCookie?: string | null;
  errorMessage?: string;
};

export type ApiErrorResult = {
  success: false;
  status?: number;
  errorMessage?: string;
  errorDetails?: string;
  setCookie?: string | null;
};

export type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult;

export type ApiUser = components["schemas"]["UserResponseDto"];
export type ApiAuthResponse = components["schemas"]["AuthResponseDto"];
export type ApiLoginDto = components["schemas"]["LoginDto"];
export type ApiRegisterDto = components["schemas"]["RegisterDto"];
export type ApiVerifyEmailDto = components["schemas"]["VerifyEmailDto"];
export type ApiEmailVerificationStatus =
  components["schemas"]["EmailVerificationStatusDto"];
export type ApiEmailVerifiedResponse =
  components["schemas"]["EmailVerifiedResponseDto"];
export type ApiAccountDeletionCodeStatus =
  components["schemas"]["AccountDeletionCodeStatusDto"];
export type ApiTestRegisterResponse =
  components["schemas"]["TestRegisterResponseDto"];

