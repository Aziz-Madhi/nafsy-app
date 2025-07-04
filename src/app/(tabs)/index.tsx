import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import * as AC from "@bacons/apple-colors";
import { useTranslation } from "@/hooks/useLocale";
import { ContentUnavailable } from "@/components/ui/ContentUnavailable";

export default function ChatScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ContentUnavailable
          title={t("Chat Coming Soon", { 
            en: "Chat Coming Soon", 
            ar: "المحادثة قريباً" 
          })}
          systemImage="message.fill"
          description={t("Chat description", { 
            en: "Your AI wellness companion will be here soon", 
            ar: "رفيقك الذكي للصحة النفسية سيكون هنا قريباً" 
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