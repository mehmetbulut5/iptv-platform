'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePreferencesStore } from '@/app/lib/store/preferences-store';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { preferences } = usePreferencesStore();
  
  return (
    <NextThemesProvider {...props} forcedTheme={preferences.theme === 'system' ? undefined : preferences.theme}>
      {children}
    </NextThemesProvider>
  );
}