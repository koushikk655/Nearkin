// Orders tab — placeholder in Week 3. Wired to GET /orders/mine in Week 5
// once the orders API + checkout land. Kept as a friendly empty state so
// the tab is navigable from day one.

import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

import { useTheme } from '../../../src/theme/useTheme';
import { EmptyState } from '../../../src/components';

export default function OrdersScreen() {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm }}>
        <Text style={[theme.type.h2, { color: theme.colors.text }]}>Orders</Text>
      </View>
      <EmptyState
        emoji="🧾"
        title="No orders yet"
        body="When you order from a maker nearby, you’ll track it here — from kitchen to doorstep."
      />
    </SafeAreaView>
  );
}
