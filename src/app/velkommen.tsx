import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Checkbox, Screen } from '@/components';
import { AppLogo } from '@/components/AppLogo';
import { DisclaimerText } from '@/components/DisclaimerText';
import { APP_NAME } from '@/config/app';
import { DISCLAIMER_VERSION } from '@/config/disclaimer';
import { da } from '@/i18n/da';
import { usePreferences } from '@/state/preferences';
import { radius, spacing, useAppTheme } from '@/theme';

/**
 * Shown the first time the app is opened, and again whenever the disclaimer
 * text changes (DISCLAIMER_VERSION). The rest of the app is locked until the
 * user has accepted it.
 */
export default function WelcomeScreen() {
  const { colors } = useAppTheme();
  const [checked, setChecked] = useState(false);
  const acceptDisclaimer = usePreferences((state) => state.acceptDisclaimer);

  return (
    <Screen safeTop contentContainerStyle={styles.content}>
      <View style={styles.brand}>
        <AppLogo />
        <AppText variant="overline" color="primary">
          {APP_NAME}
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          {da.disclaimer.title}
        </AppText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <DisclaimerText />
      </View>

      <Checkbox checked={checked} onChange={setChecked} label={da.disclaimer.confirm} />
      <Button
        label={da.disclaimer.accept}
        icon="checkmark-circle"
        disabled={!checked}
        onPress={() => acceptDisclaimer(DISCLAIMER_VERSION)}
        block
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl, gap: spacing.xl },
  brand: { gap: spacing.sm },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, padding: spacing.lg },
});
