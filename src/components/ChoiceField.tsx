import { Pressable, StyleSheet, View } from 'react-native';

import type { ChoiceInput } from '@/content/types';
import { minTouchTarget, radius, spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface ChoiceFieldProps {
  input: ChoiceInput;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
}

/** A choice field: one option must be chosen. Nothing is chosen in advance. */
export function ChoiceField({ input, value, onChange, error }: ChoiceFieldProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container} accessibilityRole="radiogroup" accessibilityLabel={input.label}>
      <AppText variant="bodyStrong">{input.label}</AppText>
      <View style={[styles.group, { borderColor: error ? colors.danger : colors.inputBorder, borderWidth: error ? 2 : 1 }]}>
        {input.options.map((option, index) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: selected }}
              style={({ pressed }) => [
                styles.option,
                index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                { backgroundColor: selected ? colors.surfaceAlt : pressed ? colors.surface : colors.background },
              ]}
            >
              <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? 'primary' : 'textMuted'} />
              <AppText variant={selected ? 'bodyStrong' : 'body'} style={styles.optionLabel}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <Icon name="alert-circle" size={16} color="danger" />
          <AppText variant="caption" color="danger">
            {error}
          </AppText>
        </View>
      ) : input.hint ? (
        <AppText variant="caption" color="textMuted">
          {input.hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  group: { borderRadius: radius.sm, overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: minTouchTarget + 4, paddingHorizontal: spacing.md },
  optionLabel: { flex: 1 },
  message: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
