import * as Form from "@/components/ui/Form";
import { GlassmorphicCard } from "@/components/ui/GlassmorphicCard";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { api } from "@/convex/_generated/api";
import { useLocale, useTranslation } from "@/hooks/useLocale";
import { useAppTheme, useTheme } from "@/theme";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, LogBox, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withRepeat,
  runOnJS, 
  interpolate 
} from 'react-native-reanimated';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { colors, styles, isDark } = useAppTheme();
  const theme = useTheme();
  const [showFullStats, setShowFullStats] = useState(false);
  
  // Animation values
  const avatarPulse = useSharedValue(1);
  const ringsRotation = useSharedValue(0);
  // Create individual shared values for card animations
  const cardAnimation0 = useSharedValue(0);
  const cardAnimation1 = useSharedValue(0);
  const cardAnimation2 = useSharedValue(0);
  const cardAnimation3 = useSharedValue(0);
  const cardAnimations = useRef([cardAnimation0, cardAnimation1, cardAnimation2, cardAnimation3]).current;
  
  // Start avatar animations
  useEffect(() => {
    // Pulsing avatar animation
    avatarPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );
    
    // Rotating rings animation
    ringsRotation.value = withRepeat(
      withTiming(1, { duration: 20000 }),
      -1,
      false
    );
  }, [avatarPulse, ringsRotation]);
  
  // Animate cards when stats are shown
  useEffect(() => {
    if (showFullStats) {
      cardAnimations.forEach((anim, index) => {
        anim.value = withTiming(1, { duration: 600 });
      });
    } else {
      cardAnimations.forEach(anim => {
        anim.value = 0;
      });
    }
  }, [showFullStats, cardAnimations]);

  // Fetch user data
  const user = useQuery(api.users.getUserByClerkId, 
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  
  // Fetch user statistics
  const moodStats = useQuery(api.moods.getMoodStats,
    user?._id ? { userId: user._id, days: 30 } : "skip"
  );
  
  const exerciseStats = useQuery(api.exercises.getExerciseStats,
    user?._id ? { userId: user._id, days: 30 } : "skip"
  );
  
  // Fetch user's adaptive AI profile
  const userSummary = useQuery(api.ai.getUserSummary,
    user?._id ? { userId: user._id } : "skip"
  );

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  const content = {
    profile: t("profile.title"),
    settings: t("profile.settings"),
    preferences: t("profile.preferences"),
    notifications: t("profile.notifications"),
    privacy: t("profile.privacy"),
    help: t("profile.help"),
    about: t("profile.about"),
    signOut: t("profile.signOut"),
  };

  // Calculate streak (simple implementation - days with mood entries)
  const calculateStreak = () => {
    // This would need more complex logic to calculate actual consecutive days
    return moodStats?.totalEntries || 0;
  };

  const progressCards = [
    {
      icon: 'face.smiling' as any,
      title: locale === 'ar' ? 'المزاج' : 'Mood',
      value: moodStats?.averageRating?.toFixed(1) || '0.0',
      subtitle: locale === 'ar' ? 'المتوسط' : 'Average',
      color: '#6495ED',
      trend: moodStats?.trend,
    },
    {
      icon: 'flame.fill' as any,
      title: locale === 'ar' ? 'الاستمرارية' : 'Streak',
      value: calculateStreak().toString(),
      subtitle: locale === 'ar' ? 'يوم' : 'days',
      color: '#F59E0B',
    },
    {
      icon: 'heart.circle.fill' as any,
      title: locale === 'ar' ? 'التمارين' : 'Exercises',
      value: exerciseStats?.totalExercises?.toString() || '0',
      subtitle: locale === 'ar' ? 'مكتمل' : 'completed',
      color: '#EC4899',
    },
    {
      icon: 'star.fill' as any,
      title: locale === 'ar' ? 'التقييم' : 'Rating',
      value: exerciseStats?.averageEffectiveness?.toFixed(1) || '0.0',
      subtitle: locale === 'ar' ? 'من 5' : 'out of 5',
      color: '#FFB800',
    },
  ];

  // Animated styles
  const avatarPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarPulse.value }]
  }));

  const ringsRotationStyle = useAnimatedStyle(() => ({
    transform: [{
      rotate: interpolate(ringsRotation.value, [0, 1], [0, 360]) + 'deg'
    }]
  }));

  const ringsRotationReverseStyle = useAnimatedStyle(() => ({
    transform: [{
      rotate: interpolate(ringsRotation.value, [0, 1], [360, 0]) + 'deg'
    }]
  }));

  // Mute React Native whitespace Text-wrapping warning globally for this screen
  useEffect(() => {
    LogBox.ignoreLogs(['Text strings must be rendered within a <Text> component']);
  }, []);

  if (!user && clerkUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={localStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Header Section - Outside Form.List */}
        <View style={localStyles.header}>
            {/* Enhanced Animated Avatar */}
            <View style={localStyles.avatarContainer}>
              {/* Animated rotating rings */}
              <Animated.View
                style={[
                  localStyles.avatarRing,
                  ringsRotationStyle
                ]}
              />
              <Animated.View
                style={[
                  localStyles.avatarRingSecondary,
                  ringsRotationReverseStyle
                ]}
              />
              
              {/* Achievement badges */}
              {moodStats?.totalEntries && moodStats.totalEntries > 10 ? <View style={[localStyles.achievementBadge, { top: 10, right: 10 }]}>
                  <IconSymbol name="star.fill" size={16} color="#FFD700" />
                </View> : null}
              {exerciseStats?.totalExercises && exerciseStats.totalExercises > 5 ? <View style={[localStyles.achievementBadge, { bottom: 10, left: 10 }]}>
                  <IconSymbol name="heart.fill" size={16} color="#FF6B9D" />
                </View> : null}
              
              <Animated.View
                style={[
                  localStyles.avatarGradientContainer,
                  avatarPulseStyle
                ]}
              >
                <LinearGradient
                  colors={['#6495ED', '#4169E1', '#8A2BE2']}
                  style={localStyles.avatarGradient}
                >
                  <Text style={localStyles.avatarText}>
                    {user?.displayName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "U"}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </View>
            <Text style={[localStyles.nameText, { color: colors.text.primary, marginTop: 12 }]}>
              {user?.displayName || user?.name || "User"}
            </Text>
            <Text style={[localStyles.emailText, { color: colors.text.secondary }]}>{clerkUser?.emailAddresses[0]?.emailAddress}</Text>
            
            {/* Member since */}
            {user?.createdAt ? <Text style={[localStyles.memberSince, { color: colors.text.secondary }]}>
                {locale === 'ar' ? 'عضو منذ' : 'Member since'} {new Date(user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
              </Text> : null}
          </View>

          {/* Progress Overview */}
          <View style={localStyles.progressSection}>
            <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(setShowFullStats)(!showFullStats))}><Animated.View style={localStyles.sectionHeader}>
              <Text style={[localStyles.sectionTitle, { color: colors.text.primary }]}>
                {locale === 'ar' ? 'نظرة عامة على التقدم' : 'Progress Overview'}
              </Text>
              <IconSymbol 
                name={showFullStats ? 'chevron.up' : 'chevron.down'} 
                size={20} 
                color={colors.text.tertiary} 
              />
            </Animated.View></GestureDetector>
            
            <View style={localStyles.progressGrid}>
              {progressCards.map((card, index) => (
                <GlassmorphicCard
                  key={index}
                  style={localStyles.progressCard}
                  gradient={true}
                  borderRadius={16}
                  elevation={2}
                >
                  <View style={localStyles.progressIconWrapper}>
                    <ProgressRing
                      size={56}
                      strokeWidth={3}
                      progress={card.value === 'Improving' ? 80 : card.value === 'Declining' ? 20 : parseFloat(card.value) * 10}
                      color={card.color}
                      backgroundColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                    >
                      <IconSymbol name={card.icon} size={20} color={card.color} />
                    </ProgressRing>
                  </View>
                  <Text style={[localStyles.progressTitle, { color: colors.text.secondary }]}>
                    {card.title}
                  </Text>
                  <View style={localStyles.progressValueContainer}>
                    <Text style={[localStyles.progressValue, { color: colors.text.primary }]}>
                      {card.value}
                    </Text>
                    {card.trend ? <IconSymbol 
                        name={card.trend === 'improving' ? 'arrow.up.right' : card.trend === 'declining' ? 'arrow.down.right' : 'minus'}
                        size={16}
                        color={card.trend === 'improving' ? '#4ADE80' : card.trend === 'declining' ? '#F87171' : colors.text.tertiary}
                      /> : null}
                  </View>
                  <Text style={[localStyles.progressSubtitle, { color: colors.text.tertiary }]}>
                    {card.subtitle}
                  </Text>
                </GlassmorphicCard>
              ))}
            </View>
            
            {showFullStats ? <View style={localStyles.extendedStats}>
                {/* AI Insights */}
                {userSummary ? <View style={[localStyles.insightCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={localStyles.insightHeader}>
                      <IconSymbol name="sparkles" size={20} color={colors.interactive.primary} />
                      <Text style={[localStyles.insightTitle, { color: colors.text.primary }]}>
                        {locale === 'ar' ? 'رؤى مخصصة' : 'Personalized Insights'}
                      </Text>
                    </View>
                    <Text style={[localStyles.insightText, { color: colors.text.secondary }]}>
                      {userSummary.summary}
                    </Text>
                    {userSummary.keyThemes.length > 0 && (
                      <View style={localStyles.themeTags}>
                        {userSummary.keyThemes.slice(0, 3).map((theme, i) => (
                          <View key={i} style={[localStyles.themeTag, { backgroundColor: colors.interactive.primary + '20' }]}>
                            <Text style={[localStyles.themeTagText, { color: colors.interactive.primary }]}>
                              {theme}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View> : null}
                
                {/* Exercise breakdown */}
                {exerciseStats?.typeStats && Object.keys(exerciseStats.typeStats).length > 0 ? <View style={[localStyles.breakdownCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <Text style={[localStyles.breakdownTitle, { color: colors.text.primary }]}>
                      {locale === 'ar' ? 'توزيع التمارين' : 'Exercise Breakdown'}
                    </Text>
                    {Object.entries(exerciseStats.typeStats).map(([type, count]) => (
                      <View key={type} style={localStyles.breakdownItem}>
                        <Text style={[localStyles.breakdownLabel, { color: colors.text.secondary }]}>
                          {type}
                        </Text>
                        <Text style={[localStyles.breakdownValue, { color: colors.text.primary }]}>
                          {count}
                        </Text>
                      </View>
                    ))}
                  </View> : null}
              </View> : null}
          </View>

        <Form.List navigationTitle={content.profile}>
          <Form.Section title={content.settings}>
            <TouchableOpacity onPress={() => router.push('/(settings)/preferences' as any)}><Form.Text systemImage="gearshape">{content.preferences}</Form.Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(settings)/notifications' as any)}><Form.Text systemImage="bell">{content.notifications}</Form.Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(settings)/privacy' as any)}><Form.Text systemImage="hand.raised">{content.privacy}</Form.Text></TouchableOpacity>
          </Form.Section>

          <Form.Section>
            <TouchableOpacity onPress={() => router.push('/(settings)/help' as any)}><Form.Text systemImage="questionmark.circle">{content.help}</Form.Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(settings)/about' as any)}><Form.Text systemImage="info.circle">{content.about}</Form.Text></TouchableOpacity>
          </Form.Section>

          <Form.Section>
            <TouchableOpacity onPress={handleSignOut}><Form.Text style={{ color: colors.interactive.destructive }}>{content.signOut}</Form.Text></TouchableOpacity>
          </Form.Section>
        </Form.List>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#6495ED',
    borderStyle: 'dashed',
  },
  avatarRingSecondary: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: '#4169E1',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  achievementBadge: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  avatarGradientContainer: {
    zIndex: 1,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  memberSince: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  progressSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  progressCard: {
    width: '48%',
    margin: '1%',
    alignItems: 'center',
  },
  progressIconWrapper: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  progressValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 4,
  },
  progressSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  extendedStats: {
    marginTop: 16,
  },
  insightCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  themeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  themeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  themeTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  breakdownCard: {
    padding: 16,
    borderRadius: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});