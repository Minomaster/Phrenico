import { Text, type TextProps } from 'react-native';

import { useAppTheme, type ThemeColors, type TypographyVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: keyof ThemeColors;
}

/** All text in the app goes through this component, so the typography stays consistent. */
export function AppText({ variant = 'body', color = 'text', style, ...rest }: AppTextProps) {
  const { colors, typography } = useAppTheme();
  return <Text style={[typography[variant], { color: colors[color] }, style]} {...rest} />;
}
