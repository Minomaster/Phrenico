import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { da } from '@/i18n/da';
import { useAppTheme } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
  };
}

const TAB_BAR_HEIGHT = 58;

/** The bottom menu: Søg · Formler · Sygdomme · Favoritter · Mere. */
export default function TabsLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        // A little taller than the default, so labels are never clipped and the buttons are easy to hit.
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, height: TAB_BAR_HEIGHT + insets.bottom },
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
        tabBarLabelPosition: 'below-icon',
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: da.tabs.search, tabBarIcon: tabIcon('search', 'search-outline') }} />
      <Tabs.Screen name="formler" options={{ title: da.tabs.formulas, tabBarIcon: tabIcon('calculator', 'calculator-outline') }} />
      <Tabs.Screen name="sygdomme" options={{ title: da.tabs.diseases, tabBarIcon: tabIcon('medkit', 'medkit-outline') }} />
      <Tabs.Screen name="favoritter" options={{ title: da.tabs.favorites, tabBarIcon: tabIcon('star', 'star-outline') }} />
      <Tabs.Screen
        name="mere"
        options={{ title: da.tabs.more, tabBarIcon: tabIcon('ellipsis-horizontal-circle', 'ellipsis-horizontal-circle-outline') }}
      />
    </Tabs>
  );
}
