import { Image } from "@/components/ui/img";
import { useTranslation } from "@/hooks/useLocale";
import * as AC from "@bacons/apple-colors";
import { useOAuth, useSignUp } from "@clerk/clerk-expo";
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
    ScrollView,
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

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { t, tLegacy, locale } = useTranslation();
  
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });
  
  const [firstName, setFirstName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const content = {
    title: t("auth.signUp.title"),
    subtitle: t("auth.signUp.subtitle"),
    name: t("auth.signUp.firstName"),
    email: t("auth.signUp.email"),
    password: t("auth.signUp.password"),
    signUpButton: t("auth.signUp.signUpButton"),
    haveAccount: t("auth.signUp.hasAccount"),
    signIn: t("auth.signUp.signIn"),
    verifyEmail: "Verify Email", // TODO: Add to centralized translations
    verifyEmailDesc: "We've sent a verification code to your email", // TODO: Add to centralized translations
    verificationCode: "Verification Code", // TODO: Add to centralized translations
    verify: "Verify", // TODO: Add to centralized translations
    terms: "By signing up, you agree to our Terms of Service and Privacy Policy", // TODO: Add to centralized translations
    orContinueWith: t("auth.signUp.orContinueWith"),
  };

  const onSignUpPress = async () => {
    if (!isLoaded || !signUp) return;

    // Basic validation
    if (!firstName || !emailAddress || !password) {
      Alert.alert(
        t("error"),
        t("Fill all fields", { 
          en: "Please fill in all fields", 
          ar: "يرجى ملء جميع الحقول" 
        })
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      Alert.alert(
        t("error"),
        t("Invalid email", { 
          en: "Please enter a valid email address", 
          ar: "يرجى إدخال بريد إلكتروني صحيح" 
        })
      );
      return;
    }

    // Password validation
    if (password.length < 8) {
      Alert.alert(
        t("error"),
        t("Weak password", { 
          en: "Password must be at least 8 characters", 
          ar: "يجب أن تكون كلمة المرور 8 أحرف على الأقل" 
        })
      );
      return;
    }

    setIsLoading(true);
    try {
      // Only send the fields that are enabled for this Clerk instance.
      // Passing firstName/lastName triggers a "first_name is not a valid parameter" error
      // because the instance has those attributes disabled.
      await signUp.create({
        emailAddress,
        password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Sign-up error details:", err);
      
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 
        t("Sign up failed", { 
          en: "Failed to create account", 
          ar: "فشل إنشاء الحساب" 
        });
        
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
        t("OAuth error", { 
          en: "Authentication failed. Please try again.", 
          ar: "فشلت المصادقة. يرجى المحاولة مرة أخرى." 
        });
        
      Alert.alert(
        t("error"),
        errorMessage
      );
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      
      // Navigate to tabs - the tabs layout will handle user creation and onboarding redirect
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert(
        t("error"),
        err.errors?.[0]?.message || t("Verification failed", { 
          en: "Invalid verification code", 
          ar: "رمز التحقق غير صحيح" 
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <Text style={styles.title}>
                {pendingVerification ? content.verifyEmail : content.title}
              </Text>
              <Text style={styles.subtitle}>
                {pendingVerification ? content.verifyEmailDesc : content.subtitle}
              </Text>
            </View>

            {!pendingVerification ? (
              <>
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{content.name}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={content.name}
                      placeholderTextColor={AC.placeholderText}
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      textAlign={locale === "ar" ? "right" : "left"}
                    />
                  </View>

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

                  <Text style={styles.terms}>{content.terms}</Text>

                  <TouchableOpacity
                    style={[styles.signUpButton, isLoading && styles.disabledButton]}
                    onPress={onSignUpPress}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.signUpButtonText}>{content.signUpButton}</Text>
                    )}
                  </TouchableOpacity>

                  {/* OAuth Section */}
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
                      <Image
                        source="sf:globe.europe.africa"
                        size={24}
                        tintColor={AC.label}
                      />
                      <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => onOAuthPress("oauth_apple")}
                    >
                      <Image
                        source="sf:apple.logo"
                        size={24}
                        tintColor={AC.label}
                      />
                      <Text style={styles.socialButtonText}>Apple</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>{content.haveAccount}</Text>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.signInLink}>{content.signIn}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{content.verificationCode}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    placeholderTextColor={AC.placeholderText}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && styles.disabledButton]}
                  onPress={onPressVerify}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.signUpButtonText}>{content.verify}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: AC.secondaryLabel,
    textAlign: "center",
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
  terms: {
    fontSize: 12,
    color: AC.secondaryLabel,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  signUpButton: {
    height: 48,
    backgroundColor: AC.systemBlue,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: "auto",
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: AC.secondaryLabel,
  },
  signInLink: {
    fontSize: 14,
    color: AC.systemBlue,
    fontWeight: "500",
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
    paddingHorizontal: 16,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: AC.separator,
    borderRadius: 12,
    backgroundColor: AC.secondarySystemGroupedBackground,
  },
  socialButtonText: {
    fontSize: 16,
    color: AC.label,
    fontWeight: "500",
  },
});