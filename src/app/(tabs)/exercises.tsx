import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslation, useLocale } from "@/hooks/useLocale";
import { BaseScreen } from "@/components/layout/BaseScreen";
import { useTheme } from "@/theme";
import { ExerciseCard, ExerciseCardSkeleton } from "@/components/exercises/ExerciseCard";
import { SwipeableExerciseCard } from "@/components/exercises/SwipeableExerciseCard";
import { ExercisePlayer } from "@/components/exercises/ExercisePlayer";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { GlassmorphicCard } from "@/components/ui/GlassmorphicCard";
import { LiquidTab } from "@/components/ui/LiquidTab";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useUser } from "@clerk/clerk-expo";
import { BlurView } from 'expo-blur';
import { useExerciseRecommendations } from "@/hooks/useAIActions";
import { Id } from "@/convex/_generated/dataModel";
import { LinearGradient } from 'expo-linear-gradient';

// Define exercise data
const EXERCISES = {
  breathing: [
    {
      id: 'box-breathing',
      title: { en: 'Box Breathing', ar: 'التنفس الصندوقي' },
      description: { en: 'Calm your mind with rhythmic breathing', ar: 'اهدئ عقلك بالتنفس المنتظم' },
      duration: '5 min',
      type: 'breathing' as const,
      difficulty: 'beginner' as const,
      icon: 'wind',
      gradient: ['#6495ED', '#4169E1'] as [string, string],
      pattern: { inhale: 4, hold: 4, exhale: 4 },
    },
    {
      id: '478-breathing',
      title: { en: '4-7-8 Breathing', ar: 'تنفس 4-7-8' },
      description: { en: 'Quick relaxation technique', ar: 'تقنية استرخاء سريعة' },
      duration: '3 min',
      type: 'breathing' as const,
      difficulty: 'intermediate' as const,
      icon: 'leaf',
      gradient: ['#4ADE80', '#22C55E'] as [string, string],
      pattern: { inhale: 4, hold: 7, exhale: 8 },
    },
  ],
  grounding: [
    {
      id: '54321-grounding',
      title: { en: '5-4-3-2-1 Grounding', ar: 'تقنية 5-4-3-2-1' },
      description: { en: 'Connect with your senses', ar: 'تواصل مع حواسك' },
      duration: '7 min',
      type: 'grounding' as const,
      difficulty: 'beginner' as const,
      icon: 'hand.raised',
      gradient: ['#F59E0B', '#EF4444'] as [string, string],
      steps: {
        en: [
          'Name 5 things you can see around you',
          'Name 4 things you can touch or feel',
          'Name 3 things you can hear',
          'Name 2 things you can smell',
          'Name 1 thing you can taste',
        ],
        ar: [
          'اذكر 5 أشياء يمكنك رؤيتها حولك',
          'اذكر 4 أشياء يمكنك لمسها أو الشعور بها',
          'اذكر 3 أشياء يمكنك سماعها',
          'اذكر شيئين يمكنك شمهما',
          'اذكر شيئاً واحداً يمكنك تذوقه',
        ],
      },
    },
  ],
  thoughtChallenge: [
    {
      id: 'thought-record',
      title: { en: 'Thought Challenge', ar: 'تحدي الأفكار' },
      description: { en: 'Examine and reframe negative thoughts', ar: 'افحص وأعد صياغة الأفكار السلبية' },
      duration: '10 min',
      type: 'thoughtChallenge' as const,
      difficulty: 'advanced' as const,
      icon: 'brain',
      gradient: ['#8B5CF6', '#7C3AED'] as [string, string],
      steps: {
        en: [
          'Identify the negative thought',
          'Rate your emotions (0-10)',
          'List evidence supporting the thought',
          'List evidence against the thought',
          'Create a balanced thought',
          'Re-rate your emotions',
        ],
        ar: [
          'حدد الفكرة السلبية',
          'قيم مشاعرك (0-10)',
          'اكتب الأدلة التي تدعم الفكرة',
          'اكتب الأدلة التي تعارض الفكرة',
          'اصنع فكرة متوازنة',
          'أعد تقييم مشاعرك',
        ],
      },
    },
  ],
  gratitude: [
    {
      id: 'gratitude-journal',
      title: { en: 'Gratitude Journal', ar: 'يوميات الامتنان' },
      description: { en: 'Focus on positive moments', ar: 'ركز على اللحظات الإيجابية' },
      duration: '5 min',
      type: 'gratitude' as const,
      difficulty: 'beginner' as const,
      icon: 'heart.fill',
      gradient: ['#EC4899', '#DB2777'] as [string, string],
      steps: {
        en: [
          'Think of 3 things you are grateful for today',
          'Write why you are grateful for each',
          'Notice how you feel after reflecting',
        ],
        ar: [
          'فكر في 3 أشياء أنت ممتن لها اليوم',
          'اكتب لماذا أنت ممتن لكل منها',
          'لاحظ كيف تشعر بعد التأمل',
        ],
      },
    },
  ],
};

