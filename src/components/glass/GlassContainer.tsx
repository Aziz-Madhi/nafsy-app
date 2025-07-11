import {
  View,
  ViewStyle,
  StyleProp,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlassEffect, GlassEffectConfig } from '@/hooks/glass/useGlassEffect';

interface GlassContainerProps extends GlassEffectConfig {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  padding?: number;
  useBlur?: boolean;
  useGradient?: boolean;
}

/**
 * Universal glass effect container component
 * Combines BlurView, gradient overlays, and themed styling
 */
export function GlassContainer({
  children,
  style,
  borderRadius = 20,
  padding = 16,
  useBlur = true,
  useGradient = false,
  ...glassConfig
}: GlassContainerProps) {
  const glassProps = useGlassEffect(glassConfig);

  // Container style with glass effects
  const containerStyle: ViewStyle = {
    borderRadius,
    padding,
    overflow: 'hidden',
    borderWidth: glassConfig.borderEnabled !== false ? 1 : 0,
    borderColor: glassProps.borderColor,
    shadowColor: glassProps.shadowColor,
    shadowOffset: glassProps.shadowOffset,
    shadowOpacity: glassProps.shadowOpacity,
    shadowRadius: glassProps.shadowRadius,
    elevation: glassProps.elevation,
  };

  // Content with or without blur
  const renderContent = () => {
    if (useBlur && Platform.OS === 'ios') {
      // Use native BlurView on iOS
      return (
        <BlurView
          intensity={glassProps.intensity}
          tint={glassProps.tint}
          style={[styles.blurContainer, { borderRadius }]}
        >
          {Boolean(useGradient) && (
            <LinearGradient
              colors={glassProps.gradientColors as [string, string, ...string[]]}
              style={[styles.gradientOverlay, { borderRadius }]}
            />
          )}
          <View style={[styles.content, { padding: 0 }]}>
            {children}
          </View>
        </BlurView>
      );
    } else {
      // Fallback for Android or when blur is disabled
      return (
        <View style={[styles.fallbackContainer, { backgroundColor: glassProps.backgroundColor, borderRadius }]}>
          {Boolean(useGradient) && (
            <LinearGradient
              colors={glassProps.gradientColors as [string, string, ...string[]]}
              style={[styles.gradientOverlay, { borderRadius }]}
            />
          )}
          <View style={[styles.content, { padding: 0 }]}>
            {children}
          </View>
        </View>
      );
    }
  };

  return (
    <View style={[containerStyle, style]}>
      {renderContent()}
    </View>
  );
}

/**
 * Simplified glass overlay component for backgrounds
 */
export function GlassOverlay({
  children,
  style,
  borderRadius = 0,
  ...glassConfig
}: Omit<GlassContainerProps, 'padding' | 'useBlur'>) {
  return (
    <GlassContainer
      style={style}
      borderRadius={borderRadius}
      padding={0}
      useBlur={false}
      useGradient={true}
      borderEnabled={false}
      shadowEnabled={false}
      {...glassConfig}
    >
      {children}
    </GlassContainer>
  );
}

/**
 * Glass blur container specifically for input fields
 */
export function GlassInput({
  children,
  style,
  borderRadius = 25,
  padding = 16,
  ...glassConfig
}: GlassContainerProps) {
  return (
    <GlassContainer
      style={style}
      borderRadius={borderRadius}
      padding={padding}
      useBlur={true}
      useGradient={false}
      variant="input"
      {...glassConfig}
    >
      {children}
    </GlassContainer>
  );
}

/**
 * Glass card container for elevated content
 */
export function GlassCard({
  children,
  style,
  borderRadius = 20,
  padding = 16,
  elevation = 3,
  ...glassConfig
}: GlassContainerProps) {
  return (
    <GlassContainer
      style={style}
      borderRadius={borderRadius}
      padding={padding}
      useBlur={true}
      useGradient={true}
      variant="card"
      elevation={elevation}
      {...glassConfig}
    >
      {children}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  fallbackContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
  },
});