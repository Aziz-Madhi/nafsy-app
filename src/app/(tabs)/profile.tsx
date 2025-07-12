import { FormList, FormSection, FormText } from "@/components/forms";
import { ProfileAvatar, ProgressOverview } from "@/components/profile";
import { api } from "@/convex/_generated/api";
import { useLocale, useTranslation } from "@/hooks/useLocale";
import { useAppTheme } from "@/theme";
import { useAuthState } from "@/hooks/useAuthState";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, LogBox, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useButtonPressAnimation } from '@/hooks/animations';

export default function ProfileScreen() {
  const { signOut, clerkUser, convexUser: user, email } = useAuthState();
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { colors, styles } = useAppTheme();
  const [showFullStats, setShowFullStats] = useState(false);
  
  // Button press animation for interactive elements
  const { animatedStyle: sectionHeaderStyle, handlePressIn, handlePressOut } = useButtonPressAnimation();
  
  // Animation hooks handle their own lifecycle - no manual useEffect needed

  // User data now comes from useAuthState hook
  
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
      color: '#6BA3E5',
      trend: moodStats?.trend,
    },
    {
      icon: 'flame.fill' as any,
      title: locale === 'ar' ? 'الاستمرارية' : 'Streak',
      value: calculateStreak().toString(),
      subtitle: locale === 'ar' ? 'يوم' : 'days',
      color: '#FFAB78',
    },
    {
      icon: 'heart.circle.fill' as any,
      title: locale === 'ar' ? 'التمارين' : 'Exercises',
      value: exerciseStats?.totalExercises?.toString() || '0',
      subtitle: locale === 'ar' ? 'مكتمل' : 'completed',
      color: '#F687B3',
    },
    {
      icon: 'star.fill' as any,
      title: locale === 'ar' ? 'التقييم' : 'Rating',
      value: exerciseStats?.averageEffectiveness?.toFixed(1) || '0.0',
      subtitle: locale === 'ar' ? 'من 5' : 'out of 5',
      color: '#FFD166',
    },
  ];


  // Animation styles are now provided by hooks

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
        {/* Profile Avatar */}
        <ProfileAvatar
          user={user}
          email={email}
          moodStats={moodStats}
          exerciseStats={exerciseStats}
          locale={locale}
        />

        {/* Progress Overview */}
        <ProgressOverview
          progressCards={progressCards}
          showFullStats={showFullStats}
          onToggleStats={() => setShowFullStats(!showFullStats)}
          sectionHeaderStyle={sectionHeaderStyle}
          handlePressIn={handlePressIn}
          handlePressOut={handlePressOut}
          userSummary={userSummary}
          exerciseStats={exerciseStats}
          locale={locale}
        />

        <FormList navigationTitle={content.profile}>
          <FormSection title={content.settings}>
            <TouchableOpacity onPress={() => router.push('/(settings)/preferences' as any)}><FormText systemImage="gearshape">{content.preferences}</FormText></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(settings)/notifications' as any)}><FormText systemImage="bell">{content.notifications}</FormText></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(settings)/privacy' as any)}><FormText systemImage="hand.raised">{content.privacy}</FormText></TouchableOpacity>
          </FormSection>

          <FormSection>
            <TouchableOpacity onPress={() => router.push('/(settings)/help' as any)}><FormText systemImage="questionmark.circle">{content.help}</FormText></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(settings)/about' as any)}><FormText systemImage="info.circle">{content.about}</FormText></TouchableOpacity>
          </FormSection>

          <FormSection>
            <TouchableOpacity onPress={handleSignOut}><FormText style={{ color: colors.interactive.destructive }}>{content.signOut}</FormText></TouchableOpacity>
          </FormSection>
        </FormList>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});