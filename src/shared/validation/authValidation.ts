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
  .trim()
  .max(EMAIL_MAX_LENGTH)
  .regex(EMAIL_REGEX);

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH)
  .max(USERNAME_MAX_LENGTH)
  .regex(USERNAME_REGEX);

export const passwordSchema = z
  .string()
  .trim()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH);

export const emailCodeSchema = z
  .string()
  .trim()
  .length(EMAIL_CODE_LENGTH)
  .regex(EMAIL_CODE_REGEX);

export const loginIdentifierSchema = z.string().trim().min(1).refine((value) => {
  const schema = value.includes("@") ? emailSchema : usernameSchema;
  return schema.safeParse(value).success;
});

export const authLoginSchema = z.object({
  login: loginIdentifierSchema,
  password: passwordSchema,
});

export const authRegisterSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const authVerifyEmailSchema = z.object({
  code: emailCodeSchema,
});

export const authOfflineLoginSchema = z.object({
  username: usernameSchema,
});
