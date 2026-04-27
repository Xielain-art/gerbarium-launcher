import type { components } from "./v1";

export type ApiUser = components["schemas"]["UserResponseDto"];
export type ApiAuthResponse = components["schemas"]["AuthResponseDto"];
export type ApiLoginDto = components["schemas"]["LoginDto"];
export type ApiRegisterDto = components["schemas"]["RegisterDto"];

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
  setCookie?: string | null;
};

export type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult;
