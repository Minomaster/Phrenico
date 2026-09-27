import { useEffect } from 'react';

import { useRecent } from '@/state/recent';

import type { ContentKind } from './types';

/** Adds the page to "Senest brugt" on the search screen. */
export function useRecordVisit(kind: ContentKind, id: string | undefined) {
  const record = useRecent((state) => state.record);
  useEffect(() => {
    if (id) record({ kind, id });
  }, [kind, id, record]);
}
