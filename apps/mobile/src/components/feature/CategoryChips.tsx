// CategoryChips — horizontal scroller of selectable category filters for
// the discovery feed. Single-select (tapping the active one clears it).
// Built on the Chip primitive so selection visuals stay consistent.

import { ScrollView } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { Chip } from '../Chip';

// Canonical hyperlocal categories for Tier-2 launch. Mirrors the seller
// onboarding category list; keep in sync with backend seed data.
export const CATEGORIES = [
  'Tiffin',
  'Bakery',
  'Snacks',
  'Pickle',
  'Sweets',
  'Homemade',
  'Groceries',
  'Crafts',
] as const;

export interface CategoryChipsProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
      }}
    >
      {CATEGORIES.map((c) => (
        <Chip
          key={c}
          label={c}
          selected={selected === c}
          onPress={() => onSelect(selected === c ? null : c)}
        />
      ))}
    </ScrollView>
  );
}
