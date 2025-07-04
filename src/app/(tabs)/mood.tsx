import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import * as AC from "@bacons/apple-colors";
import { useTranslation } from "@/hooks/useLocale";
import { ContentUnavailable } from "@/components/ui/ContentUnavailable";

export default function MoodScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ContentUnavailable
          title={t("Mood Tracking", { 
            en: "Mood Tracking Coming Soon", 
            ar: "تتبع المزاج قريباً" 
          })}
          systemImage="face.smiling"
          description={t("Mood description", { 
            en: "Track your daily mood and see insights", 
            ar: "تتبع مزاجك اليومي واحصل على رؤى" 
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