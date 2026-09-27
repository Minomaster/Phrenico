import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Everything the app remembers (favourites, recently viewed, settings) is
 * stored locally on the phone only. Nothing is sent to a server, and no
 * patient data is ever stored.
 */
export const deviceStorage = createJSONStorage(() => AsyncStorage);

/** Prefix for all storage keys, so they are easy to find and migrate. */
export const storageKey = (name: string) => `phrenico:${name}`;
