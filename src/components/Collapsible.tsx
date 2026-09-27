import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, radius, spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}

/** A fold-out section ("▸ Dokumentation") on the formula page. */
export function Collapsible({ title, children, initiallyOpen = false }: CollapsibleProps) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.header, pressed && { backgroundColor: colors.surfaceAlt }]}
      >
        <Icon name={open ? 'chevron-down' : 'chevron-forward'} size={18} color="primary" />
        <AppText variant="heading" style={styles.title}>
          {title}
        </AppText>
      </Pressable>
      {open ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: minTouchTarget + 8,
    paddingHorizontal: spacing.lg,
  },
  title: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
