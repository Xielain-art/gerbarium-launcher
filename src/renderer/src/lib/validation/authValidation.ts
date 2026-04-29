import { z } from "zod";

export const EMAIL_MAX_LENGTH = 320;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 32;
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_CODE_LENGTH = 6;

const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_CODE_REGEX = /^\d{6}$/;

export const emailSchema = z
  .string()
  .max(EMAIL_MAX_LENGTH, "AUTH_EMAIL_INVALID")
  .regex(EMAIL_REGEX, "AUTH_EMAIL_INVALID");

export const usernameSchema = z
  .string()
  .min(USERNAME_MIN_LENGTH, "AUTH_USERNAME_INVALID")
  .max(USERNAME_MAX_LENGTH, "AUTH_USERNAME_INVALID")
  .regex(USERNAME_REGEX, "AUTH_USERNAME_INVALID");

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "AUTH_PASSWORD_INVALID")
  .max(PASSWORD_MAX_LENGTH, "AUTH_PASSWORD_INVALID");

export const loginIdentifierSchema = z.string().refine((value) => {
  const parsedByType = value.includes("@")
    ? emailSchema.safeParse(value)
    : usernameSchema.safeParse(value);
  return parsedByType.success;
}, "AUTH_LOGIN_INVALID");

export const emailCodeSchema = z
  .string()
  .length(EMAIL_CODE_LENGTH, "AUTH_EMAIL_CODE_INVALID")
  .regex(EMAIL_CODE_REGEX, "AUTH_EMAIL_CODE_INVALID");
