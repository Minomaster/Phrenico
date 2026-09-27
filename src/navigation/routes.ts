import type { Href } from 'expo-router';

import type { ContentKind } from '@/content/types';

/** All links in the app are built here, so a renamed screen only needs changing in one place. */
export const routes = {
  search: '/' as Href,
  formula: (id: string): Href => ({ pathname: '/formel/[id]', params: { id } }),
  disease: (id: string): Href => ({ pathname: '/sygdom/[id]', params: { id } }),
  item: (kind: ContentKind, id: string): Href => (kind === 'formula' ? routes.formula(id) : routes.disease(id)),
  feedback: '/feedback' as Href,
  reportError: (kind: ContentKind, id: string): Href => ({ pathname: '/feedback', params: { type: 'content-error', kind, id } }),
  disclaimer: '/ansvarsfraskrivelse' as Href,
  about: '/om' as Href,
};
