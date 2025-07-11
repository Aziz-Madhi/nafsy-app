import React from "react";
import { View, StyleSheet } from "react-native";
import { LiquidTab } from "@/components/animations/LiquidTab";

// Categories constant
const categories = [
  { id: 'all', label: { en: 'All', ar: 'الكل' }, icon: 'square.grid.2x2' },
  { id: 'breathing', label: { en: 'Breathing', ar: 'التنفس' }, icon: 'wind' },
  { id: 'grounding', label: { en: 'Grounding', ar: 'التأريض' }, icon: 'hand.raised' },
  { id: 'thoughtChallenge', label: { en: 'Thoughts', ar: 'الأفكار' }, icon: 'brain' },
  { id: 'gratitude', label: { en: 'Gratitude', ar: 'الامتنان' }, icon: 'heart.fill' },
];

interface ExerciseCategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  locale: string;
}

export const ExerciseCategories = React.memo<ExerciseCategoriesProps>(({
  selectedCategory,
  onCategoryChange,
  locale,
}) => (
  <View style={styles.categoriesContainer}>
    <LiquidTab
      tabs={categories.map(cat => ({
        id: cat.id,
        label: cat.label[locale],
        icon: cat.icon,
      }))}
      selectedTab={selectedCategory}
      onTabChange={onCategoryChange}
      style={styles.liquidTabContainer}
    />
  </View>
));

ExerciseCategories.displayName = 'ExerciseCategories';

export { categories };

const styles = StyleSheet.create({
  categoriesContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  liquidTabContainer: {
    marginHorizontal: 0,
  },
});