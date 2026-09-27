import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import type { NumberInput } from '@/content/types';
import { formatDecimal } from '@/formulas/format';
import { da } from '@/i18n/da';
import { noWebOutline, radius, spacing, typography, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface NumberFieldProps {
  input: NumberInput;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

/**
 * A number field: label on the left, the field with its unit on the right, and
 * the allowed range (or the error) below. The value is never changed for the
 * user: invalid text stays as typed and is explained, not "fixed".
 */
export function NumberField({ input, value, onChangeText, error }: NumberFieldProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const range = da.formula.allowedRange(formatDecimal(input.min), formatDecimal(input.max), input.unit);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.inputBorder;
  const thick = Boolean(error) || focused;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppText variant="bodyStrong" style={styles.label} nativeID={`label-${input.id}`}>
          {input.label}
        </AppText>
        <View
          style={[
            styles.field,
            { borderColor, backgroundColor: colors.background },
            thick ? styles.thick : styles.thin,
          ]}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="decimal-pad"
            inputMode="decimal"
            autoCorrect={false}
            placeholder="–"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={`${input.label}, ${input.unit}`}
            accessibilityHint={range}
            aria-labelledby={`label-${input.id}`}
            style={[styles.input, noWebOutline, { color: colors.text }]}
          />
          <AppText variant="callout" color="textSecondary" style={styles.unit}>
            {input.unit}
          </AppText>
        </View>
      </View>
      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <Icon name="alert-circle" size={16} color="danger" />
          <AppText variant="caption" color="danger" style={styles.messageText}>
            {error}
          </AppText>
        </View>
      ) : (
        <AppText variant="caption" color="textMuted">
          {input.hint ? `${range} · ${input.hint}` : range}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { flex: 1 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 168,
    minHeight: 48,
    borderRadius: radius.sm,
  },
  thin: { borderWidth: 1, paddingHorizontal: spacing.md },
  thick: { borderWidth: 2, paddingHorizontal: spacing.md - 1 },
  // minWidth: 0 lets the field shrink inside the row (otherwise it overflows on web).
  input: {
    flex: 1,
    minWidth: 0,
    ...typography.heading,
    fontVariant: ['tabular-nums'],
    paddingVertical: spacing.sm,
    textAlign: 'right',
  },
  unit: { marginLeft: spacing.sm, flexShrink: 0 },
  message: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  messageText: { flex: 1 },
});
