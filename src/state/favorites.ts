import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ContentRef } from '@/content/types';

import { deviceStorage, storageKey } from './storage';

interface FavoritesState {
  items: ContentRef[];
  toggle: (ref: ContentRef) => void;
}

const same = (a: ContentRef, b: ContentRef) => a.kind === b.kind && a.id === b.id;

export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (ref) =>
        set(({ items }) => ({
          items: items.some((item) => same(item, ref))
            ? items.filter((item) => !same(item, ref))
            : [...items, { kind: ref.kind, id: ref.id }],
        })),
    }),
    { name: storageKey('favorites'), version: 1, storage: deviceStorage },
  ),
);

export function useIsFavorite(ref: ContentRef): boolean {
  return useFavorites((state) => state.items.some((item) => same(item, ref)));
}
