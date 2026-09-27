import { Pressable, StyleSheet } from 'react-native';

import { minTouchTarget, spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      style={styles.row}
    >
      <Icon name={checked ? 'checkbox' : 'square-outline'} size={26} color="primary" />
      <AppText variant="bodyStrong" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: minTouchTarget },
  label: { flex: 1 },
});
