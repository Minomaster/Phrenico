/**
 * Builds the feedback e-mail. The app opens the phone's mail app with the
 * e-mail filled in, so nothing is sent without the user pressing send, and
 * no server is needed.
 */
import type { ContentKind } from '../content/types';
import { da } from '../i18n/da';

export type FeedbackType = keyof typeof da.feedback.types;

export const FEEDBACK_TYPES = Object.keys(da.feedback.types) as FeedbackType[];

export interface FeedbackContext {
  kind: ContentKind;
  id: string;
  title: string;
  version: number;
}

export interface FeedbackEnvironment {
  appName: string;
  appVersion: string;
  contentVersion: string;
  contentKind: 'approved' | 'demo';
  platform: string;
}

export interface FeedbackEmail {
  to: string;
  subject: string;
  body: string;
  url: string;
}

/**
 * Danish CPR numbers (DDMMÅÅ-XXXX, with or without hyphen or space). Used to
 * stop users from accidentally sending patient data in feedback.
 */
const CPR_PATTERN = /(?<!\d)(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])\d{2}[-\s]?\d{4}(?!\d)/;

export function containsCprNumber(text: string): boolean {
  return CPR_PATTERN.test(text);
}

export function composeFeedbackEmail(input: {
  to: string;
  type: FeedbackType;
  message: string;
  context?: FeedbackContext;
  environment: FeedbackEnvironment;
}): FeedbackEmail {
  const { to, type, message, context, environment } = input;
  const kindLabel = context?.kind === 'formula' ? 'Formel' : 'Sygdom';
  const typeLabel = da.feedback.types[type];

  const subject = [da.feedback.subjectPrefix, typeLabel, context ? `${kindLabel}: ${context.title}` : null]
    .filter(Boolean)
    .join(' – ');

  const technical = [
    `App: ${environment.appName} ${environment.appVersion}`,
    `Indhold: ${environment.contentVersion}${environment.contentKind === 'demo' ? ' (DEMO)' : ''}`,
    context ? `Side: ${kindLabel.toLowerCase()} "${context.id}", version ${context.version}` : null,
    `Platform: ${environment.platform}`,
  ].filter(Boolean);

  const body = [message.trim(), '', '—', `${da.feedback.technicalInfo}:`, ...technical].join('\n');
  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { to, subject, body, url };
}
