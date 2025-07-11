import { Image } from "@/components/core/Image/Image";
import { useTranslation } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
    Platform,
    Text,
    View,
} from "react-native";
import { useAuthForm, AUTH_VALIDATION } from "@/hooks/forms";
import { EmailField, PasswordField, NameField, VerificationCodeField, PrimaryButton, SecondaryButton } from "@/components/forms";
import { FormScreen } from "@/components/layout/BaseScreen";
import { useOAuthAuthentication, type OAuthStrategy } from "@/hooks/useOAuth";

// Warm up the browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// OAuth configuration is now handled by useOAuthAuthentication hook

interface SignUpFormData {
  firstName: string;
  email: string;
  password: string;
}

interface VerificationFormData {
  code: string;
}

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { t, tLegacy: _tLegacy } = useTranslation();
  const { theme: _theme, styles: commonStyles, colors, spacing, fontSize } = useAppTheme();
  
  const { authenticateWithOAuth } = useOAuthAuthentication();
  
  const [pendingVerification, setPendingVerification] = useState(false);

  const content = {
    title: t("auth.signUp.title"),
    subtitle: t("auth.signUp.subtitle"),
    name: t("auth.signUp.firstName"),
    email: t("auth.signUp.email"),
    password: t("auth.signUp.password"),
    signUpButton: t("auth.signUp.signUpButton"),
    haveAccount: t("auth.signUp.hasAccount"),
    signIn: t("auth.signUp.signIn"),
    verifyEmail: t("auth.signUp.verifyEmail"),
    verifyEmailDesc: t("auth.signUp.verifyEmailDesc"),
    verificationCode: t("auth.signUp.verificationCode"),
    verify: t("auth.signUp.verify"),
    terms: t("auth.signUp.terms"),
    orContinueWith: t("auth.signUp.orContinueWith"),
  };

  // Initialize main sign-up form
  const signUpForm = useAuthForm<SignUpFormData>(
    {
      firstName: '',
      email: '',
      password: '',
    },
    {
      firstName: AUTH_VALIDATION.firstName,
      email: AUTH_VALIDATION.email,
      password: AUTH_VALIDATION.password,
    },
    async (data) => {
      await onSignUpPress(data);
    }
  );

  // Initialize verification form
  const verificationForm = useAuthForm<VerificationFormData>(
    {
      code: '',
    },
    {
      code: {
        rules: [{ validate: (value: string) => value.length === 6, message: () => 'Verification code must be 6 digits' }],
        required: true,
      },
    },
    async (data) => {
      await onPressVerify(data.code);
    }
  );

  const onSignUpPress = async (data: SignUpFormData) => {
    if (!isLoaded || !signUp) return;

    try {
      // Only send the fields that are enabled for this Clerk instance.
      // Passing firstName/lastName triggers a "first_name is not a valid parameter" error
      // because the instance has those attributes disabled.
      await signUp.create({
        emailAddress: data.email.trim().toLowerCase(),
        password: data.password,
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
        
      throw new Error(errorMessage);
    }
  };

  const onOAuthPress = async (strategy: OAuthStrategy) => {
    await authenticateWithOAuth(strategy, isLoaded, setActive);
  };

  const onPressVerify = async (code: string) => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      
      // Navigate to tabs - the tabs layout will handle user creation and onboarding redirect
      router.replace("/(tabs)");
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.message || t("Verification failed", { 
        en: "Invalid verification code", 
        ar: "رمز التحقق غير صحيح" 
      });
      
      throw new Error(errorMessage);
    }
  };

  return (
    <FormScreen 
      title={pendingVerification ? content.verifyEmail : content.title}
      subtitle={pendingVerification ? content.verifyEmailDesc : content.subtitle}
    >
      <View style={commonStyles.header}>
        <Image 
          source="sf:brain.head.profile" 
          size={60} 
          tintColor={colors.wellness.calm}
          style={commonStyles.logo}
        />
      </View>

      {!pendingVerification ? (
        <>
          <View style={commonStyles.form}>
            {/* First Name Field */}
            <NameField
              name="firstName"
              label={content.name}
              placeholder={content.name}
              {...signUpForm.getFieldProps('firstName')}
              variant="default"
              required
            />

            {/* Email Field */}
            <EmailField
              name="email"
              label={content.email}
              placeholder={content.email}
              {...signUpForm.getFieldProps('email')}
              variant="default"
              required
            />

            {/* Password Field */}
            <PasswordField
              name="password"
              label={content.password}
              placeholder={content.password}
              {...signUpForm.getFieldProps('password')}
              variant="default"
              required
            />

            <Text style={createStyles({ spacing, fontSize, colors }).terms}>{content.terms}</Text>

            {/* Sign Up Button */}
            <PrimaryButton
              title={content.signUpButton}
              onPress={signUpForm.submitForm}
              disabled={!signUpForm.canSubmit}
              loading={signUpForm.isSubmitting}
              fullWidth
              style={createStyles({ spacing, fontSize, colors }).submitButton}
            />

            {/* OAuth Section */}
            <View style={commonStyles.divider}>
              <View style={commonStyles.dividerLine} />
              <Text style={commonStyles.dividerText}>{content.orContinueWith}</Text>
              <View style={commonStyles.dividerLine} />
            </View>

            <View style={createStyles({ spacing, fontSize, colors }).socialButtons}>
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
          </View>

          <View style={commonStyles.footer}>
            <Text style={commonStyles.footerText}>{content.haveAccount}</Text>
            <SecondaryButton
              title={content.signIn}
              onPress={() => router.back()}
              variant="tertiary"
            />
          </View>
        </>
      ) : (
        <View style={commonStyles.form}>
          {/* Verification Code Field */}
          <VerificationCodeField
            name="code"
            label={content.verificationCode}
            placeholder="123456"
            {...verificationForm.getFieldProps('code')}
            variant="default"
            required
          />

          {/* Verify Button */}
          <PrimaryButton
            title={content.verify}
            onPress={verificationForm.submitForm}
            disabled={!verificationForm.canSubmit}
            loading={verificationForm.isSubmitting}
            fullWidth
            style={createStyles({ spacing, fontSize, colors }).submitButton}
          />
        </View>
      )}
    </FormScreen>
  );
}

const createStyles = ({ spacing, fontSize, colors }: {
  spacing: ReturnType<typeof useAppTheme>['spacing'];
  fontSize: ReturnType<typeof useAppTheme>['fontSize'];
  colors: ReturnType<typeof useAppTheme>['colors'];
}) => ({
  terms: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    textAlign: "center" as const,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },
  socialButtons: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});