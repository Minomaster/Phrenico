import { StyleSheet, View } from 'react-native';

import { radius, useAppTheme } from '@/theme';

import { Icon } from './Icon';

/** A placeholder logo (blue square with a pulse line) until the real logo is made. */
export function AppLogo({ size = 64 }: { size?: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.logo, { width: size, height: size, backgroundColor: colors.primary, borderRadius: radius.lg }]}>
      <Icon name="pulse" size={size * 0.56} color="onPrimary" />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'center', justifyContent: 'center' },
});
