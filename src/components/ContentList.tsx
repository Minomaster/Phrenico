import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import type { ContentKind } from '@/content/types';
import { da } from '@/i18n/da';
import { routes } from '@/navigation/routes';
import { groupByLetter } from '@/search/danishSort';
import { foldText } from '@/search/normalize';
import { useFavorites } from '@/state/favorites';
import { spacing } from '@/theme';

import { EmptyState } from './EmptyState';
import type { IconName } from './Icon';
import { ListRow, rowPosition } from './ListRow';
import { ScreenTitle } from './Screen';
import { SearchField } from './SearchField';
import { SectionHeader } from './SectionHeader';

interface ListItem {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
}

interface ContentListProps {
  kind: ContentKind;
  title: string;
  items: ListItem[];
  emptyIcon: IconName;
  emptyTitle: string;
  emptyText: string;
}

/** The A–Å list used by the Formler and Sygdomme tabs, with a filter field on top. */
export function ContentList({ kind, title, items, emptyIcon, emptyTitle, emptyText }: ContentListProps) {
  const [filter, setFilter] = useState('');
  const favorites = useFavorites((state) => state.items);

  const sections = useMemo(() => {
    const folded = foldText(filter.trim());
    const visible = folded
      ? items.filter((item) => foldText([item.title, ...item.keywords].join(' ')).includes(folded))
      : items;
    return groupByLetter(visible, (item) => item.title);
  }, [filter, items]);

  const isFavorite = (id: string) => favorites.some((ref) => ref.kind === kind && ref.id === id);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <ScreenTitle>{title}</ScreenTitle>
          {items.length > 0 ? (
            <SearchField value={filter} onChangeText={setFilter} placeholder={da.lists.filterPlaceholder} accessibilityLabel={`${da.lists.filterPlaceholder} ${title}`} />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        items.length === 0 ? (
          <EmptyState icon={emptyIcon} title={emptyTitle} text={emptyText} />
        ) : (
          <EmptyState icon="search" title={da.lists.noMatches} text={da.lists.noMatchesText(filter.trim())} />
        )
      }
      renderSectionHeader={({ section }) => <SectionHeader title={section.letter} sticky />}
      renderItem={({ item, index, section }) => (
        <ListRow
          title={item.title}
          subtitle={item.summary}
          favorite={isFavorite(item.id)}
          position={rowPosition(index, section.data.length)}
          onPress={() => router.push(routes.item(kind, item.id))}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, paddingBottom: spacing.xs },
});
