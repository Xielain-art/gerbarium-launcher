import ru from "./locales/ru.json";
import en from "./locales/en.json";

type BaseTranslation = typeof ru;

type TranslationWithFns = BaseTranslation & {
  LOGIN: BaseTranslation["LOGIN"] & {
    VERIFY_DESCRIPTION: (email: string) => string;
    RESEND_IN: (seconds: number) => string;
  };
  SETTINGS: BaseTranslation["SETTINGS"] & {
    JAVA: BaseTranslation["SETTINGS"]["JAVA"] & {
      DOWNLOAD_BUTTON: (v: number) => string;
      ALREADY_INSTALLED: (v: number) => string;
    };
    DEBUG: BaseTranslation["SETTINGS"]["DEBUG"] & {
      EXPORT_SUCCESS: (path: string) => string;
      EXPORT_ERROR: (err: string) => string;
    };
  };
};

function withTemplates(base: BaseTranslation, locale: "ru" | "en"): TranslationWithFns {
  const isRu = locale === "ru";
  return {
    ...base,
    LOGIN: {
      ...base.LOGIN,
      VERIFY_DESCRIPTION: (email: string) =>
        isRu ? `Мы отправили код подтверждения на ${email}.` : `We sent a verification code to ${email}.`,
      RESEND_IN: (seconds: number) =>
        isRu ? `Повторная отправка через ${seconds}с` : `Resend in ${seconds}s`,
    },
    SETTINGS: {
      ...base.SETTINGS,
      JAVA: {
        ...base.SETTINGS.JAVA,
        DOWNLOAD_BUTTON: (v: number) => (isRu ? `Скачать Java ${v}` : `Download Java ${v}`),
        ALREADY_INSTALLED: (v: number) => (isRu ? `Java ${v} уже установлена` : `Java ${v} is already installed`),
      },
      DEBUG: {
        ...base.SETTINGS.DEBUG,
        EXPORT_SUCCESS: (path: string) =>
          isRu
            ? `Логи успешно сохранены в:\n${path}`
            : `Logs successfully exported to:\n${path}`,
        EXPORT_ERROR: (err: string) =>
          isRu ? `Ошибка при сохранении логов:\n${err}` : `Failed to export logs:\n${err}`,
      },
    },
  };
}

export const TRANSLATIONS = {
  ru: withTemplates(ru, "ru"),
  en: withTemplates(en, "en"),
} as const;

export type TranslationType = (typeof TRANSLATIONS)["ru"];
