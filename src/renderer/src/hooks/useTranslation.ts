import { useMemo } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { TRANSLATIONS, TranslationType } from '../../../shared/constants/translations';

type UseTranslationResult = TranslationType & { t: TranslationType };

export function useTranslation(): UseTranslationResult {
  const language = useSettingsStore((state) => state.general.language) as 'ru' | 'en';
  const translations = TRANSLATIONS[language] || TRANSLATIONS.ru;

  return useMemo(
    () => ({
      ...translations,
      t: translations,
    }),
    [translations]
  );
}
