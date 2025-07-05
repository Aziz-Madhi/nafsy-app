import { Image } from "@/components/ui/img";
import { useTranslation } from "@/hooks/useLocale";
import * as AC from "@bacons/apple-colors";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";
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
import { CommonStyles } from "@/utils/styles";

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
    <SafeAreaView style={CommonStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={CommonStyles.paddedContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Image
              source={locale === "ar" ? "sf:chevron.right" : "sf:chevron.left"}
              size={24}
              tintColor={AC.systemBlue}
            />
          </TouchableOpacity>

          <View style={CommonStyles.header}>
            <Image 
              source="sf:brain.head.profile" 
              size={60} 
              tintColor={AC.systemTeal}
              style={CommonStyles.logo}
            />
            <Text style={CommonStyles.title}>{content.title}</Text>
            <Text style={CommonStyles.subtitle}>{content.subtitle}</Text>
          </View>

          <View style={CommonStyles.form}>
            <View style={CommonStyles.inputContainer}>
              <Text style={CommonStyles.inputLabel}>{content.email}</Text>
              <TextInput
                style={CommonStyles.input}
                placeholder={content.email}
                placeholderTextColor={AC.placeholderText}
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                keyboardType="email-address"
                textAlign={locale === "ar" ? "right" : "left"}
              />
            </View>

            <View style={CommonStyles.inputContainer}>
              <Text style={CommonStyles.inputLabel}>{content.password}</Text>
              <TextInput
                style={CommonStyles.input}
                placeholder={content.password}
                placeholderTextColor={AC.placeholderText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textAlign={locale === "ar" ? "right" : "left"}
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={CommonStyles.linkSmall}>{content.forgotPassword}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[CommonStyles.primaryButton, isLoading && CommonStyles.disabledButton]}
              onPress={onSignInPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={CommonStyles.primaryButtonText}>{content.signInButton}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={CommonStyles.divider}>
            <View style={CommonStyles.dividerLine} />
            <Text style={CommonStyles.dividerText}>{content.orContinueWith}</Text>
            <View style={CommonStyles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={CommonStyles.secondaryButton}
              onPress={() => onOAuthPress("oauth_google")}
            >
              <Image source="sf:globe" size={24} tintColor={AC.label} />
              <Text style={CommonStyles.secondaryButtonText}>Google</Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={CommonStyles.secondaryButton}
                onPress={() => onOAuthPress("oauth_apple")}
              >
                <Image source="sf:apple.logo" size={24} tintColor={AC.label} />
                <Text style={CommonStyles.secondaryButtonText}>Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={CommonStyles.footer}>
            <Text style={CommonStyles.footerText}>{content.noAccount}</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={CommonStyles.link}>{content.signUp}</Text>
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