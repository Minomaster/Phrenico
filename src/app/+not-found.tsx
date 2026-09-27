import { Stack } from 'expo-router';

import { NotFound } from '@/components/NotFound';
import { da } from '@/i18n/da';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: da.errors.notFoundTitle }} />
      <NotFound text={da.errors.notFoundTitle} />
    </>
  );
}
