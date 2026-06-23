// Splash route — first thing expo-router renders after the root Stack mounts.
// Uses declarative <Redirect> to avoid the race condition that imperative
// router.replace() in a useEffect causes ("navigate before mounting" error).

import { View } from 'react-native';
import { Redirect } from 'expo-router';

import { useTheme } from '../src/theme/useTheme';
import { useAuthStore } from '../src/store/authStore';

export default function SplashRoute() {
  const theme = useTheme();
  const status = useAuthStore((s) => s.status);

  if (status === 'authenticated') {
    return <Redirect href="/home" />;
  }
  if (status === 'anonymous') {
    return <Redirect href="/auth/phone" />;
  }

  // 'idle' or 'hydrating' — auth store is still reading SecureStore.
  // Root layout keeps the splash screen visible via preventAutoHideAsync,
  // so just render an invisible placeholder until hydration resolves.
  return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
}
