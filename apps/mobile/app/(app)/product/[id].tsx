// Product detail — Week 3 renders a read-only detail (image, name, price,
// description, availability). Week 4 extends THIS screen with the
// swipeable gallery + quantity stepper + optimistic add-to-cart.

import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../src/theme/useTheme';
import { EmptyState, Price, Skeleton } from '../../../src/components';
import { productsApi } from '../../../src/api/products';
import { queryKeys } from '../../../src/lib/queryKeys';

const SCREEN_W = Dimensions.get('window').width;
const BLUR = 'L9AB*A%M00xu_3xuofIU00M{~qof';

export default function ProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = String(id);

  const q = useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => productsApi.get(productId),
  });

  const product = q.data;
  const cover = product?.images?.[0];
  const soldOut =
    product &&
    (!product.isAvailable || (product.trackInventory && (product.stockQuantity ?? 0) <= 0));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={[]}>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing['4xl'] }}>
        {/* Image */}
        <View style={{ width: SCREEN_W, height: SCREEN_W, backgroundColor: theme.colors.surfaceMuted }}>
          <Image
            source={cover ? { uri: cover } : undefined}
            placeholder={{ blurhash: BLUR }}
            contentFit="cover"
            transition={300}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0 }}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityLabel="Back"
              style={[
                styles.backBtn,
                { margin: theme.spacing.md, backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
          {q.isLoading ? (
            <View style={{ gap: 12 }}>
              <Skeleton height={28} width="80%" />
              <Skeleton height={22} width="30%" />
              <Skeleton height={80} />
            </View>
          ) : q.isError || !product ? (
            <EmptyState
              emoji="🔍"
              title="Item not found"
              body="This dish may have been taken off the menu."
              actionLabel="Go back"
              onAction={() => router.back()}
            />
          ) : (
            <>
              <Text style={[theme.type.h2, { color: theme.colors.text }]}>{product.name}</Text>
              <Price paise={product.price} size="lg" style={{ marginTop: theme.spacing.xs }} />

              {product.isCustomOrder ? (
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.accentMuted, marginTop: theme.spacing.sm },
                  ]}
                >
                  <Text style={[theme.type.labelSm, { color: theme.colors.accent }]}>
                    Made to order · ~{product.leadTimeHours ?? 2} hr
                  </Text>
                </View>
              ) : null}

              {product.description ? (
                <Text
                  style={[
                    theme.type.body,
                    { color: theme.colors.textSecondary, marginTop: theme.spacing.lg, lineHeight: 24 },
                  ]}
                >
                  {product.description}
                </Text>
              ) : null}

              {soldOut ? (
                <View
                  style={[
                    styles.soldOut,
                    { backgroundColor: theme.colors.surfaceMuted, marginTop: theme.spacing.xl },
                  ]}
                >
                  <Text style={[theme.type.label, { color: theme.colors.textSecondary }]}>
                    Currently sold out
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    theme.type.caption,
                    { color: theme.colors.textTertiary, marginTop: theme.spacing.xl },
                  ]}
                >
                  Add to cart arrives in the next build.
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  soldOut: { alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
});
