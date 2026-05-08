import { STORAGE_KEYS } from "../../../shared/constants/system";
import { TRANSLATIONS } from "../../../shared/constants/translations";

type LocaleKey = keyof typeof TRANSLATIONS;

type StoreErrorKey = keyof (typeof TRANSLATIONS)["en"]["STORE_ERRORS"];

type DownloadKey = keyof (typeof TRANSLATIONS)["en"]["DOWNLOAD"];

function getStoredLanguage(): LocaleKey {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return "ru";
    }
    const parsed = JSON.parse(raw) as {
      state?: { general?: { language?: string } };
    };
    const language = parsed.state?.general?.language;
    if (language === "ru" || language === "en") {
      return language;
    }
    return "ru";
  } catch {
    return "ru";
  }
}

function getTranslation() {
  return TRANSLATIONS[getStoredLanguage()];
}

export function tStoreError(key: StoreErrorKey): string {
  return getTranslation().STORE_ERRORS[key];
}

export function tDownload(key: DownloadKey): string {
  return getTranslation().DOWNLOAD[key];
}
