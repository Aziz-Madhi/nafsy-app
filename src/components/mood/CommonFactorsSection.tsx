import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemedGlass } from "@/hooks/useThemedGlass";

interface FactorItem {
  factor: string;
  count: number;
}

interface CommonFactorsSectionProps {
  mostCommonFactors: FactorItem[] | null;
  locale: string;
}

export function CommonFactorsSection({
  mostCommonFactors,
  locale,
}: CommonFactorsSectionProps) {
  const { colors, cardGlass } = useThemedGlass();

  if (!mostCommonFactors || mostCommonFactors.length === 0) return null;

  return (
    <View style={styles.factorsSection}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        {locale === 'ar' ? 'العوامل الشائعة' : 'Common Factors'}
      </Text>
      <View style={styles.factorsList}>
        {mostCommonFactors.slice(0, 5).map((item, index) => (
          <View 
            key={index}
            style={[styles.factorItem, cardGlass]}
          >
            <Text style={[styles.factorName, { color: colors.text.primary }]}>
              {item.factor}
            </Text>
            <Text style={[styles.factorCount, { color: colors.text.secondary }]}>
              {item.count}x
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  factorsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  factorsList: {
    gap: 8,
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  factorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  factorCount: {
    fontSize: 14,
    fontWeight: '600',
  },
});