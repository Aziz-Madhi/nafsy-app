import { Image } from "@/components/core/Image/Image";
import { EmailField, PasswordField, PrimaryButton, SecondaryButton } from "@/components/forms";
import { AUTH_VALIDATION, useAuthForm } from "@/hooks/forms";
import { useTranslation } from "@/hooks/useLocale";
import { useOAuthAuthentication, type OAuthStrategy } from "@/hooks/useOAuth";
import { useAppTheme } from "@/theme";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Warm up the browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// OAuth configuration is now handled by useOAuthAuthentication hook

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { t, tLegacy: _tLegacy, locale } = useTranslation();
  const { theme: _theme, styles: commonStyles, colors } = useAppTheme();
  
  const { authenticateWithOAuth } = useOAuthAuthentication();

  // Memoize initial form data to avoid new object identity each render
  const initialFormData = React.useMemo<SignInFormData>(() => ({
    email: '',
    password: '',
  }), []);

  // Initialize form with validation using the new form system
  const form = useAuthForm<SignInFormData>(
    initialFormData,
    {
      email: AUTH_VALIDATION.email,
      password: AUTH_VALIDATION.password,
    },
    async (data) => {
      await onSignInPress(data);
    }
  );

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

  const onSignInPress = async (data: SignInFormData) => {
    if (!isLoaded || !signIn) return;

    try {
      const completeSignIn = await signIn.create({
        identifier: data.email.trim().toLowerCase(),
        password: data.password,
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
        
      throw new Error(errorMessage);
    }
  };

  const onOAuthPress = async (strategy: OAuthStrategy) => {
    await authenticateWithOAuth(strategy, isLoaded, setActive);
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
              tintColor={colors.interactive.primary}
            />
          </TouchableOpacity>

          <View style={commonStyles.header}>
            <Image 
              source="sf:brain.head.profile" 
              size={60} 
              tintColor={colors.wellness.calm}
              style={commonStyles.logo}
            />
            <Text style={commonStyles.title}>{content.title}</Text>
            <Text style={commonStyles.subtitle}>{content.subtitle}</Text>
          </View>

          <View style={commonStyles.form}>
            {/* Email Field */}
            <EmailField
              name="email"
              label={content.email}
              placeholder={content.email}
              {...form.getFieldProps('email')}
              variant="default"
              required
            />

            {/* Password Field */}
            <PasswordField
              name="password"
              label={content.password}
              placeholder={content.password}
              {...form.getFieldProps('password')}
              variant="default"
              required
            />

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={commonStyles.linkSmall}>{content.forgotPassword}</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <PrimaryButton
              title={content.signInButton}
              onPress={form.submitForm}
              disabled={!form.canSubmit}
              loading={form.isSubmitting}
              fullWidth
              style={styles.submitButton}
            />
          </View>

          <View style={commonStyles.divider}>
            <View style={commonStyles.dividerLine} />
            <Text style={commonStyles.dividerText}>{content.orContinueWith}</Text>
            <View style={commonStyles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <SecondaryButton
              title={t("auth.signIn.google")}
              onPress={() => onOAuthPress("oauth_google")}
              leftIcon="globe"
              fullWidth
            />

            {Platform.OS === "ios" && (
              <SecondaryButton
                title={t("auth.signIn.apple")}
                onPress={() => onOAuthPress("oauth_apple")}
                leftIcon="apple.logo"
                fullWidth
              />
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
  submitButton: {
    marginTop: 8,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 24,
  },
});