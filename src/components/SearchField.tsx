import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { minTouchTarget, noWebOutline, radius, spacing, typography, useAppTheme } from '@/theme';

import { Icon } from './Icon';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel?: string;
  autoFocus?: boolean;
}

export function SearchField({ value, onChangeText, placeholder, accessibilityLabel, autoFocus }: SearchFieldProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: focused ? colors.primary : colors.inputBorder },
        focused && styles.focused,
      ]}
    >
      <Icon name="search" size={20} color="textMuted" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel ?? placeholder}
        style={[styles.input, noWebOutline, { color: colors.text }]}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Ryd feltet"
          hitSlop={8}
          style={styles.clear}
        >
          <Icon name="close-circle" size={20} color="textMuted" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  focused: { borderWidth: 2, paddingHorizontal: spacing.md - 1 },
  input: { flex: 1, ...typography.body, paddingVertical: spacing.sm, minHeight: minTouchTarget },
  clear: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
});
