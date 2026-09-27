import { StyleSheet, View } from 'react-native';

import { DISCLAIMER_IS_DRAFT, DISCLAIMER_TEXT } from '@/config/disclaimer';
import { da } from '@/i18n/da';
import { radius, spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { ContentBlocks } from './ContentBlocks';

/** The disclaimer text, used both on the first-launch screen and under Mere. */
export function DisclaimerText() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.stack}>
      {DISCLAIMER_IS_DRAFT ? (
        <View style={[styles.badge, { backgroundColor: colors.warningSurface, borderColor: colors.warning }]}>
          <AppText variant="caption" color="warning" style={styles.badgeText}>
            {da.disclaimer.draftBadge}
          </AppText>
        </View>
      ) : null}
      <ContentBlocks
        blocks={[
          ...DISCLAIMER_TEXT.paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
          { type: 'bullets' as const, items: DISCLAIMER_TEXT.points },
          { type: 'paragraph' as const, text: DISCLAIMER_TEXT.closing },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xxs },
  badgeText: { fontWeight: '700' },
});
