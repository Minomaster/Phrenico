import { Pressable, StyleSheet } from 'react-native';

import type { ContentRef } from '@/content/types';
import { da } from '@/i18n/da';
import { useFavorites, useIsFavorite } from '@/state/favorites';
import { minTouchTarget } from '@/theme';

import { Icon } from './Icon';

/** The star in the header of formula and disease pages. */
export function FavoriteButton({ contentRef }: { contentRef: ContentRef }) {
  const isFavorite = useIsFavorite(contentRef);
  const toggle = useFavorites((state) => state.toggle);
  return (
    <Pressable
      onPress={() => toggle(contentRef)}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? da.favorites.remove : da.favorites.add}
      accessibilityState={{ selected: isFavorite }}
      hitSlop={8}
      style={styles.button}
    >
      <Icon name={isFavorite ? 'star' : 'star-outline'} size={24} color="primary" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minWidth: minTouchTarget, minHeight: minTouchTarget, alignItems: 'center', justifyContent: 'center' },
});
