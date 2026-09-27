import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { useAppTheme, type ThemeColors } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: keyof ThemeColors;
}

/** All icons come from one icon set (Ionicons) for a consistent look. */
export function Icon({ name, size = 20, color = 'text' }: IconProps) {
  const { colors } = useAppTheme();
  return <Ionicons name={name} size={size} color={colors[color]} accessibilityElementsHidden importantForAccessibility="no" />;
}
