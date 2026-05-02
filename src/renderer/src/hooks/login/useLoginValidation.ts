import { useMemo } from "react";
import type { TranslationType } from "../../../../shared/constants/translations";
import {
  emailCodeSchema,
  emailSchema,
  loginIdentifierSchema,
  passwordSchema,
    usernameSchema,
  } from "../../lib/validation/authValidation";
import type { TouchedFields } from "./types";
import { z } from "zod";

export function useLoginValidation(
  t: TranslationType,
  mode: "login" | "register",
  offlineMode: boolean,
  localUsername: string,
  localEmail: string,
  localPassword: string,
  localPasswordConfirm: string,
  verificationCode: string,
  touchedFields: TouchedFields
) {
  return useMemo(() => {
    const check = (
      schema: z.ZodTypeAny,
      value: string,
      field: keyof typeof touchedFields,
      errorMsg: string,
    ) => {
      try {
        schema.parse(value);
        return { isValid: true, error: null, touched: touchedFields[field] };
      } catch {
        return {
          isValid: false,
          error: touchedFields[field] ? errorMsg : null,
          touched: touchedFields[field],
        };
      }
    };

    return {
      username: check(
        mode === "login" && !localUsername.includes("@") ? loginIdentifierSchema : usernameSchema,
        localUsername,
        "username",
        mode === "login" ? t.STORE_ERRORS.AUTH_LOGIN_INVALID : t.STORE_ERRORS.AUTH_USERNAME_INVALID
      ),
      email: check(emailSchema, localEmail, "email", t.STORE_ERRORS.AUTH_EMAIL_INVALID),
      password: check(passwordSchema, localPassword, "password", t.STORE_ERRORS.AUTH_PASSWORD_INVALID),
      passwordConfirm: {
        isValid: localPassword === localPasswordConfirm,
        error: touchedFields.passwordConfirm && localPassword !== localPasswordConfirm ? t.STORE_ERRORS.AUTH_PASSWORDS_MISMATCH : null,
        touched: touchedFields.passwordConfirm
      },
      verificationCode: check(emailCodeSchema, verificationCode, "verificationCode", t.STORE_ERRORS.AUTH_EMAIL_CODE_INVALID),
    };
  }, [localUsername, localEmail, localPassword, localPasswordConfirm, verificationCode, touchedFields, t, mode]);
}
