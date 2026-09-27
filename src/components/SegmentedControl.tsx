import { Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, radius, spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel }: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[styles.track, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }}
            style={[styles.segment, selected && { backgroundColor: colors.primary }]}
          >
            <AppText variant="caption" color={selected ? 'onPrimary' : 'primary'} style={styles.label} numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: radius.md, borderWidth: 1, padding: 3, gap: 3 },
  segment: {
    flex: 1,
    minHeight: minTouchTarget - 6,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  label: { fontWeight: '700' },
});
