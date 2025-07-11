import { BaseScreen } from "@/components/layout/BaseScreen";
import { 
  MoodChart, 
  MoodTracker,
  MoodScreenHeader,
  LastMoodCard,
  ExerciseRecommendationCard,
  InsightsSection,
  CommonFactorsSection
} from "@/components/mood";
import { AnimatedMoodGradient } from "@/components/animations/AnimatedMoodGradient";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { useExerciseRecommendations } from "@/hooks/useAIActions";
import { useLocale } from "@/hooks/useLocale";
import { getRelativeTime } from "@/utils/date";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
// OPTIMIZATION: Consolidated imports following LEVER framework
import { useUserData } from "@/hooks/useUserData";
import { useThemedGlass } from "@/hooks/useThemedGlass";
import { useLoadingScreen } from "@/hooks/useLoadingScreen";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';

export default function MoodScreen() {
  const { locale } = useLocale();
  const [showTracker, setShowTracker] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  
  // OPTIMIZATION: Consolidated data fetching and theming
  const { user, isDataLoading, moodStats, latestMood, moodHistory } = useUserData();
  const { colors } = useThemedGlass();
  
  // Animation values for enhanced interactions
  const buttonScale = useSharedValue(1);
  // Define shared values individually to satisfy React-Hooks linter
  const cardAnimation0 = useSharedValue(0);
  const cardAnimation1 = useSharedValue(0);
  const cardAnimation2 = useSharedValue(0);
  const cardAnimations = useMemo(() => [cardAnimation0, cardAnimation1, cardAnimation2], [cardAnimation0, cardAnimation1, cardAnimation2]);
  
  // Animate cards on mount
  useEffect(() => {
    if (showInsights) {
      cardAnimations.forEach((anim, index) => {
        anim.value = withDelay(index * 150, withTiming(1, { duration: 600 }));
      });
    } else {
      cardAnimations.forEach(anim => {
        anim.value = 0;
      });
    }
  }, [showInsights, cardAnimations]);
  
  // AI Exercise recommendations hook
  const { execute: getExerciseRecommendation, data: exerciseRecommendation } = useExerciseRecommendations();

  // Enhanced button press animations - using useCallback properly for React Compiler
  const handleAddButtonPress = useCallback(() => {
    setShowTracker(true);
  }, []);

  // Separate animation effect
  useEffect(() => {
    if (showTracker) {
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [showTracker, buttonScale]);

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  // Create all animated styles upfront to avoid conditional hooks
  const cardAnimatedStyle0 = useAnimatedStyle(() => ({
    opacity: cardAnimations[0].value,
    transform: [{
      translateY: interpolate(cardAnimations[0].value, [0, 1], [20, 0])
    }]
  }));
  
  const cardAnimatedStyle1 = useAnimatedStyle(() => ({
    opacity: cardAnimations[1].value,
    transform: [{
      translateY: interpolate(cardAnimations[1].value, [0, 1], [20, 0])
    }]
  }));
  
  const cardAnimatedStyle2 = useAnimatedStyle(() => ({
    opacity: cardAnimations[2].value,
    transform: [{
      translateY: interpolate(cardAnimations[2].value, [0, 1], [20, 0])
    }]
  }));

  const cardAnimatedStyles = [cardAnimatedStyle0, cardAnimatedStyle1, cardAnimatedStyle2];

  // OPTIMIZATION: Consolidated loading screen
  const loadingScreen = useLoadingScreen(isDataLoading);
  if (loadingScreen) return loadingScreen;
  
  const handleMoodComplete = () => {
    setShowTracker(false);
    // Fetch AI exercise recommendation based on new mood
    if (user?._id && latestMood) {
      getExerciseRecommendation({
        userId: user._id,
        currentMood: latestMood.rating,
        recentEmotions: latestMood.factors || [],
        language: locale,
      });
    }
  };
  
  // Format last mood entry time using centralized utility
  const getLastMoodTime = () => {
    if (!latestMood || !latestMood.timestamp) return null;
    return getRelativeTime(latestMood.timestamp, locale as 'en' | 'ar');
  };
  
  const insightCards = [
    {
      icon: 'chart.line.uptrend.xyaxis',
      title: locale === 'ar' ? 'الاتجاه العام' : 'Overall Trend',
      value: moodStats?.trend === 'improving' ? (locale === 'ar' ? 'تحسن' : 'Improving') :
             moodStats?.trend === 'declining' ? (locale === 'ar' ? 'انخفاض' : 'Declining') :
             (locale === 'ar' ? 'مستقر' : 'Stable'),
      color: moodStats?.trend === 'improving' ? '#4ADE80' :
             moodStats?.trend === 'declining' ? '#F87171' : colors.interactive.primary,
      sparkData: moodHistory?.slice(-7).map(m => m.rating) || [],
    },
    {
      icon: 'calendar',
      title: locale === 'ar' ? 'الإدخالات' : 'Entries',
      value: moodStats?.totalEntries?.toString() || '0',
      subtitle: locale === 'ar' ? 'في آخر 30 يوم' : 'Last 30 days',
      color: colors.interactive.secondary,
    },
    {
      icon: 'star.fill',
      title: locale === 'ar' ? 'المتوسط' : 'Average',
      value: moodStats?.averageRating?.toFixed(1) || '0.0',
      subtitle: locale === 'ar' ? 'من 10' : 'out of 10',
      color: '#FFB800',
      sparkData: moodHistory?.slice(-7).map(m => m.rating) || [],
    },
  ];

  // 3) Show mood tracker modal
  if (showTracker && user?._id) {
    return (
      <BaseScreen scrollable={false}>
        <View style={styles.trackerContainer}>
          <View style={styles.trackerHeader}>
            <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(setShowTracker)(false))}>
              <Animated.View>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.text.tertiary} />
              </Animated.View>
            </GestureDetector>
          </View>
          <MoodTracker userId={user._id} onComplete={handleMoodComplete} />
        </View>
      </BaseScreen>
    );
  }
  
  return (
    <BaseScreen scrollable={false}>
      {/* Animated Mood Gradient Background */}
      <AnimatedMoodGradient
        moodRating={latestMood?.rating}
        recentMoods={moodHistory?.map(m => m.rating) || []}
        opacity={0.15}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <MoodScreenHeader
          userName={user?.displayName || user?.name || ''}
          locale={locale}
          onAddPress={handleAddButtonPress}
          buttonAnimatedStyle={buttonAnimatedStyle}
        />
        
        {/* Last Mood Card */}
        <LastMoodCard
          latestMood={latestMood}
          locale={locale}
          lastMoodTime={getLastMoodTime()}
          onPress={() => setShowTracker(true)}
        />
        
        {/* AI Exercise Recommendation */}
        <ExerciseRecommendationCard
          exerciseRecommendation={exerciseRecommendation}
          locale={locale}
        />
        
        {/* Mood Chart */}
        {moodHistory && moodHistory.length > 0 ? <MoodChart 
            moodData={moodHistory}
            averageRating={moodStats?.averageRating}
            trend={moodStats?.trend}
          /> : null}
        
        {/* Insights Section */}
        <InsightsSection
          insightCards={insightCards}
          showInsights={showInsights}
          onToggleInsights={() => setShowInsights(!showInsights)}
          cardAnimatedStyles={cardAnimatedStyles}
          locale={locale}
        />
        
        {/* Common Factors */}
        <CommonFactorsSection
          mostCommonFactors={moodStats?.mostCommonFactors}
          locale={locale}
        />
      </ScrollView>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  trackerContainer: {
    flex: 1,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
});