import { BaseScreen } from "@/components/layout/BaseScreen";
import { MoodChart } from "@/components/mood/MoodChart";
import { MoodTracker } from "@/components/mood/MoodTracker";
import { AnimatedMoodGradient } from "@/components/ui/AnimatedMoodGradient";
import { GlassmorphicCard } from "@/components/ui/GlassmorphicCard";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SparkLine } from "@/components/ui/SparkLine";
import { api } from "@/convex/_generated/api";
import { useExerciseRecommendations } from "@/hooks/useAIActions";
import { useLocale, useTranslation } from "@/hooks/useLocale";
import { useTheme } from "@/theme";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper to ensure we pass valid string colors
const safeColor = (c: any, fallback: string) => (typeof c === 'string' ? c : fallback);

export default function MoodScreen() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { colors, isDark, isLoading: themeLoading } = useTheme();
  const { user: clerkUser } = useUser();
  const [showTracker, setShowTracker] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  
  // Animation values for enhanced interactions
  const buttonScale = useSharedValue(1);
  // Define shared values individually to satisfy React-Hooks linter
  const cardAnimation0 = useSharedValue(0);
  const cardAnimation1 = useSharedValue(0);
  const cardAnimation2 = useSharedValue(0);
  const cardAnimations = [cardAnimation0, cardAnimation1, cardAnimation2];
  
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
  
  // Fetch user data
  const user = useQuery(api.users.getUserByClerkId, 
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  
  // Fetch mood data
  const moodHistory = useQuery(api.moods.getUserMoods, 
    user?._id ? { userId: user._id, limit: 30, days: 30 } : "skip"
  );
  
  const moodStats = useQuery(api.moods.getMoodStats,
    user?._id ? { userId: user._id, days: 30 } : "skip"
  );
  
  const latestMood = useQuery(api.moods.getLatestMood,
    user?._id ? { userId: user._id } : "skip"
  );
  
  // AI Exercise recommendations hook
  const { execute: getExerciseRecommendation, loading: loadingRecommendation, data: exerciseRecommendation } = useExerciseRecommendations();

  // Show loading state while fetching user (moved below hooks)
  /*
  if (!user && clerkUser) {
    return (
      <BaseScreen scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
        </View>
      </BaseScreen>
    );
  }
  */
  
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
  
  // Format last mood entry time
  const getLastMoodTime = () => {
    if (!latestMood) return null;
    const date = new Date(latestMood.timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return locale === 'ar' ? 'منذ أقل من ساعة' : 'Less than an hour ago';
    } else if (diffHours < 24) {
      return locale === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
    } else {
      return format(date, 'PPP', { locale: locale === 'ar' ? ar : enUS });
    }
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

  // ---------------------------------------------------------
  // Early-return blocks (must come AFTER all hooks above)
  // ---------------------------------------------------------

  // 1) Theme still loading → show skeleton
  if (themeLoading || !colors) {
    return (
      <BaseScreen scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </BaseScreen>
    );
  }

  // 2) Waiting for user data
  if (!user && clerkUser) {
    return (
      <BaseScreen scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
        </View>
      </BaseScreen>
    );
  }

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
        {/* Enhanced Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text.secondary }]}>
              {locale === 'ar' ? 'مرحباً' : 'Hello'} {user?.displayName || user?.name || ''}
            </Text>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {locale === 'ar' ? 'كيف حالك اليوم؟' : 'How are you today?'}
            </Text>
          </View>
          
          <Animated.View style={buttonAnimatedStyle}>
            <GestureDetector 
              gesture={Gesture.Tap().onEnd(() => runOnJS(handleAddButtonPress)())}
            >
              <Animated.View style={styles.enhancedAddButton}>
                <LinearGradient
                  colors={[safeColor(colors?.interactive?.primary, '#007AFF'), safeColor(colors?.interactive?.secondary, '#34C759')]}
                  style={styles.addButtonGradient}
                >
                  <IconSymbol name="plus" size={24} color="#FFFFFF" />
                </LinearGradient>
                
                {/* Floating ring animation */}
                <View style={styles.addButtonRing} />
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </View>
        
        {/* Enhanced Last Mood Card */}
        {latestMood ? <GlassmorphicCard
            style={styles.lastMoodCard}
            onPress={() => setShowTracker(true)}
            gradient={true}
            borderRadius={24}
            elevation={3}
          >
            <View style={styles.lastMoodHeader}>
              <Text style={[styles.lastMoodTitle, { color: colors.text.secondary }]}>
                {locale === 'ar' ? 'آخر تسجيل' : 'Last Check-in'}
              </Text>
              <Text style={[styles.lastMoodTime, { color: colors.text.tertiary }]}>
                {getLastMoodTime()}
              </Text>
            </View>
            
            <View style={styles.lastMoodContent}>
              <View style={styles.moodEmojiContainer}>
                <ProgressRing
                  size={80}
                  strokeWidth={4}
                  progress={(latestMood.rating / 10) * 100}
                  gradientColors={[colors?.interactive?.primary || '#007AFF', colors?.interactive?.secondary || '#34C759']}
                  backgroundColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                >
                  <Text style={styles.lastMoodEmoji}>
                    {latestMood.rating <= 2 ? '😔' :
                     latestMood.rating <= 4 ? '😕' :
                     latestMood.rating <= 6 ? '😐' :
                     latestMood.rating <= 8 ? '🙂' : '😄'}
                  </Text>
                </ProgressRing>
              </View>
              <View style={styles.lastMoodDetails}>
                <Text style={[styles.lastMoodRating, { color: colors.text.primary }]}>
                  {latestMood.rating}/10
                </Text>
                {latestMood.note ? <Text 
                    style={[styles.lastMoodNote, { color: colors.text.secondary }]}
                    numberOfLines={2}
                  >
                    &ldquo;{latestMood.note}&rdquo;
                  </Text> : null}
              </View>
            </View>
          </GlassmorphicCard> : null}
        
        {/* Enhanced AI Exercise Recommendation */}
        {exerciseRecommendation ? <GlassmorphicCard
            style={styles.recommendationCard}
            gradient={true}
            gradientColors={[
              safeColor(isDark ? 'rgba(100, 149, 237, 0.2)' : 'rgba(100, 149, 237, 0.15)', '#6495ED'),
              safeColor(isDark ? 'rgba(100, 149, 237, 0.1)' : 'rgba(100, 149, 237, 0.08)', '#6495ED')
            ]}
            borderRadius={20}
            elevation={2}
          >
            <IconSymbol 
              name="sparkles" 
              size={20} 
              color={colors.interactive.primary} 
              style={styles.recommendationIcon}
            />
            <View style={styles.recommendationContent}>
              <Text style={[styles.recommendationTitle, { color: colors.text.primary }]}>
                {locale === 'ar' ? 'توصية مخصصة' : 'Personalized Recommendation'}
              </Text>
              <Text style={[styles.recommendationText, { color: colors.text.secondary }]}>
                {exerciseRecommendation.reason}
              </Text>
              <GestureDetector 
                gesture={Gesture.Tap().onEnd(() => {
                  // TODO: Navigate to exercise
                  console.log('Navigate to recommended exercise');
                })}
              >
                <Animated.View style={[styles.recommendationButton, { backgroundColor: colors.interactive.primary }]}>
                  <Text style={styles.recommendationButtonText}>
                    {locale === 'ar' ? 'جرب التمرين' : 'Try Exercise'}
                  </Text>
                </Animated.View>
              </GestureDetector>
            </View>
          </GlassmorphicCard> : null}
        
        {/* Mood Chart */}
        {moodHistory && moodHistory.length > 0 ? <MoodChart 
            moodData={moodHistory}
            averageRating={moodStats?.averageRating}
            trend={moodStats?.trend}
          /> : null}
        
        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <GestureDetector 
            gesture={Gesture.Tap().onEnd(() => runOnJS(setShowInsights)(!showInsights))}
          >
            <Animated.View style={styles.insightsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                {locale === 'ar' ? 'رؤى وإحصائيات' : 'Insights & Stats'}
              </Text>
              <IconSymbol 
                name={showInsights ? 'chevron.up' : 'chevron.down'} 
                size={20} 
                color={colors.text.tertiary} 
              />
            </Animated.View>
          </GestureDetector>
          
          {showInsights ? <View style={styles.insightsGrid}>
              {insightCards.map((card, index) => (
                <Animated.View
                  key={index}
                  style={cardAnimatedStyles[index]}
                >
                  <GlassmorphicCard
                    style={styles.insightCard}
                    gradient={true}
                    borderRadius={16}
                    elevation={2}
                  >
                    <View style={[styles.insightIconContainer, { backgroundColor: card.color + '20' }]}>
                      <IconSymbol name={card.icon} size={24} color={card.color} />
                    </View>
                    <Text style={[styles.insightTitle, { color: colors.text.secondary }]}>
                      {card.title}
                    </Text>
                    <Text style={[styles.insightValue, { color: colors.text.primary }]}>
                      {card.value}
                    </Text>
                    {card.sparkData && card.sparkData.length > 0 ? <View style={styles.sparkLineContainer}>
                        <SparkLine
                          data={card.sparkData}
                          width={60}
                          height={20}
                          color={card.color}
                          strokeWidth={2}
                        />
                      </View> : null}
                    {card.subtitle ? <Text style={[styles.insightSubtitle, { color: colors.text.tertiary }]}>
                        {card.subtitle}
                      </Text> : null}
                  </GlassmorphicCard>
                </Animated.View>
              ))}
            </View> : null}
        </View>
        
        {/* Common Factors */}
        {moodStats?.mostCommonFactors && moodStats.mostCommonFactors.length > 0 ? <View style={styles.factorsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              {locale === 'ar' ? 'العوامل الشائعة' : 'Common Factors'}
            </Text>
            <View style={styles.factorsList}>
              {moodStats.mostCommonFactors.slice(0, 5).map((item, index) => (
                <View 
                  key={index}
                  style={[styles.factorItem, { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                  }]}
                >
                  <Text style={[styles.factorName, { color: colors.text.primary }]}>
                    {item.factor}
                  </Text>
                  <Text style={[styles.factorCount, { color: colors.text.secondary }]}>
                    {item.count}x
                  </Text>
                </View>
              ))}
            </View>
          </View> : null}
      </ScrollView>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhancedAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(100, 149, 237, 0.3)',
    top: -4,
    left: -4,
  },
  moodEmojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  lastMoodCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  lastMoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lastMoodTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastMoodTime: {
    fontSize: 12,
  },
  lastMoodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMoodEmoji: {
    fontSize: 28,
    textAlign: 'center',
  },
  lastMoodDetails: {
    flex: 1,
  },
  lastMoodRating: {
    fontSize: 24,
    fontWeight: '700',
  },
  lastMoodNote: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  recommendationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
  },
  recommendationIcon: {
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    marginBottom: 12,
  },
  recommendationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  recommendationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  insightsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  insightCard: {
    width: '31%',
    margin: '1.16%',
    alignItems: 'center',
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  insightSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  sparkLineContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  factorsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  factorsList: {
    marginTop: 12,
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  factorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  factorCount: {
    fontSize: 14,
  },
});