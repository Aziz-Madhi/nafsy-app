import * as Form from "@/components/ui/Form";
import { useTranslation } from "@/hooks/useLocale";
import * as AC from "@bacons/apple-colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  const content = {
    profile: t("Profile", { en: "Profile", ar: "الملف الشخصي" }),
    settings: t("Settings", { en: "Settings", ar: "الإعدادات" }),
    preferences: t("Preferences", { en: "Preferences", ar: "التفضيلات" }),
    notifications: t("Notifications", { en: "Notifications", ar: "الإشعارات" }),
    privacy: t("Privacy", { en: "Privacy", ar: "الخصوصية" }),
    help: t("Help", { en: "Help & Support", ar: "المساعدة والدعم" }),
    about: t("About", { en: "About Nafsy", ar: "عن نفسي" }),
    signOut: t("Sign Out", { en: "Sign Out", ar: "تسجيل الخروج" }),
  };

  return (
    <SafeAreaView style={styles.container}>
      <Form.List navigationTitle={content.profile}>
        <View style={styles.header}>
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
            <Form.Text style={{ color: AC.systemRed }}>
              {content.signOut}
            </Form.Text>
          </TouchableOpacity>
        </Form.Section>
      </Form.List>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AC.systemBackground,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AC.systemBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: AC.label,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: AC.secondaryLabel,
  },
});