import Constants from 'expo-constants';

/** Values come from app.json, so they are changed in one place. */
const config = Constants.expoConfig;

export const APP_NAME = config?.name ?? 'Phrenico';
export const APP_VERSION = config?.version ?? '0.0.0';

/**
 * The address feedback is sent to. Set it in app.json under
 * `expo.extra.feedbackEmail`. While it is empty, the feedback form explains
 * that it has not been set up yet.
 */
export const FEEDBACK_EMAIL: string =
  typeof config?.extra?.feedbackEmail === 'string' ? config.extra.feedbackEmail.trim() : '';
