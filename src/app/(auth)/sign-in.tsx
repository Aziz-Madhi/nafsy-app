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

// Warm up the browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Deep-link scheme **must** match the value in app.json ("scheme")
const APP_SCHEME = "nafsy-app";
// Standard Clerk mobile redirect path
const REDIRECT_URL = Linking.createURL("sso-callback", { scheme: APP_SCHEME });

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });

  const content = {
    title: t("Sign In", { en: "Sign In", ar: "تسجيل الدخول" }),
    subtitle: t("Welcome back", { en: "Welcome back", ar: "مرحباً بعودتك" }),
    email: t("Email", { en: "Email", ar: "البريد الإلكتروني" }),
    password: t("Password", { en: "Password", ar: "كلمة المرور" }),
    signInButton: t("Sign In", { en: "Sign In", ar: "تسجيل الدخول" }),
    orContinueWith: t("Or continue with", { en: "Or continue with", ar: "أو تابع باستخدام" }),
    noAccount: t("Don't have an account?", { en: "Don't have an account?", ar: "ليس لديك حساب؟" }),
    signUp: t("Sign Up", { en: "Sign Up", ar: "إنشاء حساب" }),
    forgotPassword: t("Forgot password?", { en: "Forgot password?", ar: "نسيت كلمة المرور؟" }),
  };

  const onSignInPress = async () => {
    if (!isLoaded || !signIn) return;

    // Basic validation
    if (!emailAddress || !password) {
      Alert.alert(
        t("Error", { en: "Error", ar: "خطأ" }),
        t("Fill all fields", { 
          en: "Please fill in all fields", 
          ar: "يرجى ملء جميع الحقول" 
        })
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
        t("Invalid credentials", { 
          en: "Invalid email or password", 
          ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة" 
        });
        
      Alert.alert(
        t("Error", { en: "Error", ar: "خطأ" }),
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
        t("OAuth error", { 
          en: "Authentication failed. Please try again.", 
          ar: "فشلت المصادقة. يرجى المحاولة مرة أخرى." 
        });
        
      Alert.alert(
        t("Error", { en: "Error", ar: "خطأ" }),
        errorMessage
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
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

          <View style={styles.header}>
            <Image 
              source="sf:brain.head.profile" 
              size={60} 
              tintColor={AC.systemTeal}
              style={styles.logo}
            />
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.subtitle}>{content.subtitle}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{content.email}</Text>
              <TextInput
                style={styles.input}
                placeholder={content.email}
                placeholderTextColor={AC.placeholderText}
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                keyboardType="email-address"
                textAlign={locale === "ar" ? "right" : "left"}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{content.password}</Text>
              <TextInput
                style={styles.input}
                placeholder={content.password}
                placeholderTextColor={AC.placeholderText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textAlign={locale === "ar" ? "right" : "left"}
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>{content.forgotPassword}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.disabledButton]}
              onPress={onSignInPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>{content.signInButton}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{content.orContinueWith}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => onOAuthPress("oauth_google")}
            >
              <Image source="sf:globe" size={24} tintColor={AC.label} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => onOAuthPress("oauth_apple")}
              >
                <Image source="sf:apple.logo" size={24} tintColor={AC.label} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{content.noAccount}</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={styles.signUpLink}>{content.signUp}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AC.systemBackground,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    paddingVertical: 16,
    alignSelf: "flex-start",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: AC.label,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AC.secondaryLabel,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: AC.label,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: AC.separator,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: AC.label,
    backgroundColor: AC.secondarySystemGroupedBackground,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: AC.systemBlue,
  },
  signInButton: {
    height: 48,
    backgroundColor: AC.systemBlue,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AC.separator,
  },
  dividerText: {
    fontSize: 14,
    color: AC.secondaryLabel,
    marginHorizontal: 16,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AC.separator,
    borderRadius: 12,
    gap: 8,
    backgroundColor: AC.secondarySystemGroupedBackground,
  },
  socialButtonText: {
    fontSize: 16,
    color: AC.label,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: AC.secondaryLabel,
  },
  signUpLink: {
    fontSize: 14,
    color: AC.systemBlue,
    fontWeight: "500",
  },
});