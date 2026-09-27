import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { da } from '@/i18n/da';
import { routes } from '@/navigation/routes';
import { spacing } from '@/theme';

import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Screen } from './Screen';

export function NotFound({ text }: { text: string }) {
  return (
    <Screen>
      <EmptyState icon="help-circle-outline" title={da.errors.notFoundTitle} text={text} />
      <View style={styles.action}>
        <Button variant="secondary" label={da.errors.back} onPress={() => router.replace(routes.search)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  action: { alignItems: 'center', gap: spacing.md },
});
