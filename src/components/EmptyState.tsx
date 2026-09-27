import { StyleSheet, View } from 'react-native';

import { spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  text: string;
}

export function EmptyState({ icon, title, text }: EmptyStateProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.bubble, { backgroundColor: colors.surfaceAlt }]}>
        <Icon name={icon} size={30} color="primary" />
      </View>
      <AppText variant="heading" style={styles.center} accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="callout" color="textSecondary" style={styles.center}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  bubble: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  center: { textAlign: 'center' },
});
