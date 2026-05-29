// Profile tab — account summary, theme switch, sign out.
// Addresses CRUD + profile editing land in Week 6; for now this confirms
// the session and carries the theme toggle (which works today) + sign-out
// (with the Week 2.5 server-side /auth/logout call).

import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { Avatar, Button, Card } from '../../../src/components';
import { useTheme } from '../../../src/theme/useTheme';
import { useThemeContext } from '../../../src/theme/ThemeProvider';
import { useAuthStore } from '../../../src/store/authStore';
import { authApi } from '../../../src/api/auth';
import { signOutFirebase } from '../../../src/firebase/phoneAuth';
import type { ThemeMode } from '../../../src/store/themeStore';

const MODE_LABEL: Record<ThemeMode, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export default function ProfileScreen() {
  const theme = useTheme();
  const { mode, cycleMode } = useThemeContext();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const onSignOut = () => {
    Alert.alert('Sign out?', 'You’ll need your phone number to come back.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          const refreshToken = useAuthStore.getState().refreshToken;
          if (refreshToken) {
            try {
              await authApi.logout(refreshToken);
            } catch {
              /* best-effort */
            }
          }
          await signOutFirebase().catch(() => {});
          clear();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing['4xl'],
        }}
      >
        <Text style={[theme.type.h2, { color: theme.colors.text }]}>Profile</Text>

        {/* Identity */}
        <Card variant="elevated" style={{ marginTop: theme.spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar size="lg" name={user?.name ?? user?.phone ?? '?'} />
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <Text style={[theme.type.h4, { color: theme.colors.text }]}>
                {user?.name ?? 'Add your name'}
              </Text>
              <Text style={[theme.type.body, { color: theme.colors.textSecondary }]}>
                {user?.phone}
              </Text>
            </View>
          </View>
        </Card>

        {/* Settings rows */}
        <Text
          style={[
            theme.type.labelSm,
            {
              color: theme.colors.textTertiary,
              letterSpacing: 1,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          PREFERENCES
        </Text>
        <Card variant="outlined" padding="none">
          <Row
            label="Appearance"
            value={MODE_LABEL[mode]}
            onPress={cycleMode}
            theme={theme}
            first
          />
          <Divider theme={theme} />
          <RowLink label="Addresses" hint="Coming in Week 6" theme={theme} />
          <Divider theme={theme} />
          <RowLink label="Notifications" hint="Coming in Week 6" theme={theme} />
        </Card>

        <View style={{ marginTop: theme.spacing.xl }}>
          <Button label="Sign out" variant="secondary" onPress={onSignOut} fullWidth />
        </View>

        {__DEV__ ? (
          <Card variant="flat" padding="sm" style={{ marginTop: theme.spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[theme.type.labelSm, { color: theme.colors.textTertiary, flex: 1 }]}>
                DEV · Design system
              </Text>
              <Link href="/dev" style={[theme.type.button, { color: theme.colors.accent }]}>
                Open →
              </Link>
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  onPress,
  theme,
  first,
}: {
  label: string;
  value: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
  first?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      }}
    >
      <Text style={[theme.type.body, { color: theme.colors.text }]}>{label}</Text>
      <Text style={[theme.type.label, { color: theme.colors.accent }]}>{value}</Text>
    </Pressable>
  );
}

function RowLink({
  label,
  hint,
  theme,
}: {
  label: string;
  hint: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      }}
    >
      <Text style={[theme.type.body, { color: theme.colors.text }]}>{label}</Text>
      <Text style={[theme.type.caption, { color: theme.colors.textTertiary }]}>{hint}</Text>
    </View>
  );
}

function Divider({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.divider }} />;
}
