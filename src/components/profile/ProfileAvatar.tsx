import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { useGlassStyle } from "@/hooks/glass/useGlassEffect";
import { usePulseAnimation, useRotationAnimation } from '@/hooks/animations';
import { useAppTheme } from "@/theme";

interface User {
  displayName?: string;
  name?: string;
  createdAt?: Date;
}

interface MoodStats {
  totalEntries?: number;
}

interface ExerciseStats {
  totalExercises?: number;
}

interface ProfileAvatarProps {
  user?: User;
  email?: string;
  moodStats?: MoodStats;
  exerciseStats?: ExerciseStats;
  locale: string;
}

export function ProfileAvatar({
  user,
  email,
  moodStats,
  exerciseStats,
  locale,
}: ProfileAvatarProps) {
  const { colors } = useAppTheme();
  
  // Animation hooks
  const avatarPulse = usePulseAnimation({ maxScale: 1.05, duration: 2000 });
  const ringsRotation = useRotationAnimation({ duration: 20000 });
  const ringsRotationReverse = useRotationAnimation({ duration: 20000, direction: 'counterclockwise' });
  
  // Glass effect styles
  const achievementBadgeGlass = useGlassStyle({ variant: 'ultra', elevation: 2 });

  return (
    <View style={styles.header}>
      {/* Enhanced Animated Avatar */}
      <View style={styles.avatarContainer}>
        {/* Animated rotating rings */}
        <Animated.View
          style={[
            styles.avatarRing,
            ringsRotation.animatedStyle
          ]}
        />
        <Animated.View
          style={[
            styles.avatarRingSecondary,
            ringsRotationReverse.animatedStyle
          ]}
        />
        
        {/* Achievement badges */}
        {!!(moodStats?.totalEntries && moodStats.totalEntries > 10) && (
          <View style={[styles.achievementBadge, achievementBadgeGlass, { top: 10, right: 10 }]}>
            <IconSymbol name="star.fill" size={16} color="#FFD700" />
          </View>
        )}
        {!!(exerciseStats?.totalExercises && exerciseStats.totalExercises > 5) && (
          <View style={[styles.achievementBadge, achievementBadgeGlass, { bottom: 10, left: 10 }]}>
            <IconSymbol name="heart.fill" size={16} color="#FF6B9D" />
          </View>
        )}
        
        <Animated.View
          style={[
            styles.avatarGradientContainer,
            avatarPulse.animatedStyle
          ]}
        >
          <LinearGradient
            colors={['#4A90E2', '#7ED321', '#AF7AC5']}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>
              {user?.displayName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "U"}
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
      <Text style={[styles.nameText, { color: colors.text.primary, marginTop: 12 }]}>
        {user?.displayName || user?.name || "User"}
      </Text>
      <Text style={[styles.emailText, { color: colors.text.secondary }]}>{email}</Text>
      
      {/* Member since */}
      {!!user?.createdAt && (
        <Text style={[styles.memberSince, { color: colors.text.secondary }]}>
          {locale === 'ar' ? 'عضو منذ' : 'Member since'} {new Date(user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    borderStyle: 'dashed',
  },
  avatarRingSecondary: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(126, 211, 33, 0.2)',
    borderStyle: 'solid',
  },
  achievementBadge: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarGradientContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  memberSince: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});