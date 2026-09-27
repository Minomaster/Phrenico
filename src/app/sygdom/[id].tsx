import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  AppText,
  ApprovalDetails,
  ApprovalLine,
  ContentBlocks,
  FavoriteButton,
  JumpChips,
  ListRow,
  ReportButton,
  rowPosition,
  Screen,
} from '@/components';
import { NotFound } from '@/components/NotFound';
import type { Disease } from '@/content/types';
import { useContent } from '@/content/useContent';
import { useRecordVisit } from '@/content/useRecordVisit';
import { da } from '@/i18n/da';
import { routes } from '@/navigation/routes';
import { spacing, useAppTheme } from '@/theme';

type SectionKey = 'causes' | 'symptoms' | 'treatment' | 'formulas' | 'approval';

/**
 * The disease page, "én lang side": shortcut buttons at the top jump to
 * Årsager, Symptomer, Behandling and the related formulas further down.
 */
export default function DiseaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const content = useContent();
  const disease = content.getDisease(id);
  useRecordVisit('disease', disease?.id);

  if (!disease) return <NotFound text={da.disease.notFound} />;
  return <DiseasePage key={disease.id} disease={disease} />;
}

function DiseasePage({ disease }: { disease: Disease }) {
  const content = useContent();
  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<Partial<Record<SectionKey, number>>>({});
  const related = content.resolve(disease.relatedFormulas.map((formulaId) => ({ kind: 'formula' as const, id: formulaId })));

  const chips: { key: SectionKey; label: string }[] = [
    { key: 'causes', label: da.fields.causes },
    { key: 'symptoms', label: da.fields.symptoms },
    { key: 'treatment', label: da.fields.treatment },
    ...(related.length > 0 ? [{ key: 'formulas' as const, label: da.disease.formulasShort }] : []),
  ];

  const jumpTo = (key: string) => {
    const y = positions.current[key as SectionKey];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - spacing.sm), animated: true });
  };

  const setPosition = useCallback((key: SectionKey, y: number) => {
    positions.current[key] = y;
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <FavoriteButton contentRef={{ kind: 'disease', id: disease.id }} /> }} />
      <Screen scrollRef={scrollRef}>
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header">
            {disease.title}
          </AppText>
          <AppText color="textSecondary">{disease.summary}</AppText>
          <ApprovalLine approval={disease.approval} />
        </View>

        <JumpChips chips={chips} onPress={jumpTo} accessibilityLabel={da.disease.jumpTo} />

        <Section title={da.fields.causes} sectionKey="causes" onPosition={setPosition}>
          <ContentBlocks blocks={disease.causes} />
        </Section>
        <Section title={da.fields.symptoms} sectionKey="symptoms" onPosition={setPosition}>
          <ContentBlocks blocks={disease.symptoms} />
        </Section>
        <Section title={da.fields.treatment} sectionKey="treatment" onPosition={setPosition}>
          <ContentBlocks blocks={disease.treatment} />
        </Section>

        {related.length > 0 ? (
          <Section title={da.disease.relatedFormulas} sectionKey="formulas" onPosition={setPosition}>
            <View>
              {related.map(({ item }, index) => (
                <ListRow
                  key={item.id}
                  title={item.title}
                  subtitle={item.summary}
                  icon="calculator-outline"
                  position={rowPosition(index, related.length)}
                  onPress={() => router.push(routes.formula(item.id))}
                />
              ))}
            </View>
          </Section>
        ) : null}

        <Section title={da.approval.section} sectionKey="approval" onPosition={setPosition}>
          <ApprovalDetails approval={disease.approval} sources={disease.sources} version={disease.version} />
        </Section>

        <ReportButton kind="disease" id={disease.id} />
      </Screen>
    </>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
  sectionKey: SectionKey;
  onPosition: (key: SectionKey, y: number) => void;
}

function Section({ title, children, sectionKey, onPosition }: SectionProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[styles.section, { borderTopColor: colors.border }]}
      onLayout={(event) => onPosition(sectionKey, event.nativeEvent.layout.y)}
    >
      <AppText variant="heading" color="primary" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.sm },
  section: { gap: spacing.md, paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
