import React, { useState, useEffect, useMemo } from "react";
import { useLocale } from "@/hooks/useLocale";
import { BaseScreen } from "@/components/layout/BaseScreen";
import { 
  ExercisePlayer,
  ExercisesHeader,
  ExerciseStatsBanner,
  ExerciseCategories,
  ExerciseList,
  RecommendationBanner,
  ExerciseQuickActions
} from "@/components/exercises";
import { useExerciseRecommendations } from "@/hooks/useAIActions";
import { EXERCISES } from "@/data/exercises";
import { useUserData } from "@/hooks/useUserData";
import { useThemedGlass } from "@/hooks/useThemedGlass";
import { useLoadingScreen } from "@/hooks/useLoadingScreen";
import { translations } from "@/locales";


export default function ExercisesScreen() {
  const { locale } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionsExercise, setQuickActionsExercise] = useState<any>(null);
  
  // OPTIMIZATION: Consolidated data fetching and theming
  const { user, isDataLoading, exerciseStats, exerciseHistory, latestMood } = useUserData();
  const { colors, standardGradients, cardGlass, dividerGlass } = useThemedGlass();

  // Transform exercise data for ExercisePlayer
  const transformExerciseForPlayer = (exercise: any) => {
    if (!exercise) return null;
    
    // Helper to get nested value from translations
    const getNestedValue = (locale: 'en' | 'ar', key: string): any => {
      const keys = key.split('.');
      let value: any = translations[locale];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return null;
        }
      }
      return value;
    };
    
    // Get title translations
    const title = {
      en: getNestedValue('en', exercise.titleKey) || exercise.titleKey,
      ar: getNestedValue('ar', exercise.titleKey) || exercise.titleKey,
    };
    
    // Get steps translations (preserve array structure)
    const steps = exercise.stepsKey ? {
      en: getNestedValue('en', exercise.stepsKey) || [],
      ar: getNestedValue('ar', exercise.stepsKey) || [],
    } : undefined;
    
    return {
      id: exercise.id,
      title,
      type: exercise.type,
      duration: exercise.duration,
      pattern: exercise.pattern,
      steps,
    };
  };
  
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
  
  // Memoize filtered exercises to prevent recalculation on every render
  const filteredExercises = useMemo(() => {
    const exercises = selectedCategory === 'all' 
      ? Object.values(EXERCISES).flat()
      : EXERCISES[selectedCategory as keyof typeof EXERCISES] || [];
    
    // Filter out any undefined/null exercises
    return exercises.filter(exercise => exercise && exercise.id);
  }, [selectedCategory]);
  
  const handleExerciseComplete = (_effectiveness?: number) => {
    setShowPlayer(false);
    setSelectedExercise(null);
    
    // Refresh data
    if (user?._id) {
      // Could show a success message or update UI
    }
  };

  const handleFavoriteToggle = React.useCallback((exerciseId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(exerciseId)) {
        newFavorites.delete(exerciseId);
      } else {
        newFavorites.add(exerciseId);
      }
      return newFavorites;
    });
  }, []);

  const handleQuickComplete = React.useCallback((exercise: any) => {
    console.log('Quick complete:', exercise.id);
  }, []);

  const handleExercisePress = React.useCallback((exercise: any) => {
    setSelectedExercise(exercise);
    setShowPlayer(true);
  }, []);

  const handleExerciseLongPress = React.useCallback((exercise: any) => {
    setQuickActionsExercise(exercise);
    setShowQuickActions(true);
  }, []);

  const quickActions = React.useMemo(() => [
    {
      id: "start",
      icon: "play.fill",
      label: locale === 'ar' ? 'بدء' : 'Start',
      color: "#4CAF50",
      onPress: () => {
        if (quickActionsExercise) {
          setSelectedExercise(quickActionsExercise);
          setShowPlayer(true);
          setShowQuickActions(false);
        }
      },
    },
    {
      id: "favorite",
      icon: favorites.has(quickActionsExercise?.id) ? "heart.fill" : "heart",
      label: locale === 'ar' ? 'المفضلة' : 'Favorite',
      color: "#F44336",
      onPress: () => {
        if (quickActionsExercise) {
          handleFavoriteToggle(quickActionsExercise.id);
          setShowQuickActions(false);
        }
      },
    },
    {
      id: "quick-complete",
      icon: "checkmark.circle.fill",
      label: locale === 'ar' ? 'إنجاز سريع' : 'Quick Complete',
      color: "#4A90E2", // colors.interactive.primary
      onPress: () => {
        if (quickActionsExercise) {
          handleQuickComplete(quickActionsExercise);
          setShowQuickActions(false);
        }
      },
    },
  ], [quickActionsExercise, favorites, locale, handleFavoriteToggle, handleQuickComplete]);
  
  const ListHeaderComponent = React.useCallback(() => (
    <>
      <ExercisesHeader colors={colors} locale={locale} />
      <ExerciseStatsBanner 
        exerciseStats={exerciseStats}
        colors={colors}
        dividerGlass={dividerGlass}
        cardGlass={cardGlass}
        locale={locale}
      />
      <ExerciseCategories
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        locale={locale}
      />
    </>
  ), [colors, locale, exerciseStats, dividerGlass, cardGlass, selectedCategory]);

  const ListFooterComponent = React.useCallback(() => (
    <RecommendationBanner
      recommendation={recommendation}
      standardGradients={standardGradients}
      colors={colors}
    />
  ), [recommendation, standardGradients, colors]);

  const loadingScreen = useLoadingScreen(isDataLoading);
  if (loadingScreen) return loadingScreen;
  
  return (
    <BaseScreen>
      <ExerciseList
        exercises={filteredExercises}
        favorites={favorites}
        recommendation={recommendation}
        exerciseHistory={exerciseHistory}
        onExercisePress={handleExercisePress}
        onFavoriteToggle={handleFavoriteToggle}
        onQuickComplete={handleQuickComplete}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
      />
      
      {showPlayer && selectedExercise && user?._id ? (
        <ExercisePlayer
          exercise={transformExerciseForPlayer(selectedExercise)}
          userId={user._id}
          onComplete={handleExerciseComplete}
          onCancel={() => {
            setShowPlayer(false);
            setSelectedExercise(null);
          }}
        />
      ) : null}

      {/* Exercise Quick Actions */}
      <ExerciseQuickActions
        isVisible={showQuickActions}
        actions={quickActions}
        onClose={() => {
          setShowQuickActions(false);
          setQuickActionsExercise(null);
        }}
      />
    </BaseScreen>
  );
}

