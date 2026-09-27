import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, storageKey } from './storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface PreferencesState {
  theme: ThemePreference;
  /** The disclaimer version the user has accepted, or null if never accepted. */
  acceptedDisclaimerVersion: number | null;
  setTheme: (theme: ThemePreference) => void;
  acceptDisclaimer: (version: number) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      acceptedDisclaimerVersion: null,
      setTheme: (theme) => set({ theme }),
      acceptDisclaimer: (version) => set({ acceptedDisclaimerVersion: version }),
    }),
    {
      name: storageKey('preferences'),
      version: 1,
      storage: deviceStorage,
      partialize: ({ theme, acceptedDisclaimerVersion }) => ({ theme, acceptedDisclaimerVersion }),
    },
  ),
);
