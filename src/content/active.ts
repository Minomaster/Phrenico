/**
 * Chooses and loads the content the app shows.
 *
 * A release build ALWAYS shows the approved content (src/content/generated/
 * approved.json, built from content/). The placeholder demo content is only
 * available in a development build started with `npm run demo`, because
 * `__DEV__` is false in every release build.
 *
 * The bundle is validated again at startup. If it fails, the app shows an
 * error screen and no content at all, rather than partial content.
 */
import { implementationsFor } from '../formulas/registry';

import approvedBundle from './generated/approved.json';
import { createRepository, type ContentRepository } from './repository';
import { bundleSchema } from './schema';

export const IS_DEMO: boolean = __DEV__ && process.env.EXPO_PUBLIC_CONTENT_MODE === 'demo';

export type LoadedContent = { ok: true; repository: ContentRepository } | { ok: false; error: string };

export function loadContent(raw: unknown, expectedKind: 'approved' | 'demo'): LoadedContent {
  const parsed = bundleSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n') };
  }
  if (parsed.data.kind !== expectedKind) {
    return { ok: false, error: `Expected ${expectedKind} content, got ${parsed.data.kind}` };
  }
  return { ok: true, repository: createRepository(parsed.data, implementationsFor(expectedKind)) };
}

// `__DEV__` is written out in this expression (instead of using IS_DEMO) so the
// release build removes the require, and the demo file is not even included.
const demoBundle: unknown =
  __DEV__ && process.env.EXPO_PUBLIC_CONTENT_MODE === 'demo' ? require('./generated/demo.json') : undefined;

export const activeContent: LoadedContent = IS_DEMO
  ? loadContent(demoBundle, 'demo')
  : loadContent(approvedBundle, 'approved');
