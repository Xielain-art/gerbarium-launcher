import type { components } from "./v1";

export type ApiUser = components["schemas"]["UserResponseDto"];
export type ApiNews = components["schemas"]["NewsResponseDto"];
export type ApiNewsTag = components["schemas"]["NewsTagResponseDto"];
export type ApiCreateNewsDto = components["schemas"]["CreateNewsDto"];
export type ApiUpdateNewsDto = components["schemas"]["UpdateNewsDto"];
export type ApiCreateNewsTagDto = components["schemas"]["NewsTagNameDto"];
export type ApiChangelog = components["schemas"]["ChangelogResponseDto"];
export type ApiCreateChangelogDto = components["schemas"]["CreateChangelogDto"];
export type ApiUpdateChangelogDto = components["schemas"]["UpdateChangelogDto"];
export type ApiAuthResponse = components["schemas"]["AuthResponseDto"];
export type ApiLoginDto = components["schemas"]["LoginDto"];
export type ApiRegisterDto = components["schemas"]["RegisterDto"];
export type ApiVerifyEmailDto = components["schemas"]["VerifyEmailDto"];
export type ApiEmailVerificationStatus =
  components["schemas"]["EmailVerificationStatusDto"];
export type ApiEmailVerifiedResponse =
  components["schemas"]["EmailVerifiedResponseDto"];
export type ApiRole = components["schemas"]["RoleResponseDto"];
export type ApiCreateRoleDto = components["schemas"]["CreateRoleDto"];
export type ApiAdminStats = components["schemas"]["AdminStatsDto"];

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
