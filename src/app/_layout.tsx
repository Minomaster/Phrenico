import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme as NavigationTheme } from 'expo-router';
import { getFocusedRouteNameFromRoute } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText, Icon } from '@/components';
import { activeContent } from '@/content/active';
import { DISCLAIMER_VERSION } from '@/config/disclaimer';
import { da } from '@/i18n/da';
import { useStoresHydrated } from '@/state/hydration';
import { usePreferences } from '@/state/preferences';
import { AppThemeProvider, spacing, useAppTheme } from '@/theme';

const TAB_TITLES: Record<string, string> = {
  index: da.tabs.search,
  formler: da.tabs.formulas,
  sygdomme: da.tabs.diseases,
  favoritter: da.tabs.favorites,
  mere: da.tabs.more,
};

export default function RootLayout() {
  const hydrated = useStoresHydrated();
  return (
    <SafeAreaProvider>
      <AppThemeProvider>{hydrated ? <RootNavigator /> : null}</AppThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { colors, scheme } = useAppTheme();
  const accepted = usePreferences((state) => state.acceptedDisclaimerVersion === DISCLAIMER_VERSION);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const navigationTheme = useMemo<NavigationTheme>(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      fonts: Platform.OS === 'web' ? webFonts(base.fonts) : base.fonts,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, scheme]);

  if (!activeContent.ok) {
    return <ContentError />;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={accepted}>
          <Stack.Screen
            name="(tabs)"
            options={({ route }) => ({
              headerShown: false,
              // Shown as the back button text on iOS, e.g. "‹ Formler".
              title: TAB_TITLES[getFocusedRouteNameFromRoute(route) ?? 'index'] ?? da.tabs.search,
            })}
          />
          <Stack.Screen name="formel/[id]" options={{ title: '' }} />
          <Stack.Screen name="sygdom/[id]" options={{ title: '' }} />
          <Stack.Screen name="feedback" options={{ title: da.feedback.title, presentation: 'modal' }} />
          <Stack.Screen name="ansvarsfraskrivelse" options={{ title: da.more.disclaimer }} />
          <Stack.Screen name="om" options={{ title: da.about.title }} />
        </Stack.Protected>
        <Stack.Protected guard={!accepted}>
          <Stack.Screen name="velkommen" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

/** The web preview uses the same font stack for headers as for the rest of the app. */
function webFonts(fonts: NavigationTheme['fonts']): NavigationTheme['fonts'] {
  const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  return {
    regular: { ...fonts.regular, fontFamily },
    medium: { ...fonts.medium, fontFamily },
    bold: { ...fonts.bold, fontFamily },
    heavy: { ...fonts.heavy, fontFamily },
  };
}

/** Shown instead of the app if the built-in content fails validation. No content is shown at all. */
function ContentError() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.error, { backgroundColor: colors.background }]}>
      <Icon name="alert-circle-outline" size={40} color="danger" />
      <AppText variant="title" style={styles.center}>
        {da.errors.contentTitle}
      </AppText>
      <AppText color="textSecondary" style={styles.center}>
        {da.errors.contentText}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  center: { textAlign: 'center' },
});
