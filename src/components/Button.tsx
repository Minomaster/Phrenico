import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  accessibilityHint?: string;
  /** Takes the full width of its container. */
  block?: boolean;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, accessibilityHint, block }: ButtonProps) {
  const { colors } = useAppTheme();
  const textColor = variant === 'primary' ? 'onPrimary' : 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.base,
        block && styles.block,
        variant === 'primary' && { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
        variant === 'secondary' && {
          backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
          borderColor: colors.inputBorder,
          borderWidth: 1,
        },
        variant === 'ghost' && { backgroundColor: pressed ? colors.surfaceAlt : 'transparent' },
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={18} color={textColor} /> : null}
        <AppText variant="bodyStrong" color={textColor}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  disabled: { opacity: 0.45 },
});
