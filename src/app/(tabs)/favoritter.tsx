import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, ListRow, rowPosition, Screen, ScreenTitle, SectionHeader } from '@/components';
import type { ContentKind } from '@/content/types';
import { useContent } from '@/content/useContent';
import { da } from '@/i18n/da';
import { routes } from '@/navigation/routes';
import { compareDanish } from '@/search/danishSort';
import { useFavorites } from '@/state/favorites';

/** Favoritter: the doctor's own shortlist of formulas and diseases, grouped and sorted A–Å. */
export default function FavoritesScreen() {
  const content = useContent();
  const refs = useFavorites((state) => state.items);
  // Favourites of pages that are no longer approved simply disappear.
  const resolved = content.resolve(refs);
  const groups: { kind: ContentKind; title: string; items: { id: string; title: string; summary: string }[] }[] = [
    { kind: 'formula', title: da.tabs.formulas, items: resolved.filter((r) => r.kind === 'formula').map((r) => r.item) },
    { kind: 'disease', title: da.tabs.diseases, items: resolved.filter((r) => r.kind === 'disease').map((r) => r.item) },
  ];

  return (
    <Screen safeTop>
      <ScreenTitle>{da.tabs.favorites}</ScreenTitle>
      {resolved.length === 0 ? (
        <EmptyState icon="star-outline" title={da.favorites.emptyTitle} text={da.favorites.emptyText} />
      ) : (
        groups.map((group) => {
          if (group.items.length === 0) return null;
          const items = [...group.items].sort((a, b) => compareDanish(a.title, b.title));
          return (
            <View key={group.kind}>
              <SectionHeader title={group.title} count={items.length} />
              {items.map((item, index) => (
                <ListRow
                  key={item.id}
                  title={item.title}
                  subtitle={item.summary}
                  favorite
                  position={rowPosition(index, items.length)}
                  onPress={() => router.push(routes.item(group.kind, item.id))}
                />
              ))}
            </View>
          );
        })
      )}
    </Screen>
  );
}
