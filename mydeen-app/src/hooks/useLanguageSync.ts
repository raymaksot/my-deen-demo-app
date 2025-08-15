import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { changeLanguage } from '@/i18n';

/**
 * Hook to synchronize i18n language with preferences store
 * Call this in the root component to ensure language changes are applied
 */
export function useLanguageSync() {
  const locale = useAppSelector((state) => state.preferences.locale);
  
  useEffect(() => {
    if (locale) {
      changeLanguage(locale);
    }
  }, [locale]);
}