export default function ExercisesScreen() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { colors, isDark } = useTheme();
  const { user: clerkUser } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Fetch user data
  const user = useQuery(api.users.getUserByClerkId, 
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  
  // Fetch exercise history
  const exerciseHistory = useQuery(api.exercises.getUserExercises,
    user?._id ? { userId: user._id, limit: 50 } : "skip"
  );
  
  const exerciseStats = useQuery(api.exercises.getExerciseStats,
    user?._id ? { userId: user._id, days: 30 } : "skip"
  );
  
  // Get latest mood for AI recommendations
  const latestMood = useQuery(api.moods.getLatestMood,
    user?._id ? { userId: user._id } : "skip"
  );
  
  // AI Exercise recommendations
  const { execute: getRecommendation, data: recommendation } = useExerciseRecommendations();
  
  useEffect(() => {
    // Get AI recommendation when user and mood data is available
    if (user?._id && latestMood) {
      getRecommendation({
        userId: user._id,
        currentMood: latestMood.rating,
        recentEmotions: latestMood.factors || [],
        language: locale,
      });
    }
  }, [user?._id, latestMood, getRecommendation, locale]);
  
  // Categories
  const categories = [
    { id: 'all', label: { en: 'All', ar: 'الكل' }, icon: 'square.grid.2x2' },
    { id: 'breathing', label: { en: 'Breathing', ar: 'التنفس' }, icon: 'wind' },
    { id: 'grounding', label: { en: 'Grounding', ar: 'التأريض' }, icon: 'hand.raised' },
    { id: 'thoughtChallenge', label: { en: 'Thoughts', ar: 'الأفكار' }, icon: 'brain' },
    { id: 'gratitude', label: { en: 'Gratitude', ar: 'الامتنان' }, icon: 'heart.fill' },
  ];
  
  // Get exercises based on selected category
  const getFilteredExercises = () => {
    if (selectedCategory === 'all') {
      return Object.values(EXERCISES).flat();
    }
    return EXERCISES[selectedCategory as keyof typeof EXERCISES] || [];
  };
  
  // Get exercise completion data
  const getExerciseData = (exerciseId: string) => {
    if (!exerciseHistory) return {};
    
    const completions = exerciseHistory.filter(h => h.type === exerciseId);
    const effectivenessScores = completions
      .map(c => c.data.effectiveness || c.data.outputs?.effectiveness)
      .filter(score => score !== undefined) as number[];
    
    return {
      completedCount: completions.length,
      lastCompleted: completions[0]?.completedAt,
      effectiveness: effectivenessScores.length > 0
        ? Math.round(effectivenessScores.reduce((a, b) => a + b, 0) / effectivenessScores.length)
        : undefined,
    };
  };
  
  const handleExerciseComplete = (effectiveness?: number) => {
    setShowPlayer(false);
    setSelectedExercise(null);
    
    // Refresh data
    if (user?._id) {
      // Could show a success message or update UI
    }
  };

  const handleFavoriteToggle = (exerciseId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(exerciseId)) {
        newFavorites.delete(exerciseId);
      } else {
        newFavorites.add(exerciseId);
      }
      return newFavorites;
    });
  };

  const handleQuickComplete = (exercise: any) => {
    // TODO: Implement quick complete functionality
    // This could create a minimal exercise session record
    console.log('Quick complete:', exercise.id);
  };
  
  // Show loading state
  if (!user && clerkUser) {
    return (
      <BaseScreen scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
        </View>
      </BaseScreen>
    );
  }
  
  return (
    <BaseScreen scrollable={true}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {locale === 'ar' ? 'تمارين العافية' : 'Wellness Exercises'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {locale === 'ar' ? 'تقنيات مثبتة علمياً لصحتك النفسية' : 'Evidence-based techniques for your mental health'}
          </Text>
        </View>
        
        {/* Stats Banner */}
        {exerciseStats && exerciseStats.totalExercises > 0 ? <View style={[styles.statsBanner, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.interactive.primary }]}>
                {exerciseStats.totalExercises}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                {locale === 'ar' ? 'تمرين مكتمل' : 'Completed'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.interactive.secondary }]}>
                {Math.round(exerciseStats.totalDuration / 60)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                {locale === 'ar' ? 'دقيقة' : 'Minutes'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.starsContainer}>
                {Array.from({ length: 5 }, (_, i) => (
                  <IconSymbol
                    key={i}
                    name="star.fill"
                    size={14}
                    color={i < Math.round(exerciseStats.averageEffectiveness) ? '#FFB800' : colors.text.tertiary}
                  />
                ))}
              </View>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                {locale === 'ar' ? 'التقييم' : 'Rating'}
              </Text>
            </View>
          </View> : null}
        
        {/* Enhanced Category Filters with LiquidTab */}
        <View style={styles.categoriesContainer}>
          <LiquidTab
            tabs={categories.map(cat => ({
              id: cat.id,
              label: cat.label[locale],
              icon: cat.icon,
            }))}
            selectedTab={selectedCategory}
            onTabChange={setSelectedCategory}
            style={styles.liquidTabContainer}
          />
        </View>
        
        {/* Enhanced Exercise Grid with Swipeable Cards */}
        <View style={styles.exercisesGrid}>
          {getFilteredExercises().map((exercise, index) => {
            const exerciseData = getExerciseData(exercise.id);
            const isRecommended = recommendation?.type === exercise.type;
            const isFavorited = favorites.has(exercise.id);
            
            return (
              <SwipeableExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPress={() => {
                  setSelectedExercise(exercise);
                  setShowPlayer(true);
                }}
                onFavorite={() => handleFavoriteToggle(exercise.id)}
                onComplete={() => handleQuickComplete(exercise)}
                isRecommended={isRecommended}
                isFavorited={isFavorited}
                completedCount={exerciseData.completedCount}
                lastCompleted={exerciseData.lastCompleted}
                effectiveness={exerciseData.effectiveness}
              />
            );
          })}
        </View>
        
        {/* Enhanced AI Recommendation Banner */}
        {recommendation ? <GlassmorphicCard
            style={styles.recommendationBanner}
            gradient={true}
            gradientColors={[
              isDark ? 'rgba(100, 149, 237, 0.2)' : 'rgba(100, 149, 237, 0.15)',
              isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)'
            ]}
            borderRadius={20}
            elevation={2}
          >
            <IconSymbol name="sparkles" size={20} color={colors.interactive.primary} />
            <Text style={[styles.recommendationText, { color: colors.text.primary }]}>
              {recommendation.reason}
            </Text>
          </GlassmorphicCard> : null}
      </ScrollView>
      
      {/* Exercise Player Modal */}
      {showPlayer && selectedExercise && user?._id ? <ExercisePlayer
          exercise={selectedExercise}
          userId={user._id}
          onComplete={handleExerciseComplete}
          onCancel={() => {
            setShowPlayer(false);
            setSelectedExercise(null);
          }}
        /> : null}
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  categoriesContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  liquidTabContainer: {
    marginHorizontal: 0,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  exercisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 16,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
});