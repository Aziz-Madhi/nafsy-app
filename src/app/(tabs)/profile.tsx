import * as Form from "@/components/ui/Form";
import { useTranslation } from "@/hooks/useLocale";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, styles } = useAppTheme();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  const content = {
    profile: t("profile.title"),
    settings: t("profile.settings"),
    preferences: t("profile.preferences"),
    notifications: t("profile.notifications"),
    privacy: t("profile.privacy"),
    help: t("profile.help"),
    about: t("profile.about"),
    signOut: t("profile.signOut"),
  };

  return (
    <SafeAreaView style={styles.container}>
      <Form.List navigationTitle={content.profile}>
        <View style={localStyles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.firstName || "User"}</Text>
          <Text style={styles.email}>{user?.emailAddresses[0]?.emailAddress}</Text>
        </View>

        <Form.Section title={content.settings}>
          <Form.Text systemImage="bell">
            {content.notifications}
          </Form.Text>
          <Form.Text systemImage="hand.raised">
            {content.privacy}
          </Form.Text>
        </Form.Section>

        <Form.Section>
          <Form.Text systemImage="questionmark.circle">
            {content.help}
          </Form.Text>
          <Form.Text systemImage="info.circle">
            {content.about}
          </Form.Text>
        </Form.Section>

        <Form.Section>
          <TouchableOpacity onPress={handleSignOut}>
            <Form.Text style={{ color: colors.interactive.destructive }}>
              {content.signOut}
            </Form.Text>
          </TouchableOpacity>
        </Form.Section>
      </Form.List>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 24,
  },
});