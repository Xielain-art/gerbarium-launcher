import { useSettingsStore } from '../stores/useSettingsStore';
import { TRANSLATIONS, TranslationType } from '../../../shared/constants/translations';

export function useTranslation(): TranslationType {
  const language = useSettingsStore((state) => state.general.language) as 'ru' | 'en';
  // Fallback to RU if language not found
  return TRANSLATIONS[language] || TRANSLATIONS.ru;
}
