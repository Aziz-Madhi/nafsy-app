import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "@/components/core/Image/Image";
import { useTranslation } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";
import { QuickReplySuggestions } from "@/components/chat/QuickReplySuggestions";
import { TypingIndicator } from "@/components/chat/TypingIndicator";

interface OnboardingStep {
  id: string;
  question: string;
  quickReplies?: string[];
  inputType?: "text" | "time" | "select";
  dataKey: string;
  validator?: (value: string) => boolean;
  nextStep?: (value: string) => string | null;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  quickReplies?: string[];
  inputType?: "text" | "time" | "select";
}

export default function OnboardingChatScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const { t: _t, locale } = useTranslation();
  const { theme: _theme, styles: commonStyles, spacing, fontSize, fontWeight, colors, borderRadius } = useAppTheme();
  
  const completeOnboardingMutation = useMutation(api.users.completeOnboarding);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  // Define onboarding conversation flow
  const onboardingSteps: OnboardingStep[] = useMemo(() => [
    {
      id: "welcome",
      question: locale === "ar" 
        ? `مرحباً! أنا نفسي، رفيقك في رحلة الصحة النفسية 👋`
        : `Hi! I'm Nafsy, your mental wellness companion 👋`,
      quickReplies: locale === "ar" ? ["مرحباً! 👋"] : ["Hello! 👋"],
      dataKey: "started",
      nextStep: () => "askName",
    },
    {
      id: "askName",
      question: locale === "ar" ? "ما اسمك؟" : "What should I call you?",
      inputType: "text",
      dataKey: "displayName",
      validator: (value) => value.trim().length > 0,
      nextStep: () => "greetUser",
    },
    {
      id: "greetUser",
      question: locale === "ar" 
        ? `سعيد بلقائك، ${collectedData.displayName}! 😊`
        : `Nice to meet you, ${collectedData.displayName}! 😊`,
      dataKey: "greeted",
      nextStep: () => "askMood",
    },
    {
      id: "askMood",
      question: locale === "ar" 
        ? "كيف تشعر اليوم؟"
        : "How are you feeling today?",
      quickReplies: locale === "ar" 
        ? ["رائع 😊", "جيد 😐", "ليس جيداً 😔", "أحتاج للمساعدة 🆘"]
        : ["Great 😊", "Okay 😐", "Not great 😔", "Need help 🆘"],
      dataKey: "initialMood",
      nextStep: (value) => {
        if (value.includes("🆘")) return "offerCrisisSupport";
        return "askGoals";
      },
    },
    {
      id: "offerCrisisSupport",
      question: locale === "ar"
        ? "أنا هنا لدعمك. إذا كنت في أزمة، يرجى الاتصال بخط المساعدة المحلي. هل تريد المتابعة؟"
        : "I'm here to support you. If you're in crisis, please reach out to a local helpline. Would you like to continue?",
      quickReplies: locale === "ar" ? ["نعم، تابع", "لا، شكراً"] : ["Yes, continue", "No, thanks"],
      dataKey: "crisisAcknowledged",
      nextStep: (value) => {
        if (value.includes(locale === "ar" ? "نعم" : "Yes")) return "askGoals";
        return null; // End onboarding
      },
    },
    {
      id: "askGoals",
      question: locale === "ar"
        ? "ما الذي يجلبك إلى نفسي؟"
        : "What brings you to Nafsy?",
      quickReplies: locale === "ar"
        ? ["إدارة التوتر", "تتبع المزاج", "بناء العادات", "مجرد استكشاف"]
        : ["Manage stress", "Track moods", "Build habits", "Just exploring"],
      dataKey: "primaryGoal",
      nextStep: () => "askNotifications",
    },
    {
      id: "askNotifications",
      question: locale === "ar"
        ? "هل تريد تذكيرات يومية لتسجيل مزاجك؟"
        : "Would you like daily check-in reminders?",
      quickReplies: locale === "ar" 
        ? ["نعم، من فضلك!", "ربما لاحقاً"]
        : ["Yes, please!", "Maybe later"],
      dataKey: "enableNotifications",
      nextStep: (value) => {
        const wantsNotifications = value.includes(locale === "ar" ? "نعم" : "Yes");
        setCollectedData(prev => ({ ...prev, enableNotifications: wantsNotifications }));
        return wantsNotifications ? "askNotificationTime" : "explainPrivacy";
      },
    },
    {
      id: "askNotificationTime",
      question: locale === "ar"
        ? "ما هو أفضل وقت لتذكيرك؟"
        : "What time works best for you?",
      quickReplies: ["9:00 AM", "12:00 PM", "6:00 PM", "9:00 PM"],
      dataKey: "dailyCheckInTime",
      nextStep: () => "explainPrivacy",
    },
    {
      id: "explainPrivacy",
      question: locale === "ar"
        ? "خصوصيتك مهمة لنا. كل ما تشاركه مشفر وخاص. 🔒"
        : "Your privacy matters to us. Everything you share is encrypted and private. 🔒",
      dataKey: "privacyAcknowledged",
      nextStep: () => "readyToStart",
    },
    {
      id: "readyToStart",
      question: locale === "ar"
        ? "مستعد لبدء رحلتك الصحية؟"
        : "Ready to start your wellness journey?",
      quickReplies: locale === "ar" ? ["هيا بنا! 🚀"] : ["Let's go! 🚀"],
      dataKey: "completed",
      nextStep: () => null,
    },
  ], [locale, collectedData.displayName]);

  // Initialize first message
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        addBotMessage(onboardingSteps[0]);
      }, 500);
    }
  }, [messages.length, addBotMessage, onboardingSteps]);

  // Animate message entrance
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 300 });
    slideAnim.value = withTiming(0, { duration: 300 });
  }, [messages.length, fadeAnim, slideAnim]);

  const addBotMessage = useCallback((step: OnboardingStep) => {
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      const newMessage: Message = {
        id: `bot-${Date.now()}`,
        text: step.question,
        isBot: true,
        timestamp: new Date(),
        quickReplies: step.quickReplies,
        inputType: step.inputType,
      };
      
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    }, 1000);
  }, []);

  const handleUserResponse = async (response: string, step: OnboardingStep) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: response,
      isBot: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    
    // Store response data
    if (step.dataKey !== "started" && step.dataKey !== "greeted" && 
        step.dataKey !== "privacyAcknowledged" && step.dataKey !== "completed") {
      setCollectedData(prev => ({ ...prev, [step.dataKey]: response }));
    }
    
    // Determine next step
    const nextStepId = step.nextStep?.(response);
    
    if (nextStepId) {
      const nextStepIndex = onboardingSteps.findIndex(s => s.id === nextStepId);
      if (nextStepIndex !== -1) {
        setCurrentStepIndex(nextStepIndex);
        setTimeout(() => {
          addBotMessage(onboardingSteps[nextStepIndex]);
        }, 500);
      }
    } else {
      // Onboarding complete
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (!user || !isAuthenticated) {
      console.error("Cannot complete onboarding: user not authenticated");
      return;
    }

    setIsLoading(true);
    
    try {
      // Process collected data into preferences
      const preferences = {
        dailyCheckInTime: collectedData.dailyCheckInTime || "09:00",
        enableNotifications: collectedData.enableNotifications || false,
        voiceEnabled: false, // Can add this to the flow later
        theme: "auto" as const,
      };

      // Complete onboarding with collected data
      await completeOnboardingMutation({
        clerkId: user.id,
        language: locale,
        preferences,
        displayName: collectedData.displayName,
        primaryGoal: collectedData.primaryGoal,
        initialMood: collectedData.initialMood,
      });

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Onboarding error:", error);
      // Show error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: locale === "ar" 
          ? "حدث خطأ. يرجى المحاولة مرة أخرى."
          : "Something went wrong. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    const currentStep = onboardingSteps[currentStepIndex];
    
    if (currentStep.validator && !currentStep.validator(inputText)) {
      return; // Don't send if validation fails
    }
    
    handleUserResponse(inputText, currentStep);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const renderMessage = (message: Message) => {
    const isRTL = locale === "ar";
    
    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isBot ? styles.botMessageContainer : styles.userMessageContainer,
          isRTL && styles.rtlContainer,
          animatedStyle,
        ]}
      >
        {message.isBot ? <View style={[styles.botAvatar, isRTL && styles.rtlAvatar]}>
            <Image 
              source="sf:heart.circle.fill" 
              size={32} 
              tintColor={colors.wellness.calm}
            />
          </View> : null}
        
        <View style={[
          styles.messageBubble,
          message.isBot ? styles.botBubble : styles.userBubble,
        ]}>
          <Text style={[
            styles.messageText,
            message.isBot ? styles.botText : styles.userText,
            isRTL && styles.rtlText,
          ]}>
            {message.text}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const styles = createStyles({ spacing, fontSize, fontWeight, colors, borderRadius });

  return (
    <SafeAreaView style={commonStyles.container} testID="onboarding-screen">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {locale === "ar" ? "مرحباً بك في نفسي" : "Welcome to Nafsy"}
          </Text>
          
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStepIndex && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isTyping ? <View style={styles.typingContainer}>
              <TypingIndicator visible={true} />
            </View> : null}
        </ScrollView>

        {/* Quick Replies */}
        {messages.length > 0 && 
         messages[messages.length - 1].quickReplies && 
         !isTyping ? <View style={styles.quickRepliesContainer}>
            <QuickReplySuggestions
              suggestions={messages[messages.length - 1].quickReplies!.map((text, index) => ({
                id: `suggestion-${index}`,
                text,
                sentiment: 'neutral' as const
              }))}
              onSelect={(suggestion) => 
                handleUserResponse(suggestion, onboardingSteps[currentStepIndex])
              }
              mode="traditional"
              isVisible={true}
            />
          </View> : null}

        {/* Input */}
        {messages.length > 0 && 
         messages[messages.length - 1].inputType === "text" && 
         !isTyping && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={locale === "ar" ? "اكتب رسالتك..." : "Type your message..."}
              placeholderTextColor={colors.text.secondary}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              editable={!isLoading}
            />
            
            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.background.primary} />
              ) : (
                <Image 
                  source="sf:arrow.up.circle.fill" 
                  size={32} 
                  tintColor={inputText.trim() ? colors.interactive.primary : colors.text.tertiary}
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = ({ spacing, fontSize, fontWeight, colors, borderRadius }: {
  spacing: ReturnType<typeof useAppTheme>['spacing'];
  fontSize: ReturnType<typeof useAppTheme>['fontSize'];
  fontWeight: ReturnType<typeof useAppTheme>['fontWeight'];
  colors: ReturnType<typeof useAppTheme>['colors'];
  borderRadius: ReturnType<typeof useAppTheme>['borderRadius'];
}) => ({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.system.separator,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: "center" as const,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: spacing.xs,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.system.separator,
  },
  progressDotActive: {
    backgroundColor: colors.interactive.primary,
    width: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  botMessageContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
  },
  userMessageContainer: {
    alignItems: "flex-end" as const,
  },
  botAvatar: {
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  botBubble: {
    backgroundColor: colors.background.secondary,
  },
  userBubble: {
    backgroundColor: colors.interactive.primary,
  },
  messageText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  botText: {
    color: colors.text.primary,
  },
  userText: {
    color: colors.text.inverse,
  },
  typingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingLeft: spacing.xl + spacing.md,
  },
  quickRepliesContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.system.separator,
  },
  textInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    fontSize: fontSize.md,
  },
  sendButton: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  rtlContainer: {
    flexDirection: "row-reverse" as const,
  },
  rtlAvatar: {
    marginRight: 0,
    marginLeft: spacing.sm,
  },
  rtlText: {
    textAlign: "right" as const,
    writingDirection: "rtl" as const,
  },
});