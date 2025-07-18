import { IconSymbol } from "@/components/core/Icon/IconSymbol";
import { useThemedGlass } from "@/hooks/useThemedGlass";
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { useAppTheme } from "@/theme";

interface MoodScreenHeaderProps {
  userName?: string;
  locale: string;
  onAddPress: () => void;
  buttonAnimatedStyle: any;
}

// Helper to ensure we pass valid string colors
const safeColor = (c: any, fallback: string) => (typeof c === 'string' ? c : fallback);

export function MoodScreenHeader({
  userName,
  locale,
  onAddPress,
  buttonAnimatedStyle,
}: MoodScreenHeaderProps) {
  const { colors } = useThemedGlass();
  const { typography } = useAppTheme();

  return (
    <View style={styles.header}>
      <View>
        <Text style={[typography.body, styles.greeting, { color: colors.text.secondary }]}>
          {locale === 'ar' ? 'مرحباً' : 'Hello'} {userName || ''}
        </Text>
        <Text style={[typography.title, styles.title, { color: colors.text.primary }]}>
          {locale === 'ar' ? 'كيف حالك اليوم؟' : 'How are you today?'}
        </Text>
      </View>
      
      <Animated.View style={buttonAnimatedStyle}>
        <GestureDetector 
          gesture={Gesture.Tap().onEnd(() => runOnJS(onAddPress)())}
        >
          <Animated.View style={styles.enhancedAddButton}>
            <LinearGradient
              colors={[
                safeColor(colors?.interactive?.primary, '#4A90E2'), 
                safeColor(colors?.wellness?.growth, '#7ED321')
              ]}
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
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    marginBottom: 4,
  },
  title: {
    marginBottom: 0,
  },
  enhancedAddButton: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});