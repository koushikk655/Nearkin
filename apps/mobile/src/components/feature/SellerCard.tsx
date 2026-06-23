// SellerCard — a tappable seller row for the discovery feed.
//
// Layout: square category tile on the left, shop name + category + rating +
// distance/min-order on the right. A "Closed" scrim when the seller isn't
// open. Editorial weight on the shop name (serif), functional meta in
// sans/mono.
//
// Sellers don't carry a cover image in the discovery payload yet, so the
// tile is a clean saffron-tinted block with a category glyph — intentional,
// loads instantly, and looks right in both themes. Swap for the maker's
// real cover once the backend/Cloudinary provides one.

import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/useTheme';
import { Card } from '../Card';
import { Rating } from '../Rating';
import { formatDistance, formatPaise } from '../../lib/format';
import type { NearbySeller } from '../../api/types';

type IoniconName = keyof typeof Ionicons.glyphMap;

export function categoryIcon(category: string | null): IoniconName {
  switch ((category ?? '').toLowerCase()) {
    case 'bakes':
      return 'cafe-outline';
    case 'pickles':
      return 'nutrition-outline';
    case 'sweets':
      return 'ice-cream-outline';
    case 'crafts':
      return 'color-palette-outline';
    case 'candles':
      return 'flame-outline';
    case 'ceramics':
      return 'cube-outline';
    case 'plants':
      return 'leaf-outline';
    case 'prints':
      return 'image-outline';
    case 'decor':
      return 'home-outline';
    case 'gifts':
      return 'gift-outline';
    default:
      return 'storefront-outline';
  }
}

export interface SellerCardProps {
  seller: NearbySeller;
  onPress: () => void;
}

export const SellerCard = memo(function SellerCard({ seller, onPress }: SellerCardProps) {
  const theme = useTheme();

  return (
    <Card variant="elevated" padding="sm" onPress={onPress} radius="xl">
      <View style={styles.row}>
        <View
          style={[
            styles.tile,
            { borderRadius: theme.radii.lg, backgroundColor: theme.colors.accentMuted },
          ]}
        >
          <Ionicons name={categoryIcon(seller.category)} size={30} color={theme.colors.accent} />
          {!seller.isOpen ? (
            <View style={[StyleSheet.absoluteFill, styles.closedScrim, { backgroundColor: theme.colors.scrim }]}>
              <Text style={[theme.type.labelSm, { color: '#fff' }]}>Closed</Text>
            </View>
          ) : null}
        </View>

        <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[theme.type.h4, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
              {seller.shopName}
            </Text>
            <Rating rating={seller.rating} totalOrders={seller.totalOrders} size="sm" style={{ marginLeft: 8 }} />
          </View>

          {seller.category ? (
            <Text
              style={[theme.type.bodySm, { color: theme.colors.textSecondary, marginTop: 2 }]}
              numberOfLines={1}
            >
              {seller.category}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs, flexWrap: 'wrap' }}>
            <Meta text={formatDistance(seller.distanceMeters)} />
            {seller.minOrderAmount > 0 ? (
              <>
                <Dot />
                <Meta text={`min ${formatPaise(seller.minOrderAmount)}`} />
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
});

function Meta({ text }: { text: string }) {
  const theme = useTheme();
  return <Text style={[theme.type.caption, { color: theme.colors.textTertiary }]}>{text}</Text>;
}

function Dot() {
  const theme = useTheme();
  return (
    <Text style={[theme.type.caption, { color: theme.colors.textTertiary, marginHorizontal: 6 }]}>·</Text>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  tile: { width: 76, height: 76, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  closedScrim: { alignItems: 'center', justifyContent: 'center' },
});
