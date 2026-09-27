import { StyleSheet, View } from 'react-native';

import { spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';

interface SectionHeaderProps {
  title: string;
  /** e.g. the number of results. */
  count?: number;
  /** Letter headers in A–Å lists get the page background, so they can stick to the top. */
  sticky?: boolean;
}

export function SectionHeader({ title, count, sticky }: SectionHeaderProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.header, sticky && { backgroundColor: colors.background }]} accessibilityRole="header">
      <AppText variant="overline" color="primary">
        {count === undefined ? title : `${title} (${count})`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.lg, paddingBottom: spacing.sm, paddingHorizontal: spacing.xs },
});
