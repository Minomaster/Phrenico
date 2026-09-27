import { router } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, EmptyState, ListRow, rowPosition, Screen, ScreenTitle, SearchField, SectionHeader } from '@/components';
import { useContent } from '@/content/useContent';
import { da } from '@/i18n/da';
import { routes } from '@/navigation/routes';
import { MIN_QUERY_LENGTH, search, type SearchHit } from '@/search/search';
import { useFavorites } from '@/state/favorites';
import { useRecent } from '@/state/recent';
import { spacing } from '@/theme';

/** Søg: one search field for the whole app. Shows "Senest brugt" until something is typed. */
export default function SearchScreen() {
  const content = useContent();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => search(content.searchIndex, deferredQuery), [content.searchIndex, deferredQuery]);
  const hasContent = content.formulas.length + content.diseases.length > 0;
  const trimmed = query.trim();

  return (
    <Screen safeTop>
      <ScreenTitle>{da.tabs.search}</ScreenTitle>
      <SearchField value={query} onChangeText={setQuery} placeholder={da.search.placeholder} />

      {!hasContent ? (
        <EmptyState icon="library-outline" title={da.search.noContentTitle} text={da.search.noContentText} />
      ) : trimmed.length === 0 ? (
        <RecentList />
      ) : trimmed.length < MIN_QUERY_LENGTH ? (
        <AppText variant="callout" color="textMuted">
          {da.search.tooShort}
        </AppText>
      ) : results.total === 0 ? (
        <EmptyState icon="search" title={da.search.noResultsTitle} text={da.search.noResultsText(trimmed)} />
      ) : (
        <View>
          <HitGroup title={da.search.diseases} hits={results.diseases} />
          <HitGroup title={da.search.formulas} hits={results.formulas} />
        </View>
      )}
    </Screen>
  );
}

function HitGroup({ title, hits }: { title: string; hits: SearchHit[] }) {
  const favorites = useFavorites((state) => state.items);
  if (hits.length === 0) return null;
  return (
    <View>
      <SectionHeader title={title} count={hits.length} />
      {hits.map((hit, index) => (
        <ListRow
          key={`${hit.kind}:${hit.id}`}
          title={hit.title}
          subtitle={hit.summary}
          meta={hit.field === 'title' ? undefined : da.search.foundIn(da.fields[hit.field])}
          favorite={favorites.some((ref) => ref.kind === hit.kind && ref.id === hit.id)}
          position={rowPosition(index, hits.length)}
          onPress={() => router.push(routes.item(hit.kind, hit.id))}
        />
      ))}
    </View>
  );
}

function RecentList() {
  const content = useContent();
  const recentRefs = useRecent((state) => state.items);
  const clear = useRecent((state) => state.clear);
  const recent = content.resolve(recentRefs);

  if (recent.length === 0) {
    return <EmptyState icon="search" title={da.search.emptyTitle} text={da.search.emptyText} />;
  }

  return (
    <View>
      <View style={styles.recentHeader}>
        <SectionHeader title={da.search.recent} />
        <Pressable onPress={clear} accessibilityRole="button" accessibilityLabel={`${da.search.clearRecent} ${da.search.recent}`} hitSlop={8}>
          <AppText variant="caption" color="primary" style={styles.clear}>
            {da.search.clearRecent}
          </AppText>
        </Pressable>
      </View>
      {recent.map(({ kind, item }, index) => (
        <ListRow
          key={`${kind}:${item.id}`}
          title={item.title}
          subtitle={kind === 'formula' ? da.tabs.formulas : da.tabs.diseases}
          icon={kind === 'formula' ? 'calculator-outline' : 'medkit-outline'}
          position={rowPosition(index, recent.length)}
          onPress={() => router.push(routes.item(kind, item.id))}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  clear: { paddingBottom: spacing.sm, paddingHorizontal: spacing.xs, fontWeight: '700' },
});
