import { Image } from "@/components/ui/img";
import { useTranslation } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import * as AC from "@bacons/apple-colors";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Warm up the browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Deep-link scheme **must** match the value in app.json ("scheme")
const APP_SCHEME = "nafsy-app";
// Standard Clerk mobile redirect path
const REDIRECT_URL = Linking.createURL("sso-callback", { scheme: APP_SCHEME });

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { t, tLegacy, locale } = useTranslation();
  const { theme, styles: commonStyles } = useAppTheme();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });

  const content = {
    title: t("auth.signIn.title"),
    subtitle: t("auth.signIn.subtitle"),
    email: t("auth.signIn.email"),
    password: t("auth.signIn.password"),
    signInButton: t("auth.signIn.signInButton"),
    orContinueWith: t("auth.signIn.orContinueWith"),
    noAccount: t("auth.signIn.noAccount"),
    signUp: t("auth.signIn.signUp"),
    forgotPassword: t("auth.signIn.forgotPassword"),
  };

  const onSignInPress = async () => {
    if (!isLoaded || !signIn) return;

    // Basic validation
    if (!emailAddress || !password) {
      Alert.alert(
        t("error"),
        t("auth.signIn.fillAllFields")
      );
      return;
    }

    setIsLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress.trim().toLowerCase(),
        password,
      });

      if (completeSignIn.status === "complete") {
        await setActive({ session: completeSignIn.createdSessionId });
        router.replace("/(tabs)");
      } else {
        console.log("Sign in status:", completeSignIn.status);
        // Handle other statuses if needed
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 
        t("auth.signIn.invalidCredentials");
        
      Alert.alert(
        t("error"),
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onOAuthPress = async (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded) {
      console.log("Clerk not loaded yet");
      return;
    }

    try {
      console.log("Starting OAuth flow for:", strategy);
      console.log("Redirect URL:", REDIRECT_URL);
      
      const flow = strategy === "oauth_google" ? googleAuth : appleAuth;
      if (!flow) {
        console.error("OAuth flow not available for", strategy);
        return;
      }

      const { createdSessionId, setActive: oauthSetActive, signIn, signUp } = await flow({ 
        redirectUrl: REDIRECT_URL 
      });
      
      console.log("OAuth flow result:", { createdSessionId, hasSignIn: !!signIn, hasSignUp: !!signUp });
      
      if (createdSessionId) {
        console.log("Setting active session:", createdSessionId);
        await setActive({ session: createdSessionId });
        console.log("Session set, redirecting to tabs");
        router.replace("/(tabs)");
      } else if (signUp || signIn) {
        console.log("External account verification required");
        // OAuth account needs to be verified
      }
    } catch (err: any) {
      console.error("OAuth error details:", {
        message: err.message,
        errors: err.errors,
        code: err.code,
        status: err.status
      });
      
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || 
        t("auth.signIn.oauthError");
        
      Alert.alert(
        t("error"),
        errorMessage
      );
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={commonStyles.paddedContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Image
              source={locale === "ar" ? "sf:chevron.right" : "sf:chevron.left"}
              size={24}
              tintColor={theme.colors.interactive.primary}
            />
          </TouchableOpacity>

          <View style={commonStyles.header}>
            <Image 
              source="sf:brain.head.profile" 
              size={60} 
              tintColor={theme.colors.wellness.calm}
              style={commonStyles.logo}
            />
            <Text style={commonStyles.title}>{content.title}</Text>
            <Text style={commonStyles.subtitle}>{content.subtitle}</Text>
          </View>

          <View style={commonStyles.form}>
            <View style={commonStyles.inputContainer}>
              <Text style={commonStyles.inputLabel}>{content.email}</Text>
              <TextInput
                style={commonStyles.input}
                placeholder={content.email}
                placeholderTextColor={theme.colors.text.placeholder}
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                keyboardType="email-address"
                textAlign={locale === "ar" ? "right" : "left"}
              />
            </View>

            <View style={commonStyles.inputContainer}>
              <Text style={commonStyles.inputLabel}>{content.password}</Text>
              <TextInput
                style={commonStyles.input}
                placeholder={content.password}
                placeholderTextColor={theme.colors.text.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textAlign={locale === "ar" ? "right" : "left"}
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={commonStyles.linkSmall}>{content.forgotPassword}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.primaryButton, isLoading && commonStyles.disabledButton]}
              onPress={onSignInPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={commonStyles.primaryButtonText}>{content.signInButton}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={commonStyles.divider}>
            <View style={commonStyles.dividerLine} />
            <Text style={commonStyles.dividerText}>{content.orContinueWith}</Text>
            <View style={commonStyles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={commonStyles.secondaryButton}
              onPress={() => onOAuthPress("oauth_google")}
            >
              <Image source="sf:globe" size={24} tintColor={theme.colors.text.primary} />
              <Text style={commonStyles.secondaryButtonText}>Google</Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={commonStyles.secondaryButton}
                onPress={() => onOAuthPress("oauth_apple")}
              >
                <Image source="sf:apple.logo" size={24} tintColor={theme.colors.text.primary} />
                <Text style={commonStyles.secondaryButtonText}>Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={commonStyles.footer}>
            <Text style={commonStyles.footerText}>{content.noAccount}</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={commonStyles.link}>{content.signUp}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  backButton: {
    paddingVertical: 16,
    alignSelf: "flex-start",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 24,
  },
});