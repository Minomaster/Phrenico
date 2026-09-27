import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, radius, spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type RowPosition = 'single' | 'first' | 'middle' | 'last';

export function rowPosition(index: number, count: number): RowPosition {
  if (count <= 1) return 'single';
  if (index === 0) return 'first';
  return index === count - 1 ? 'last' : 'middle';
}

interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Small blue line under the subtitle, e.g. "Fundet i: Symptomer". */
  meta?: string;
  icon?: IconName;
  favorite?: boolean;
  onPress?: () => void;
  /** Where the row sits in its group, so the group gets rounded corners. */
  position?: RowPosition;
  accessory?: ReactNode;
  showChevron?: boolean;
}

/** A row in a grouped list (rounded, light blue card with thin separators). */
export function ListRow({
  title,
  subtitle,
  meta,
  icon,
  favorite,
  onPress,
  position = 'single',
  accessory,
  showChevron = true,
}: ListRowProps) {
  const { colors } = useAppTheme();
  const rounded = {
    borderTopLeftRadius: position === 'first' || position === 'single' ? radius.md : 0,
    borderTopRightRadius: position === 'first' || position === 'single' ? radius.md : 0,
    borderBottomLeftRadius: position === 'last' || position === 'single' ? radius.md : 0,
    borderBottomRightRadius: position === 'last' || position === 'single' ? radius.md : 0,
  };
  const separator = position === 'first' || position === 'middle';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={[title, subtitle, meta, favorite ? 'favorit' : null].filter(Boolean).join(', ')}
      style={({ pressed }) => [
        styles.row,
        rounded,
        { backgroundColor: pressed ? colors.surfaceAlt : colors.surface },
      ]}
    >
      {icon ? (
        <View style={[styles.iconBubble, { backgroundColor: colors.surfaceAlt }]}>
          <Icon name={icon} size={18} color="primary" />
        </View>
      ) : null}
      <View style={[styles.body, separator && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <View style={styles.text}>
          <AppText variant="bodyStrong">{title}</AppText>
          {subtitle ? (
            <AppText variant="callout" color="textSecondary" numberOfLines={2}>
              {subtitle}
            </AppText>
          ) : null}
          {meta ? (
            <AppText variant="caption" color="primary">
              {meta}
            </AppText>
          ) : null}
        </View>
        {favorite ? <Icon name="star" size={16} color="primary" /> : null}
        {accessory}
        {onPress && showChevron ? <Icon name="chevron-forward" size={18} color="textMuted" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    minHeight: minTouchTarget + 12,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
    alignSelf: 'stretch',
  },
  text: { flex: 1, gap: 2 },
});
