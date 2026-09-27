import { StyleSheet, View } from 'react-native';

import { IS_DEMO } from '@/content/active';
import { da } from '@/i18n/da';
import { spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

/** Shown on every screen in demo mode, so placeholder content is never mistaken for real content. */
export function DemoBanner() {
  const { colors } = useAppTheme();
  if (!IS_DEMO) return null;
  return (
    <View
      style={[styles.banner, { backgroundColor: colors.warningSurface, borderBottomColor: colors.warning }]}
      accessibilityRole="alert"
    >
      <Icon name="warning-outline" size={16} color="warning" />
      <AppText variant="caption" color="warning" style={styles.text}>
        {da.demo.banner}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { fontWeight: '700' },
});
