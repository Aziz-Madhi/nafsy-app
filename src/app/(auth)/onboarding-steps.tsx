import React, { useState, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "@/components/ui/img";
import { useTranslation } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";

interface OnboardingData {
  displayName: string;
  initialMood: string;
  primaryGoal: string;
  enableNotifications: boolean;
  dailyCheckInTime: string;
}

type OnboardingStep = 
  | "welcome"
  | "name" 
  | "mood"
  | "goals"
  | "notifications"
  | "notificationTime"
  | "privacy"
  | "complete";

export default function OnboardingStepsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const { t, locale } = useTranslation();
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useAppTheme();
  
  const completeOnboardingMutation = useMutation(api.users.completeOnboarding);
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    initialMood: "",
    primaryGoal: "",
    enableNotifications: false,
    dailyCheckInTime: "09:00",
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const steps: OnboardingStep[] = React.useMemo(() => [
    "welcome", "name", "mood", "goals", "notifications", "notificationTime", "privacy", "complete"
  ], []);
  
  const currentStepIndex = React.useMemo(() => steps.indexOf(currentStep), [steps, currentStep]);
  const progress = React.useMemo(() => (currentStepIndex + 1) / steps.length, [currentStepIndex, steps.length]);

  // Animation when step changes
  React.useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const updateData = React.useCallback((key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const goToNext = React.useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [steps, currentStep]);

  const goToPrevious = React.useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [steps, currentStep]);

  const completeOnboarding = React.useCallback(async () => {
    if (!user || !isAuthenticated) {
      Alert.alert(
        t("error"),
        locale === "ar" ? "خطأ في المصادقة" : "Authentication error"
      );
      return;
    }

    setIsLoading(true);
    
    try {
      const preferences = {
        dailyCheckInTime: data.dailyCheckInTime,
        enableNotifications: data.enableNotifications,
        voiceEnabled: false,
        theme: "auto" as const,
      };

      await completeOnboardingMutation({
        clerkId: user.id,
        language: locale,
        preferences,
        displayName: data.displayName,
        primaryGoal: data.primaryGoal,
        initialMood: data.initialMood,
      });

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Onboarding error:", error);
      Alert.alert(
        t("error"),
        locale === "ar" 
          ? "حدث خطأ. يرجى المحاولة مرة أخرى."
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, t, locale, data, completeOnboardingMutation, router]);

  const canContinue = React.useMemo(() => {
    switch (currentStep) {
      case "name":
        return data.displayName.trim().length > 0;
      case "mood":
        return data.initialMood.length > 0;
      case "goals":
        return data.primaryGoal.length > 0;
      case "notificationTime":
        return data.enableNotifications ? data.dailyCheckInTime.length > 0 : true;
      default:
        return true;
    }
  }, [currentStep, data.displayName, data.initialMood, data.primaryGoal, data.enableNotifications, data.dailyCheckInTime]);

  const handleContinue = React.useCallback(() => {
    if (currentStep === "complete") {
      completeOnboarding();
    } else if (currentStep === "notifications" && !data.enableNotifications) {
      // Skip notification time if notifications are disabled
      const nextIndex = steps.indexOf("notificationTime") + 1;
      setCurrentStep(steps[nextIndex]);
    } else {
      goToNext();
    }
  }, [currentStep, data.enableNotifications, steps, goToNext, completeOnboarding]);

  const styles = React.useMemo(() => 
    createStyles({ colors, spacing, fontSize, fontWeight, borderRadius }),
    [colors, spacing, fontSize, fontWeight, borderRadius]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: `${Math.round(progress * 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentStepIndex + 1} / {steps.length}
        </Text>
      </View>

      {/* Step Content */}
      <Animated.View 
        style={[
          styles.stepContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        {currentStepIndex > 0 && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={goToPrevious}
          >
            <Image
              source={locale === "ar" ? "sf:chevron.right" : "sf:chevron.left"}
              size={20}
              tintColor={colors.text.secondary}
            />
            <Text style={styles.backButtonText}>
              {locale === "ar" ? "السابق" : "Back"}
            </Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.spacer} />
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!canContinue || isLoading}
        >
          <Text style={styles.continueButtonText}>
            {currentStep === "complete" 
              ? (locale === "ar" ? "إنهاء الإعداد" : "Finish Setup")
              : (locale === "ar" ? "متابعة" : "Continue")
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  function renderStepContent() {
    switch (currentStep) {
      case "welcome":
        return (
          <View style={styles.stepContent}>
            <Image 
              source="sf:brain.head.profile" 
              size={80} 
              tintColor={colors.wellness.calm}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>
              {locale === "ar" ? "مرحباً بك في نفسي" : "Welcome to Nafsy"}
            </Text>
            <Text style={styles.stepDescription}>
              {locale === "ar" 
                ? "رفيقك الذكي للصحة النفسية. دعنا نتعرف عليك لنقدم لك تجربة شخصية مميزة."
                : "Your AI-powered mental wellness companion. Let's get to know you to provide a personalized experience."
              }
            </Text>
          </View>
        );

      case "name":
        return (
          <View style={styles.stepContent}>
            <Image 
              source="sf:person.circle" 
              size={60} 
              tintColor={colors.interactive.primary}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>
              {locale === "ar" ? "ما اسمك؟" : "What's your name?"}
            </Text>
            <Text style={styles.stepDescription}>
              {locale === "ar" 
                ? "سنستخدم اسمك لنجعل تجربتك أكثر شخصية."
                : "We'll use your name to make your experience more personal."
              }
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={locale === "ar" ? "اكتب اسمك هنا" : "Enter your name"}
              placeholderTextColor={colors.text.placeholder}
              value={data.displayName}
              onChangeText={(text) => updateData("displayName", text)}
              textAlign={locale === "ar" ? "right" : "left"}
              autoCapitalize="words"
            />
          </View>
        );

      case "mood":
        return (
          <View style={styles.stepContent}>
            <Image 
              source="sf:heart.circle" 
              size={60} 
              tintColor={colors.wellness.energetic}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>
              {locale === "ar" ? "كيف تشعر اليوم؟" : "How are you feeling today?"}
            </Text>
            <Text style={styles.stepDescription}>
              {locale === "ar" 
                ? "هذا سيساعدنا في فهم حالتك المزاجية الحالية."
                : "This helps us understand your current mood state."
              }
            </Text>
            <View style={styles.optionsGrid}>
              {[
                { 
                  key: "great", 
                  icon: "sf:face.smiling", 
                  label: locale === "ar" ? "رائع" : "Great",
                  color: colors.wellness.energetic 
                },
                { 
                  key: "good", 
                  icon: "sf:face.smiling", 
                  label: locale === "ar" ? "جيد" : "Good",
                  color: colors.wellness.calm 
                },
                { 
                  key: "okay", 
                  icon: "sf:minus.circle", 
                  label: locale === "ar" ? "عادي" : "Okay",
                  color: colors.text.secondary 
                },
                { 
                  key: "notGreat", 
                  icon: "sf:face.dashed", 
                  label: locale === "ar" ? "ليس جيداً" : "Not great",
                  color: colors.mood.bad 
                },
              ].map((mood) => (
                <TouchableOpacity
                  key={mood.key}
                  style={[
                    styles.optionCard,
                    data.initialMood === mood.key && styles.optionCardSelected
                  ]}
                  onPress={() => updateData("initialMood", mood.key)}
                >
                  <Image 
                    source={mood.icon} 
                    size={32} 
                    tintColor={data.initialMood === mood.key ? colors.text.inverse : mood.color}
                  />
                  <Text style={[
                    styles.optionText,
                    data.initialMood === mood.key && styles.optionTextSelected
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "goals":
        return (
          <View style={styles.stepContent}>
            <Image 
              source="sf:target" 
              size={60} 
              tintColor={colors.interactive.primary}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>
              {locale === "ar" ? "ما الذي يجلبك إلى نفسي؟" : "What brings you to Nafsy?"}
            </Text>
            <Text style={styles.stepDescription}>
              {locale === "ar" 
                ? "اختر هدفك الأساسي لنخصص تجربتك وفقاً لاحتياجاتك."
                : "Choose your primary goal so we can tailor your experience."
              }
            </Text>
            <View style={styles.optionsList}>
              {[
                { 
                  key: "stress", 
                  icon: "sf:wind", 
                  label: locale === "ar" ? "إدارة التوتر" : "Manage stress",
                  description: locale === "ar" ? "تقنيات للاسترخاء والهدوء" : "Relaxation and calming techniques"
                },
                { 
                  key: "mood", 
                  icon: "sf:chart.line.uptrend.xyaxis", 
                  label: locale === "ar" ? "تتبع المزاج" : "Track moods",
                  description: locale === "ar" ? "فهم أنماط مزاجك" : "Understand your mood patterns"
                },
                { 
                  key: "habits", 
                  icon: "sf:checkmark.circle", 
                  label: locale === "ar" ? "بناء العادات" : "Build habits",
                  description: locale === "ar" ? "تطوير روتين صحي" : "Develop healthy routines"
                },
                { 
                  key: "exploring", 
                  icon: "sf:sparkles", 
                  label: locale === "ar" ? "مجرد استكشاف" : "Just exploring",
                  description: locale === "ar" ? "اكتشاف ما يناسبني" : "Discover what works for me"
                },
              ].map((goal) => (
                <TouchableOpacity
                  key={goal.key}
                  style={[
                    styles.optionListItem,
                    data.primaryGoal === goal.key && styles.optionListItemSelected
                  ]}
                  onPress={() => updateData("primaryGoal", goal.key)}
                >
                  <Image 
                    source={goal.icon} 
                    size={24} 
                    tintColor={data.primaryGoal === goal.key ? colors.interactive.primary : colors.text.secondary}
                  />
                  <View style={styles.optionListContent}>
                    <Text style={[
                      styles.optionListTitle,
                      data.primaryGoal === goal.key && styles.optionListTitleSelected
                    ]}>
                      {goal.label}
                    </Text>
                    <Text style={styles.optionListDescription}>
                      {goal.description}
                    </Text>
                  </View>
                  {data.primaryGoal === goal.key && (
                    <Image 
                      source="sf:checkmark.circle.fill" 
                      size={20} 
                      tintColor={colors.interactive.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "notifications":
        return (
          <View style={styles.stepContent}>
            <Image 
              source="sf:bell.circle" 
              size={60} 
              tintColor={colors.interactive.primary}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>
              {locale === "ar" ? "تذكيرات يومية" : "Daily reminders"}
            </Text>
            <Text style={styles.stepDescription}>
              {locale === "ar" 
                ? "هل تريد تذكيرات يومية لتسجيل مزاجك والعناية بصحتك النفسية؟"
                : "Would you like daily reminders to check in with your mood and mental health?"
              }
            </Text>
            <View style={styles.toggleOptions}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  data.enableNotifications && styles.toggleOptionSelected
                ]}
                onPress={() => updateData("enableNotifications", true)}
              >
                <Image 
                  source="sf:bell.fill" 
                  size={24} 
                  tintColor={data.enableNotifications ? colors.text.inverse : colors.interactive.primary}
                />
                <Text style={[
                  styles.toggleOptionText,
                  data.enableNotifications && styles.toggleOptionTextSelected
                ]}>
                  {locale === "ar" ? "نعم، ذكرني" : "Yes, remind me"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  !data.enableNotifications && styles.toggleOptionSelected
                ]}
                onPress={() => updateData("enableNotifications", false)}
              >
                <Image 
                  source="sf:bell.slash" 
                  size={24} 
                  tintColor={!data.enableNotifications ? colors.text.inverse : colors.text.secondary}
                />
                <Text style={[
                  styles.toggleOptionText,
                  !data.enableNotifications && styles.toggleOptionTextSelected
                ]}>
                  {locale === "ar" ? "لا، ربما لاحقاً" : "No, maybe later"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "notificationTime":
        if (!data.enableNotifications) return null;
        
        return (
          <View style={styles.stepContent}>
            <Image 
              source="sf:clock.circle" 
              size={60} 
              tintColor={colors.interactive.primary}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>
              {locale === "ar" ? "أفضل وقت للتذكير" : "Best reminder time"}
            </Text>
            <Text style={styles.stepDescription}>
              {locale === "ar" 
                ? "متى تفضل أن نذكرك بتسجيل مزاجك؟"
                : "When would you prefer to be reminded to check in?"
              }
            </Text>
            <View style={styles.timeOptions}>
              {[
                { value: "09:00", label: "9:00 AM" },
                { value: "12:00", label: "12:00 PM" },
                { value: "18:00", label: "6:00 PM" },
                { value: "21:00", label: "9:00 PM" },
              ].map((time) => (
                <TouchableOpacity
                  key={time.value}
                  style={[
                    styles.timeOption,
                    data.dailyCheckInTime === time.value && styles.timeOptionSelected
                  ]}
                  onPress={() => updateData("dailyCheckInTime", time.value)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    data.dailyCheckInTime === time.value && styles.timeOptionTextSelected
                  ]}>
                    {time.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "privacy":
        return (
          <View style={styles.stepContent}>
            <Image 
              source="sf:lock.shield" 
              size={60} 
              tintColor={colors.wellness.calm}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>
              {locale === "ar" ? "خصوصيتك مهمة" : "Your privacy matters"}
            </Text>
            <Text style={styles.stepDescription}>
              {locale === "ar" 
                ? "كل ما تشاركه معنا مشفر وخاص. لن نشارك معلوماتك مع أي طرف ثالث أبداً."
                : "Everything you share is encrypted and private. We'll never share your information with third parties."
              }
            </Text>
            <View style={styles.privacyFeatures}>
              {[
                { 
                  icon: "sf:lock.fill", 
                  title: locale === "ar" ? "تشفير شامل" : "End-to-end encryption",
                  description: locale === "ar" ? "بياناتك محمية ومشفرة" : "Your data is protected and encrypted"
                },
                { 
                  icon: "sf:eye.slash.fill", 
                  title: locale === "ar" ? "لا مشاركة" : "No sharing",
                  description: locale === "ar" ? "معلوماتك لن تُشارك أبداً" : "Your information is never shared"
                },
                { 
                  icon: "sf:person.fill.checkmark", 
                  title: locale === "ar" ? "تحكم كامل" : "Full control",
                  description: locale === "ar" ? "يمكنك حذف بياناتك في أي وقت" : "You can delete your data anytime"
                },
              ].map((feature, index) => (
                <View key={index} style={styles.privacyFeature}>
                  <Image 
                    source={feature.icon} 
                    size={20} 
                    tintColor={colors.wellness.calm}
                  />
                  <View style={styles.privacyFeatureContent}>
                    <Text style={styles.privacyFeatureTitle}>{feature.title}</Text>
                    <Text style={styles.privacyFeatureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case "complete":
        return (
          <View style={styles.stepContent}>
            <Image 
              source="sf:checkmark.circle.fill" 
              size={80} 
              tintColor={colors.wellness.energetic}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>
              {locale === "ar" ? `مرحباً ${data.displayName}! 🎉` : `Welcome ${data.displayName}! 🎉`}
            </Text>
            <Text style={styles.stepDescription}>
              {locale === "ar" 
                ? "أنت جاهز الآن لبدء رحلتك مع نفسي. نحن هنا لدعمك في كل خطوة."
                : "You're all set to begin your journey with Nafsy. We're here to support you every step of the way."
              }
            </Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {locale === "ar" ? "ملخص إعداداتك:" : "Your setup summary:"}
              </Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  {locale === "ar" ? "الهدف الأساسي:" : "Primary goal:"}
                </Text>
                <Text style={styles.summaryValue}>
                  {data.primaryGoal === "stress" ? (locale === "ar" ? "إدارة التوتر" : "Manage stress") :
                   data.primaryGoal === "mood" ? (locale === "ar" ? "تتبع المزاج" : "Track moods") :
                   data.primaryGoal === "habits" ? (locale === "ar" ? "بناء العادات" : "Build habits") :
                   (locale === "ar" ? "مجرد استكشاف" : "Just exploring")}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  {locale === "ar" ? "التذكيرات:" : "Reminders:"}
                </Text>
                <Text style={styles.summaryValue}>
                  {data.enableNotifications 
                    ? `${locale === "ar" ? "مُفعلة" : "Enabled"} (${data.dailyCheckInTime})`
                    : (locale === "ar" ? "غير مُفعلة" : "Disabled")
                  }
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  }
}

const createStyles = ({ colors, spacing, fontSize, fontWeight, borderRadius }: {
  colors: any;
  spacing: any;
  fontSize: any;
  fontWeight: any;
  borderRadius: any;
}) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  progressContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.system.separator,
  },
  progressBackground: {
    flex: 1,
    height: 4,
    backgroundColor: colors.system.separator,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.interactive.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  stepContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  stepContent: {
    alignItems: "center" as const,
  },
  stepIcon: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: "center" as const,
    marginBottom: spacing.md,
  },
  stepDescription: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: "center" as const,
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  textInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: colors.system.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  optionsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.md,
    justifyContent: "center" as const,
  },
  optionCard: {
    width: "45%",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.system.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: spacing.sm,
  },
  optionCardSelected: {
    backgroundColor: colors.interactive.primary,
    borderColor: colors.interactive.primary,
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  optionTextSelected: {
    color: colors.text.inverse,
  },
  optionsList: {
    width: "100%",
    gap: spacing.sm,
  },
  optionListItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.system.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  optionListItemSelected: {
    borderColor: colors.interactive.primary,
    backgroundColor: colors.interactive.secondary,
  },
  optionListContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  optionListTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  optionListTitleSelected: {
    color: colors.interactive.primary,
  },
  optionListDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  toggleOptions: {
    width: "100%",
    gap: spacing.md,
  },
  toggleOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.system.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    gap: spacing.md,
  },
  toggleOptionSelected: {
    backgroundColor: colors.interactive.primary,
    borderColor: colors.interactive.primary,
  },
  toggleOptionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  toggleOptionTextSelected: {
    color: colors.text.inverse,
  },
  timeOptions: {
    width: "100%",
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.md,
  },
  timeOption: {
    flex: 1,
    minWidth: "45%",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.system.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: "center" as const,
  },
  timeOptionSelected: {
    backgroundColor: colors.interactive.primary,
    borderColor: colors.interactive.primary,
  },
  timeOptionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  timeOptionTextSelected: {
    color: colors.text.inverse,
  },
  privacyFeatures: {
    width: "100%",
    gap: spacing.lg,
  },
  privacyFeature: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: spacing.md,
  },
  privacyFeatureContent: {
    flex: 1,
  },
  privacyFeatureTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  privacyFeatureDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  summaryCard: {
    width: "100%",
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.system.border,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  navigationContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.system.separator,
  },
  backButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: colors.interactive.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  continueButtonDisabled: {
    backgroundColor: colors.system.separator,
  },
  continueButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.inverse,
  },
});