import { useMemo } from "react";
import { useSettingsStore } from "../stores/useSettingsStore";
import {
  TRANSLATIONS,
  type TranslationType,
} from "../../../shared/constants/translations";

type UseTranslationResult = TranslationType & { t: TranslationType };
type TranslationLocale = keyof typeof TRANSLATIONS;

function isTranslationLocale(value: string): value is TranslationLocale {
  return value in TRANSLATIONS;
}

export function useTranslation(): UseTranslationResult {
  const language = useSettingsStore((state) => state.general.language);
  const selectedLanguage: TranslationLocale = isTranslationLocale(language)
    ? language
    : "ru";
  const translations = TRANSLATIONS[selectedLanguage];

  return useMemo(
    () => ({ ...translations, t: translations }),
    [translations],
  );
}

