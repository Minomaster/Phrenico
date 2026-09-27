import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ContentRef } from '@/content/types';

import { deviceStorage, storageKey } from './storage';

export const MAX_RECENT = 10;

interface RecentState {
  items: ContentRef[];
  /** Moves the page to the top of "Senest brugt". */
  record: (ref: ContentRef) => void;
  clear: () => void;
}

export const useRecent = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      record: (ref) =>
        set(({ items }) => ({
          items: [
            { kind: ref.kind, id: ref.id },
            ...items.filter((item) => !(item.kind === ref.kind && item.id === ref.id)),
          ].slice(0, MAX_RECENT),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: storageKey('recent'), version: 1, storage: deviceStorage },
  ),
);
