import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import * as AC from "@bacons/apple-colors";
import { useTranslation } from "@/hooks/useLocale";
import { ContentUnavailable } from "@/components/ui/ContentUnavailable";

export default function ExercisesScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ContentUnavailable
          title={t("Exercises", { 
            en: "Exercises Coming Soon", 
            ar: "التمارين قريباً" 
          })}
          systemImage="heart.circle.fill"
          description={t("Exercises description", { 
            en: "Therapeutic exercises to improve your wellbeing", 
            ar: "تمارين علاجية لتحسين صحتك النفسية" 
          })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AC.systemBackground,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});