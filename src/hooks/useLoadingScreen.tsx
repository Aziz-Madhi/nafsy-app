import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { BaseScreen } from '@/components/layout/BaseScreen';
import { useTheme } from '@/theme';

// OPTIMIZATION: Consolidated loading screen pattern following LEVER framework
// Eliminates ~20 lines of duplicate code per screen where loading state is displayed

interface UseLoadingScreenOptions {
  fallbackColor?: string;
  scrollable?: boolean;
}

export function useLoadingScreen(
  isLoading: boolean,
  options: UseLoadingScreenOptions = {}
) {
  const { colors } = useTheme();
  const { fallbackColor = '#007AFF', scrollable = false } = options;

  if (!isLoading) return null;

  return (
    <BaseScreen scrollable={scrollable}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={colors?.interactive?.primary || fallbackColor} 
        />
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});