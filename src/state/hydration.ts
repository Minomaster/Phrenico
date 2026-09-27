import { useSyncExternalStore } from 'react';

import { useFavorites } from './favorites';
import { usePreferences } from './preferences';
import { useRecent } from './recent';

const persistedStores = [usePreferences, useFavorites, useRecent];

const allHydrated = () => persistedStores.every((store) => store.persist.hasHydrated());

function subscribe(onChange: () => void) {
  const unsubscribers = persistedStores.map((store) => store.persist.onFinishHydration(onChange));
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

/**
 * True once all locally stored data has been read. The app waits for this, so
 * the disclaimer does not flash for users who have already accepted it.
 */
export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribe, allHydrated, allHydrated);
}
