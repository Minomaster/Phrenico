import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';

import {
  AppText,
  ApprovalDetails,
  ApprovalLine,
  Button,
  ChoiceField,
  Collapsible,
  ContentBlocks,
  FavoriteButton,
  ListRow,
  NumberField,
  ReportButton,
  ResultCard,
  rowPosition,
  Screen,
  SectionHeader,
} from '@/components';
import { NotFound } from '@/components/NotFound';
import type { Formula } from '@/content/types';
import { useContent } from '@/content/useContent';
import { useRecordVisit } from '@/content/useRecordVisit';
import type { FormulaImplementation } from '@/formulas/types';
import { useFormulaCalculator } from '@/formulas/useFormulaCalculator';
import { da } from '@/i18n/da';
import { routes } from '@/navigation/routes';
import { spacing } from '@/theme';

/**
 * The formula page, "alt på én side": fields at the top, the Beregn button,
 * the result box, then fold-out Dokumentation, Eksempel på brug and
 * Kilde og godkendelse.
 */
export default function FormulaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const content = useContent();
  const formula = content.getFormula(id);
  useRecordVisit('formula', formula?.id);

  if (!formula) return <NotFound text={da.formula.notFound} />;
  return <FormulaPage key={formula.id} formula={formula} implementation={content.implementations[formula.id]} />;
}

function FormulaPage({ formula, implementation }: { formula: Formula; implementation: FormulaImplementation | undefined }) {
  const content = useContent();
  const scrollRef = useRef<ScrollView>(null);
  const resultY = useRef(0);
  const { raw, errors, result, cleared, update, calculate, reset } = useFormulaCalculator(formula, implementation);

  const onCalculate = () => {
    Keyboard.dismiss();
    if (calculate()) {
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, resultY.current - spacing.xl), animated: true }));
    }
  };

  const related = content.resolve(formula.relatedDiseases.map((diseaseId) => ({ kind: 'disease' as const, id: diseaseId })));

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <FavoriteButton contentRef={{ kind: 'formula', id: formula.id }} /> }} />
      <Screen scrollRef={scrollRef}>
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header">
            {formula.title}
          </AppText>
          <AppText color="textSecondary">{formula.summary}</AppText>
          <ApprovalLine approval={formula.approval} />
        </View>

        <View style={styles.fields}>
          {formula.inputs.map((input) =>
            input.kind === 'number' ? (
              <NumberField
                key={input.id}
                input={input}
                value={raw[input.id] ?? ''}
                onChangeText={(text) => update(input.id, text)}
                error={errors[input.id]}
              />
            ) : (
              <ChoiceField
                key={input.id}
                input={input}
                value={raw[input.id]}
                onChange={(value) => update(input.id, value)}
                error={errors[input.id]}
              />
            ),
          )}
        </View>

        <View style={styles.actions}>
          <View style={styles.primaryAction}>
            <Button label={da.formula.calculate} icon="calculator-outline" onPress={onCalculate} block />
          </View>
          <Button label={da.formula.reset} icon="refresh" variant="ghost" onPress={reset} />
        </View>

        <View onLayout={(event) => (resultY.current = event.nativeEvent.layout.y)}>
          <ResultCard outputs={formula.outputs} result={result} cleared={cleared} />
        </View>

        <View style={styles.sections}>
          <Collapsible title={da.fields.documentation}>
            <ContentBlocks blocks={formula.documentation} />
          </Collapsible>
          <Collapsible title={da.fields.example}>
            <ContentBlocks blocks={formula.example} />
          </Collapsible>
          <Collapsible title={da.approval.section}>
            <ApprovalDetails approval={formula.approval} sources={formula.sources} version={formula.version} />
          </Collapsible>
        </View>

        {related.length > 0 ? (
          <View>
            <SectionHeader title={da.formula.relatedDiseases} />
            {related.map(({ item }, index) => (
              <ListRow
                key={item.id}
                title={item.title}
                subtitle={item.summary}
                position={rowPosition(index, related.length)}
                onPress={() => router.push(routes.disease(item.id))}
              />
            ))}
          </View>
        ) : null}

        <ReportButton kind="formula" id={formula.id} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.sm },
  fields: { gap: spacing.lg },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primaryAction: { flex: 1 },
  sections: { gap: spacing.sm },
});
