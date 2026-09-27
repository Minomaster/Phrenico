import { Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, radius, spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';

interface JumpChipsProps {
  chips: { key: string; label: string }[];
  onPress: (key: string) => void;
  accessibilityLabel: string;
}

/** The shortcut buttons at the top of a disease page that jump to a section. They wrap, so all are visible. */
export function JumpChips({ chips, onPress, accessibilityLabel }: JumpChipsProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row} accessibilityLabel={accessibilityLabel}>
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          onPress={() => onPress(chip.key)}
          accessibilityRole="button"
          accessibilityLabel={`${accessibilityLabel}: ${chip.label}`}
          style={({ pressed }) => [
            styles.chip,
            { backgroundColor: pressed ? colors.surfaceAlt : colors.surface, borderColor: colors.resultBorder },
          ]}
        >
          <AppText variant="caption" color="primary" style={styles.label}>
            {chip.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: minTouchTarget - 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  label: { fontWeight: '700' },
});
