// Home — placeholder until Week 2 lands Discover. In dev builds we also
// surface a quiet entry into the design-system gallery at `/dev`.

import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../src/theme/useTheme';

export default function Home() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        <Text
          style={[
            theme.type.caption,
            { color: theme.colors.textTertiary, marginBottom: theme.spacing.xs },
          ]}
        >
          NEARFOLD
        </Text>
        <Text style={[theme.type.display, { color: theme.colors.text }]}>
          Five blocks away.
        </Text>
        <Text
          style={[
            theme.type.bodyLg,
            {
              color: theme.colors.textSecondary,
              marginTop: theme.spacing.md,
              maxWidth: 360,
            },
          ]}
        >
          A hyperlocal marketplace for the people cooking, baking, and stitching
          on your street. Week 2 wires up Discover.
        </Text>
      </View>

      {__DEV__ ? (
        <View
          style={[
            styles.devBanner,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[theme.type.labelSm, { color: theme.colors.textTertiary }]}>
              DEV BUILD
            </Text>
            <Text style={[theme.type.body, { color: theme.colors.text }]}>
              Design system gallery
            </Text>
          </View>
          <Link
            href="/dev"
            style={[
              theme.type.button,
              {
                color: theme.colors.accent,
                paddingVertical: theme.spacing.xs,
                paddingHorizontal: theme.spacing.md,
              },
            ]}
          >
            Open →
          </Link>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
