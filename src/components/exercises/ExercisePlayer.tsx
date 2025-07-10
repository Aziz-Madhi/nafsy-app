import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { useLocale } from '@/hooks/useLocale';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { parseDurationToSeconds } from '@/utils/helpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// GroundingExercise component moved outside to avoid nested component error
function GroundingExercise({ 
  currentStep, 
  colors, 
  locale, 
  isDark, 
  setExerciseData 
}: {
  currentStep: number;
  colors: any;
  locale: string;
  isDark: boolean;
  setExerciseData: (data: any) => void;
}) {
  const [senses, setSenses] = useState({
    see: [] as string[],
    hear: [] as string[],
    feel: [] as string[],
    smell: [] as string[],
    taste: [] as string[],
  });
  
  const senseLabels = {
    see: { en: 'Things you can see', ar: 'أشياء يمكنك رؤيتها' },
    hear: { en: 'Things you can hear', ar: 'أشياء يمكنك سماعها' },
    feel: { en: 'Things you can feel', ar: 'أشياء يمكنك لمسها' },
    smell: { en: 'Things you can smell', ar: 'أشياء يمكنك شمها' },
    taste: { en: 'Things you can taste', ar: 'أشياء يمكنك تذوقها' },
  };
  
  const senseIcons = {
    see: 'eye',
    hear: 'ear',
    feel: 'hand.raised',
    smell: 'nose',
    taste: 'mouth',
  };
  
  const senseKey = Object.keys(senses)[currentStep] as keyof typeof senses;
  
  useEffect(() => {
    setExerciseData({ senses });
  }, [senses, setExerciseData]);
  
  return (
    <View style={styles.groundingContainer}>
      <View style={styles.senseHeader}>
        <IconSymbol
          name={senseIcons[senseKey]}
          size={48}
          color={colors.interactive.primary}
        />
        <Text style={[styles.senseTitle, { color: colors.text.primary }]}>
          {senseLabels[senseKey][locale]}
        </Text>
      </View>
      
      <ScrollView style={styles.inputsList}>
        {[...Array(5 - currentStep)].map((_, index) => (
          <TextInput
            key={index}
            style={[styles.senseInput, { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: colors.text.primary,
            }]}
            placeholder={`${index + 1}...`}
            placeholderTextColor={colors.text.tertiary}
            value={senses[senseKey][index] || ''}
            onChangeText={(text) => {
              const newSenses = { ...senses };
              newSenses[senseKey][index] = text;
              setSenses(newSenses);
            }}
            textAlign={locale === 'ar' ? 'right' : 'left'}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface ExercisePlayerProps {
  exercise: {
    id: string;
    title: { en: string; ar: string };
    type: 'breathing' | 'grounding' | 'thoughtChallenge' | 'gratitude' | 'mindfulness';
    steps?: { en: string[]; ar: string[] };
    duration?: number; // in seconds
    pattern?: { inhale: number; hold: number; exhale: number }; // for breathing
  };
  userId: Id<"users">;
  conversationId?: Id<"conversations">;
  onComplete: (effectiveness?: number) => void;
  onCancel: () => void;
}

export function ExercisePlayer({
  exercise,
  userId,
  conversationId,
  onComplete,
  onCancel,
}: ExercisePlayerProps) {
  const { colors, isDark } = useTheme();
  const { locale } = useLocale();
  const insets = useSafeAreaInsets();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [exerciseData, setExerciseData] = useState<any>({});
  
  // Animations
  const breathingScale = useSharedValue(1);
  const fadeAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);
  
  const recordExercise = useMutation(api.exercises.recordExerciseCompletion);

  useEffect(() => {
    // Fade in animation
    fadeAnim.value = withTiming(1, { duration: 500 });
  }, [fadeAnim]);

  // Breathing animation
  useEffect(() => {
    if (exercise.type === 'breathing' && isPlaying && exercise.pattern) {
      const { inhale, hold, exhale } = exercise.pattern;
      
      breathingScale.value = withRepeat(
        withSequence(
          // Inhale
          withTiming(1.4, { duration: inhale * 1000 }),
          // Hold
          withTiming(1.4, { duration: hold * 1000 }),
          // Exhale
          withTiming(1, { duration: exhale * 1000 })
        ),
        -1
      );
    } else {
      breathingScale.value = withTiming(1, { duration: 300 });
    }
  }, [isPlaying, exercise.type, exercise.pattern, breathingScale]);

  const handleNext = () => {
    if (exercise.steps && currentStep < exercise.steps[locale].length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Exercise completed
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Show effectiveness rating
    if (effectiveness === null) {
      setCurrentStep(-1); // Show rating screen
      return;
    }

    // Record exercise completion
    try {
      const parsedDuration = exercise.duration ? parseDurationToSeconds(exercise.duration) : undefined;
      
      await recordExercise({
        userId,
        type: exercise.type,
        conversationId,
        duration: parsedDuration,
        data: {
          inputs: exerciseData,
          outputs: {
            effectiveness,
            completionNotes: exerciseData.notes,
          },
        },
      });
      
      onComplete(effectiveness);
    } catch (error) {
      console.error('Error recording exercise:', error);
      onComplete(effectiveness);
    }
  };

  const breathingCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathingScale.value }],
    };
  });

  const renderBreathingExercise = () => {
    const pattern = exercise.pattern || { inhale: 4, hold: 4, exhale: 4 };
    const phaseText = locale === 'ar' 
      ? ['استنشق', 'احبس النفس', 'ازفر']
      : ['Inhale', 'Hold', 'Exhale'];
    
    return (
      <View style={styles.breathingContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              backgroundColor: colors.interactive.primary,
            },
            breathingCircleStyle,
          ]}
        >
          <Text style={styles.breathingText}>
            {isPlaying ? phaseText[0] : (locale === 'ar' ? 'ابدأ' : 'Start')}
          </Text>
        </Animated.View>
        
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: colors.interactive.primary }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <IconSymbol
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={32}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        
        <Text style={[styles.instructionText, { color: colors.text.secondary }]}>
          {locale === 'ar' 
            ? `استنشق لـ ${pattern.inhale} ثوان • احبس لـ ${pattern.hold} ثوان • ازفر لـ ${pattern.exhale} ثوان`
            : `Inhale for ${pattern.inhale}s • Hold for ${pattern.hold}s • Exhale for ${pattern.exhale}s`}
        </Text>
      </View>
    );
  };


  const renderRatingScreen = () => {
    return (
      <View style={styles.ratingContainer}>
        <IconSymbol
          name="checkmark.circle.fill"
          size={64}
          color="#4ADE80"
          style={styles.completedIcon}
        />
        
        <Text style={[styles.completedTitle, { color: colors.text.primary }]}>
          {locale === 'ar' ? 'أحسنت!' : 'Well done!'}
        </Text>
        
        <Text style={[styles.ratingQuestion, { color: colors.text.secondary }]}>
          {locale === 'ar' 
            ? 'كيف كان هذا التمرين مفيداً لك؟'
            : 'How helpful was this exercise?'}
        </Text>
        
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setEffectiveness(star)}
            >
              <IconSymbol
                name={effectiveness && star <= effectiveness ? 'star.fill' : 'star'}
                size={40}
                color={effectiveness && star <= effectiveness ? '#FFB800' : colors.text.tertiary}
                style={styles.ratingStar}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.completeButton, { 
            backgroundColor: colors.interactive.primary,
            opacity: effectiveness ? 1 : 0.5,
          }]}
          onPress={handleComplete}
          disabled={!effectiveness}
        >
          <Text style={styles.completeButtonText}>
            {locale === 'ar' ? 'إنهاء' : 'Finish'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    if (currentStep === -1) {
      return renderRatingScreen();
    }
    
    switch (exercise.type) {
      case 'breathing':
        return renderBreathingExercise();
      case 'grounding':
        return <GroundingExercise 
          currentStep={currentStep}
          colors={colors}
          locale={locale}
          isDark={isDark}
          setExerciseData={setExerciseData}
        />;
      default:
        return (
          <View style={styles.defaultContent}>
            <Text style={[styles.stepText, { color: colors.text.primary }]}>
              {exercise.steps?.[locale][currentStep] || ''}
            </Text>
          </View>
        );
    }
  };

  const fadeStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  return (
    <Animated.View style={[styles.container, fadeStyle]}>
      <LinearGradient
        colors={isDark 
          ? ['#1A1A1A', '#2A2A2A', '#1A1A1A']
          : ['#F5F7FA', '#EBF0F7', '#F5F7FA']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <IconSymbol name="xmark" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {exercise.title[locale]}
            </Text>
            
            <View style={{ width: 24 }} />
          </View>
          
          {/* Progress Bar */}
          {exercise.steps && currentStep >= 0 ? <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.background.secondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.interactive.primary,
                      width: `${((currentStep + 1) / exercise.steps[locale].length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View> : null}
          
          {/* Content */}
          <KeyboardAvoidingView
            style={styles.content}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {renderContent()}
          </KeyboardAvoidingView>
          
          {/* Navigation */}
          {currentStep >= 0 && exercise.steps ? <View style={styles.navigation}>
              <TouchableOpacity
                style={[styles.navButton, { opacity: currentStep === 0 ? 0.5 : 1 }]}
                onPress={handlePrevious}
                disabled={currentStep === 0}
              >
                <IconSymbol name="chevron.left" size={24} color={colors.text.primary} />
                <Text style={[styles.navButtonText, { color: colors.text.primary }]}>
                  {locale === 'ar' ? 'السابق' : 'Previous'}
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.stepIndicator, { color: colors.text.secondary }]}>
                {currentStep + 1} / {exercise.steps[locale].length}
              </Text>
              
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton, { backgroundColor: colors.interactive.primary }]}
                onPress={handleNext}
              >
                <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
                  {currentStep === exercise.steps[locale].length - 1
                    ? (locale === 'ar' ? 'إنهاء' : 'Finish')
                    : (locale === 'ar' ? 'التالي' : 'Next')}
                </Text>
                <IconSymbol name="chevron.right" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View> : null}
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nextButton: {
    borderRadius: 12,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  stepIndicator: {
    fontSize: 14,
  },
  // Breathing Exercise
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  breathingText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Grounding Exercise
  groundingContainer: {
    flex: 1,
  },
  senseHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  senseTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },
  inputsList: {
    flex: 1,
  },
  senseInput: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  // Rating Screen
  ratingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIcon: {
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  ratingQuestion: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  ratingStar: {
    marginHorizontal: 4,
  },
  completeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Default content
  defaultContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
});