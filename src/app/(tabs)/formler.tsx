import { ContentList, Screen } from '@/components';
import { useContent } from '@/content/useContent';
import { da } from '@/i18n/da';

/** Formler: all approved formulas, A–Å. */
export default function FormulasScreen() {
  const { formulas } = useContent();
  return (
    <Screen safeTop scroll={false}>
      <ContentList
        kind="formula"
        title={da.tabs.formulas}
        items={formulas}
        emptyIcon="calculator-outline"
        emptyTitle={da.lists.formulasEmptyTitle}
        emptyText={da.lists.formulasEmptyText}
      />
    </Screen>
  );
}
