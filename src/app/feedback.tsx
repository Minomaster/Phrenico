import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, ListRow, Notice, Screen, SectionHeader } from '@/components';
import { APP_NAME, APP_VERSION, FEEDBACK_EMAIL } from '@/config/app';
import type { ContentKind } from '@/content/types';
import { useContent } from '@/content/useContent';
import {
  composeFeedbackEmail,
  containsCprNumber,
  FEEDBACK_TYPES,
  type FeedbackContext,
  type FeedbackType,
} from '@/feedback/composeFeedback';
import { da } from '@/i18n/da';
import { minTouchTarget, noWebOutline, radius, spacing, typography, useAppTheme } from '@/theme';

/**
 * Feedback to the developer: a short form that opens the phone's mail app
 * with everything filled in. "Rapportér fejl" on a page opens this form with
 * the page attached (id and version), so errors can be traced precisely.
 */
export default function FeedbackScreen() {
  const { colors } = useAppTheme();
  const content = useContent();
  const params = useLocalSearchParams<{ type?: string; kind?: string; id?: string }>();

  const context = useMemo<FeedbackContext | undefined>(() => {
    const kind = params.kind === 'formula' || params.kind === 'disease' ? (params.kind as ContentKind) : undefined;
    if (!kind || !params.id) return undefined;
    const item = kind === 'formula' ? content.getFormula(params.id) : content.getDisease(params.id);
    return item ? { kind, id: item.id, title: item.title, version: item.version } : undefined;
  }, [content, params.kind, params.id]);

  const initialType = FEEDBACK_TYPES.includes(params.type as FeedbackType) ? (params.type as FeedbackType) : undefined;
  const [type, setType] = useState<FeedbackType | undefined>(initialType);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'no-mail-app' | 'copied'>('idle');

  const hasCpr = containsCprNumber(message);
  const canSend = Boolean(FEEDBACK_EMAIL && type && message.trim().length > 0 && !hasCpr);

  const email = type
    ? composeFeedbackEmail({
        to: FEEDBACK_EMAIL,
        type,
        message,
        context,
        environment: {
          appName: APP_NAME,
          appVersion: APP_VERSION,
          contentVersion: content.bundle.contentVersion,
          contentKind: content.bundle.kind,
          platform: `${Platform.OS} ${String(Platform.Version)}`,
        },
      })
    : null;

  const send = async () => {
    if (!email || !canSend) return;
    try {
      if (await Linking.canOpenURL(email.url)) {
        await Linking.openURL(email.url);
        return;
      }
    } catch {
      // Falls through to the copy option below.
    }
    setStatus('no-mail-app');
  };

  const copy = async () => {
    if (!email) return;
    await Clipboard.setStringAsync(`${email.to}\n\n${email.subject}\n\n${email.body}`);
    setStatus('copied');
  };

  return (
    <Screen>
      <AppText color="textSecondary">{da.feedback.intro}</AppText>
      <Notice tone="warning">{da.feedback.privacy}</Notice>
      {!FEEDBACK_EMAIL ? <Notice tone="danger">{da.feedback.missingAddress}</Notice> : null}

      <View style={styles.group}>
        <SectionHeader title={da.feedback.type} />
        <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={da.feedback.type}>
          {FEEDBACK_TYPES.map((option) => {
            const selected = option === type;
            return (
              <Pressable
                key={option}
                onPress={() => setType(option)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={da.feedback.types[option]}
                style={[
                  styles.chip,
                  { borderColor: selected ? colors.primary : colors.inputBorder, backgroundColor: selected ? colors.primary : colors.background },
                ]}
              >
                <AppText variant="callout" color={selected ? 'onPrimary' : 'primary'} style={styles.chipText}>
                  {da.feedback.types[option]}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {context ? (
        <View style={styles.group}>
          <SectionHeader title={da.feedback.about} />
          <ListRow
            title={context.title}
            subtitle={`${context.kind === 'formula' ? 'Formel' : 'Sygdom'} · ${da.approval.version.toLowerCase()} ${context.version}`}
            icon={context.kind === 'formula' ? 'calculator-outline' : 'medkit-outline'}
          />
        </View>
      ) : null}

      <View style={styles.group}>
        <SectionHeader title={da.feedback.message} />
        <TextInput
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            setStatus('idle');
          }}
          placeholder={da.feedback.messagePlaceholder}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          accessibilityLabel={da.feedback.message}
          style={[
            styles.message,
            noWebOutline,
            { color: colors.text, borderColor: hasCpr ? colors.danger : colors.inputBorder, backgroundColor: colors.background },
            hasCpr && styles.messageError,
          ]}
        />
        {hasCpr ? <Notice tone="danger">{da.feedback.cprDetected}</Notice> : null}
      </View>

      <Button label={da.feedback.send} icon="mail-outline" onPress={() => void send()} disabled={!canSend} block />

      {status !== 'idle' ? (
        <View style={styles.group}>
          {status === 'no-mail-app' ? <Notice tone="warning">{da.feedback.noMailApp}</Notice> : null}
          <Button
            variant="secondary"
            icon="copy-outline"
            label={status === 'copied' ? da.feedback.copied : da.feedback.copy}
            onPress={() => void copy()}
            block
          />
        </View>
      ) : null}

      {email ? (
        <View style={styles.group}>
          <SectionHeader title={da.feedback.technicalInfo} />
          <AppText variant="caption" color="textMuted" selectable>
            {email.body.split('\n').slice(-(context ? 4 : 3)).join('\n')}
          </AppText>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: minTouchTarget - 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  chipText: { fontWeight: '600' },
  message: {
    ...typography.body,
    minHeight: 140,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  messageError: { borderWidth: 2, padding: spacing.md - 1 },
});
