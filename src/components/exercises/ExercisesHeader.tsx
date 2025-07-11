import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ExercisesHeaderProps {
  colors: any;
  locale: string;
}

export const ExercisesHeader = React.memo<ExercisesHeaderProps>(({ colors, locale }) => (
  <View style={styles.header}>
    <Text style={[styles.title, { color: colors.text.primary }]}>
      {locale === 'ar' ? 'تمارين العافية' : 'Wellness Exercises'}
    </Text>
    <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
      {locale === 'ar' ? 'تقنيات مثبتة علمياً لصحتك النفسية' : 'Evidence-based techniques for your mental health'}
    </Text>
  </View>
));

ExercisesHeader.displayName = 'ExercisesHeader';

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
});