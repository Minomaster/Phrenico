import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, ListRow, Screen, ScreenTitle, SectionHeader, SegmentedControl } from '@/components';
import { APP_NAME, APP_VERSION } from '@/config/app';
import { useContent } from '@/content/useContent';
import { da } from '@/i18n/da';
import { routes } from '@/navigation/routes';
import { usePreferences, type ThemePreference } from '@/state/preferences';
import { spacing } from '@/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: da.more.themes.system },
  { value: 'light', label: da.more.themes.light },
  { value: 'dark', label: da.more.themes.dark },
];

/** Mere: feedback, theme, disclaimer and information about the app. */
export default function MoreScreen() {
  const { bundle } = useContent();
  const theme = usePreferences((state) => state.theme);
  const setTheme = usePreferences((state) => state.setTheme);

  return (
    <Screen safeTop>
      <ScreenTitle>{da.tabs.more}</ScreenTitle>

      <View>
        <ListRow
          title={da.more.feedback}
          subtitle={da.feedback.intro}
          icon="chatbubble-ellipses-outline"
          position="single"
          onPress={() => router.push(routes.feedback)}
        />
      </View>

      <View style={styles.group}>
        <SectionHeader title={da.more.theme} />
        <SegmentedControl options={THEME_OPTIONS} value={theme} onChange={setTheme} accessibilityLabel={da.more.theme} />
      </View>

      <View>
        <ListRow
          title={da.more.disclaimer}
          icon="shield-checkmark-outline"
          position="first"
          onPress={() => router.push(routes.disclaimer)}
        />
        <ListRow title={da.more.about} icon="information-circle-outline" position="last" onPress={() => router.push(routes.about)} />
      </View>

      <AppText variant="caption" color="textMuted" style={styles.footer}>
        {`${APP_NAME} ${APP_VERSION} · ${da.about.contentVersion.toLowerCase()} ${bundle.contentVersion}`}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  footer: { textAlign: 'center' },
});
