import type { ReactNode, Ref } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { DemoBanner } from './DemoBanner';

interface ScreenProps {
  children: ReactNode;
  /** Scrolls the content. Turn off for screens that render their own list. */
  scroll?: boolean;
  /** Pad for the status bar. Used by tab screens, which have no navigation header. */
  safeTop?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollRef?: Ref<ScrollView>;
}

/** The frame around every screen: background, safe areas and the demo banner. */
export function Screen({ children, scroll = true, safeTop = false, contentContainerStyle, scrollRef }: ScreenProps) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView edges={safeTop ? ['top', 'left', 'right'] : ['left', 'right']} style={[styles.root, { backgroundColor: colors.background }]}>
      <DemoBanner />
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          style={styles.root}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.root}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/** The large title at the top of each tab screen (e.g. "Formler"). */
export function ScreenTitle({ children, accessory }: { children: string; accessory?: ReactNode }) {
  return (
    <View style={styles.titleRow}>
      <AppText variant="display" accessibilityRole="header" style={styles.title}>
        {children}
      </AppText>
      {accessory}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  title: { flexShrink: 1 },
});
