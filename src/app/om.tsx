import { StyleSheet, View } from 'react-native';

import { AppText, ListRow, Notice, Screen, SectionHeader } from '@/components';
import { AppLogo } from '@/components/AppLogo';
import { APP_NAME, APP_VERSION } from '@/config/app';
import { IS_DEMO } from '@/content/active';
import { useContent } from '@/content/useContent';
import { formatDanishDate } from '@/formulas/format';
import { da } from '@/i18n/da';
import { spacing } from '@/theme';

/** Om Phrenico: versions and how content gets into the app. */
export default function AboutScreen() {
  const { bundle } = useContent();
  const rows: [string, string][] = [
    [da.about.appVersion, APP_VERSION],
    [da.about.contentVersion, IS_DEMO ? `${bundle.contentVersion} (demo)` : bundle.contentVersion],
    [da.about.latestApproval, bundle.latestApproval ? formatDanishDate(bundle.latestApproval) : da.about.none],
    [da.about.formulas, String(IS_DEMO ? 0 : bundle.formulas.length)],
    [da.about.diseases, String(IS_DEMO ? 0 : bundle.diseases.length)],
  ];

  return (
    <Screen>
      <View style={styles.brand}>
        <AppLogo size={56} />
        <AppText variant="title">{APP_NAME}</AppText>
      </View>

      <View>
        {rows.map(([label, value], index) => (
          <ListRow
            key={label}
            title={label}
            position={index === 0 ? 'first' : index === rows.length - 1 ? 'last' : 'middle'}
            accessory={
              <AppText variant="callout" color="textSecondary" selectable>
                {value}
              </AppText>
            }
          />
        ))}
      </View>

      <View style={styles.group}>
        <SectionHeader title={da.about.howTitle} />
        <Notice tone="info">{da.about.how}</Notice>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.lg },
  group: { gap: spacing.xs },
});
