'use client';

import { ReactNode, useEffect } from 'react';
import '../lib/i18n'; // Initialize i18n only on client side

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // i18n is already initialized by the import above
    // This effect ensures it only runs on the client
  }, []);

  return <>{children}</>;
} 