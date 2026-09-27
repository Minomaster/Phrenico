import { Linking, StyleSheet, View } from 'react-native';

import type { Approval, Source } from '@/content/types';
import { formatDanishDate } from '@/formulas/format';
import { da } from '@/i18n/da';
import { spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { Notice } from './Notice';

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * The line under the title that shows who approved the page and when, so the
 * doctor can see at a glance that the content is verified.
 */
export function ApprovalLine({ approval }: { approval: Approval }) {
  const approved = approval.status === 'approved' && approval.approvedBy && approval.approvedAt;
  return (
    <View style={styles.line}>
      <Icon name={approved ? 'shield-checkmark' : 'alert-circle-outline'} size={16} color={approved ? 'primary' : 'warning'} />
      <AppText variant="caption" color={approved ? 'textSecondary' : 'warning'} style={styles.lineText}>
        {approved
          ? `${da.approval.approvedBy(approval.approvedBy!.name, approval.approvedBy!.title)} · ${formatDanishDate(approval.approvedAt!)}`
          : da.approval.demo}
      </AppText>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="caption" color="textSecondary" style={styles.detailLabel}>
        {label}
      </AppText>
      <AppText variant="callout" style={styles.detailValue} selectable>
        {value}
      </AppText>
    </View>
  );
}

function SourceItem({ source }: { source: Source }) {
  const details = [
    source.publisher,
    source.edition ? `${da.approval.edition}: ${source.edition}` : null,
    source.year ? String(source.year) : null,
    source.pages ? `${da.approval.pages} ${source.pages}` : null,
    source.accessed ? `${da.approval.accessed} ${formatDanishDate(source.accessed)}` : null,
  ].filter(Boolean);

  return (
    <View style={styles.source}>
      <Icon name="book-outline" size={16} color="primary" />
      <View style={styles.sourceText}>
        <AppText variant="bodyStrong">{source.title}</AppText>
        {details.length > 0 ? (
          <AppText variant="callout" color="textSecondary">
            {details.join(' · ')}
          </AppText>
        ) : null}
        {source.url ? (
          <AppText
            variant="callout"
            color="primary"
            accessibilityRole="link"
            onPress={() => void Linking.openURL(source.url!)}
            style={styles.link}
          >
            {source.url}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

/** The full "Kilde og godkendelse" section. */
export function ApprovalDetails({ approval, sources, version }: { approval: Approval; sources: Source[]; version: number }) {
  const { colors } = useAppTheme();
  const overdue = approval.reviewBy !== undefined && approval.reviewBy < todayIso();

  return (
    <View style={styles.details}>
      {overdue ? <Notice tone="warning">{da.approval.reviewOverdue(formatDanishDate(approval.reviewBy!))}</Notice> : null}
      <View style={[styles.table, { borderColor: colors.border }]}>
        <DetailRow
          label={da.approval.approver}
          value={approval.approvedBy ? `${approval.approvedBy.name}, ${approval.approvedBy.title}` : da.approval.notApproved}
        />
        {approval.approvedAt ? <DetailRow label={da.approval.approvedAt} value={formatDanishDate(approval.approvedAt)} /> : null}
        {approval.reviewBy ? <DetailRow label={da.approval.reviewBy} value={formatDanishDate(approval.reviewBy)} /> : null}
        <DetailRow label={da.approval.version} value={String(version)} />
        {approval.fingerprint ? <DetailRow label={da.approval.fingerprint} value={approval.fingerprint.slice(0, 12)} /> : null}
        {approval.note ? <DetailRow label="Note" value={approval.note} /> : null}
      </View>
      <AppText variant="overline" color="primary">
        {da.approval.sources}
      </AppText>
      <View style={styles.sources}>
        {sources.map((source, index) => (
          <SourceItem key={index} source={source} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  lineText: { flexShrink: 1 },
  details: { gap: spacing.md },
  table: { gap: spacing.sm },
  detailRow: { flexDirection: 'row', gap: spacing.md },
  detailLabel: { width: 118, paddingTop: 2 },
  detailValue: { flex: 1 },
  sources: { gap: spacing.md },
  source: { flexDirection: 'row', gap: spacing.sm },
  sourceText: { flex: 1, gap: 2 },
  link: { textDecorationLine: 'underline' },
});
