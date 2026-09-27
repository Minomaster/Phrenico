import { StyleSheet, View } from 'react-native';

import type { FormulaOutput } from '@/content/types';
import type { CalculationResult } from '@/formulas/engine';
import { da } from '@/i18n/da';
import { radius, spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { Notice } from './Notice';

interface ResultCardProps {
  outputs: FormulaOutput[];
  /** null until the user presses Beregn, and again as soon as a field changes. */
  result: CalculationResult | null;
  /** True when a result was removed because a field was changed. */
  cleared?: boolean;
}

/**
 * The result box. It shows the rounded result, exactly which values it was
 * calculated from, and the calculation steps, so the doctor can check it.
 */
export function ResultCard({ outputs, result, cleared }: ResultCardProps) {
  const { colors } = useAppTheme();

  if (result && !result.ok) {
    return (
      <Notice tone="danger" title={da.formula.result}>
        {result.error}
      </Notice>
    );
  }

  return (
    <View
      style={[styles.card, { backgroundColor: colors.resultSurface, borderColor: colors.resultBorder }]}
      accessibilityLiveRegion="polite"
    >
      {result?.ok ? (
        <>
          {result.outputs.map((output) => (
            <View key={output.id} style={styles.output} accessible accessibilityLabel={`${output.label}: ${output.display} ${output.unit}`}>
              <AppText variant="overline" color="primary">
                {output.label}
              </AppText>
              <View style={styles.valueRow}>
                <AppText variant="result" color="resultText" selectable>
                  {output.display}
                </AppText>
                <AppText variant="heading" color="resultText">
                  {output.unit}
                </AppText>
              </View>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.resultBorder }]} />

          <View style={styles.block}>
            <AppText variant="caption" color="textSecondary">
              {da.formula.basedOn}
            </AppText>
            {result.usedInputs.map((input) => (
              <View key={input.id} style={styles.usedRow}>
                <AppText variant="callout" color="textSecondary" style={styles.usedLabel}>
                  {input.label}
                </AppText>
                <AppText variant="callout" style={styles.usedValue}>
                  {input.display}
                </AppText>
              </View>
            ))}
          </View>

          {result.steps.length > 0 ? (
            <View style={styles.block}>
              <AppText variant="caption" color="textSecondary">
                {da.formula.calculation}
              </AppText>
              {result.steps.map((step, index) => (
                <AppText key={index} variant="callout" style={styles.step}>
                  {step}
                </AppText>
              ))}
            </View>
          ) : null}

          <View style={[styles.responsibility, { borderTopColor: colors.resultBorder }]}>
            <Icon name="information-circle-outline" size={16} color="textSecondary" />
            <AppText variant="caption" color="textSecondary" style={styles.responsibilityText}>
              {da.formula.responsibility}
            </AppText>
          </View>
        </>
      ) : (
        <>
          {outputs.map((output) => (
            <View key={output.id} style={styles.placeholderRow}>
              <AppText variant="bodyStrong" color="textSecondary">
                {output.label}
              </AppText>
              <AppText variant="heading" color="textMuted">
                — {output.unit}
              </AppText>
            </View>
          ))}
          <AppText variant="caption" color={cleared ? 'warning' : 'textMuted'}>
            {cleared ? da.formula.resultCleared : da.formula.fillAndCalculate}
          </AppText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, padding: spacing.lg, gap: spacing.md },
  output: { gap: spacing.xxs },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexWrap: 'wrap' },
  divider: { height: StyleSheet.hairlineWidth },
  block: { gap: spacing.xs },
  usedRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  usedLabel: { flex: 1 },
  usedValue: { fontVariant: ['tabular-nums'], fontWeight: '600' },
  step: { fontVariant: ['tabular-nums'] },
  responsibility: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  responsibilityText: { flex: 1 },
  placeholderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
