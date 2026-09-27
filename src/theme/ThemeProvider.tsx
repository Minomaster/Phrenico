import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { usePreferences } from '@/state/preferences';

import { createTheme, type ColorScheme, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(createTheme('light'));

/**
 * Follows the phone's light/dark setting unless the user has chosen a fixed
 * theme under Mere → Tema (useful on night shifts).
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = usePreferences((state) => state.theme);

  const scheme: ColorScheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const theme = useMemo(() => createTheme(scheme), [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): Theme {
  return useContext(ThemeContext);
}
