import { router } from 'expo-router';

import type { ContentKind } from '@/content/types';
import { da } from '@/i18n/da';
import { routes } from '@/navigation/routes';

import { Button } from './Button';

/** "Rapportér fejl på denne side": opens the feedback form with the page filled in. */
export function ReportButton({ kind, id }: { kind: ContentKind; id: string }) {
  return (
    <Button
      variant="secondary"
      icon="flag-outline"
      label={da.report.button}
      onPress={() => router.push(routes.reportError(kind, id))}
      block
    />
  );
}
