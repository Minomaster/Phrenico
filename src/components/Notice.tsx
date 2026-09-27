import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useAppTheme, type ThemeColors } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type NoticeTone = 'info' | 'warning' | 'danger';

const TONES: Record<NoticeTone, { icon: IconName; color: keyof ThemeColors; surface: keyof ThemeColors }> = {
  info: { icon: 'information-circle-outline', color: 'primary', surface: 'surfaceAlt' },
  warning: { icon: 'warning-outline', color: 'warning', surface: 'warningSurface' },
  danger: { icon: 'alert-circle-outline', color: 'danger', surface: 'dangerSurface' },
};

interface NoticeProps {
  tone?: NoticeTone;
  children: ReactNode;
  title?: string;
}

/** A highlighted box for information, warnings and errors. */
export function Notice({ tone = 'info', children, title }: NoticeProps) {
  const { colors } = useAppTheme();
  const { icon, color, surface } = TONES[tone];
  return (
    <View
      style={[styles.box, { backgroundColor: colors[surface], borderLeftColor: colors[color] }]}
      accessibilityRole={tone === 'info' ? undefined : 'alert'}
    >
      <Icon name={icon} size={20} color={color} />
      <View style={styles.text}>
        {title ? (
          <AppText variant="bodyStrong" color={tone === 'info' ? 'text' : color}>
            {title}
          </AppText>
        ) : null}
        {typeof children === 'string' ? (
          <AppText variant="callout" color={tone === 'info' ? 'textSecondary' : color}>
            {children}
          </AppText>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderLeftWidth: 4,
  },
  text: { flex: 1, gap: spacing.xxs },
});
