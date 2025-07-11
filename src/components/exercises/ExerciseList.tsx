import React from "react";
import { GenericList } from "@/components/data-display/GenericList";
import { SwipeableExerciseCard } from "./SwipeableExerciseCard";

interface ExerciseListProps {
  exercises: any[];
  favorites: Set<string>;
  recommendation: any;
  exerciseHistory: any[];
  onExercisePress: (exercise: any) => void;
  onFavoriteToggle: (exerciseId: string) => void;
  onQuickComplete: (exercise: any) => void;
  ListHeaderComponent?: React.ComponentType<any>;
  ListFooterComponent?: React.ComponentType<any>;
}

export const ExerciseList = React.memo<ExerciseListProps>(({
  exercises,
  favorites,
  recommendation,
  exerciseHistory,
  onExercisePress,
  onFavoriteToggle,
  onQuickComplete,
  ListHeaderComponent,
  ListFooterComponent,
}) => {
  // Get exercise completion data
  const getExerciseData = React.useCallback((exerciseId: string) => {
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
  }, [exerciseHistory]);

  // Memoize exercise renderer to prevent unnecessary re-renders
  const renderExercise = React.useCallback(({ item: exercise }: { item: any }) => {
    // Safety check for undefined exercise
    if (!exercise || !exercise.id) {
      return null;
    }
    
    const exerciseData = getExerciseData(exercise.id);
    const isRecommended = recommendation?.type === exercise.type;
    const isFavorited = favorites.has(exercise.id);
    
    return (
      <SwipeableExerciseCard
        exercise={exercise}
        onPress={() => onExercisePress(exercise)}
        onFavorite={() => onFavoriteToggle(exercise.id)}
        onComplete={() => onQuickComplete(exercise)}
        isRecommended={isRecommended}
        isFavorited={isFavorited}
        completedCount={exerciseData.completedCount}
        lastCompleted={exerciseData.lastCompleted}
        effectiveness={exerciseData.effectiveness}
      />
    );
  }, [recommendation, favorites, onFavoriteToggle, onQuickComplete, getExerciseData, onExercisePress]);

  return (
    <GenericList
      data={exercises.map(exercise => ({ ...exercise, id: exercise.id }))}
      renderItem={renderExercise}
      numColumns={2}
      estimatedItemHeight={200}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
    />
  );
});

ExerciseList.displayName = 'ExerciseList';