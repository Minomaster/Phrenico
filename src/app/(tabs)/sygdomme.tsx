import { ContentList, Screen } from '@/components';
import { useContent } from '@/content/useContent';
import { da } from '@/i18n/da';

/** Sygdomme: all approved disease pages, A–Å. */
export default function DiseasesScreen() {
  const { diseases } = useContent();
  return (
    <Screen safeTop scroll={false}>
      <ContentList
        kind="disease"
        title={da.tabs.diseases}
        items={diseases}
        emptyIcon="medkit-outline"
        emptyTitle={da.lists.diseasesEmptyTitle}
        emptyText={da.lists.diseasesEmptyText}
      />
    </Screen>
  );
}
