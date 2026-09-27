import { activeContent } from './active';
import type { ContentRepository } from './repository';

/**
 * The loaded content. The root layout only renders screens when the content
 * loaded correctly, so screens can rely on it being there.
 */
export function useContent(): ContentRepository {
  if (!activeContent.ok) {
    throw new Error('Content is not available');
  }
  return activeContent.repository;
}
