import { IconSymbol } from '@/components/core/Icon/IconSymbol';
import { useAppTheme } from '@/theme';
import { useProgressAnimation } from '@/utils/progressAnimationHelper';
import React, { useEffect } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedProps,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 100
  color?: string;
  gradientColors?: string[];
  backgroundColor?: string;
  animated?: boolean;
  duration?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
  showPercentage?: boolean;
  showCompletionIcon?: boolean;
  label?: string;
  labelStyle?: TextStyle;
  percentageStyle?: TextStyle;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  size,
  strokeWidth,
  progress,
  color = '#007AFF',
  gradientColors,
  backgroundColor = '#E5E5E5',
  animated = true,
  duration = 1000,
  children,
  style,
  showPercentage = false,
  showCompletionIcon = false,
  label,
  labelStyle,
  percentageStyle,
}: ProgressRingProps) {
  const { colors, typography } = useAppTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Use our custom progress animation helper
  const { progress: _animatedProgress, animateProgress, getStrokeDashoffset } = useProgressAnimation(0, animated ? duration : 0);
  
  useEffect(() => {
    animateProgress(progress);
  }, [progress, animateProgress]);

  // Animated props for the SVG circle
  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: getStrokeDashoffset(circumference),
    };
  });

  const center = size / 2;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          {gradientColors ? <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient> : null}
        </Defs>
        
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={gradientColors ? 'url(#progressGradient)' : color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          animatedProps={animatedProps}
        />
      </Svg>
      
      {/* Content in the center */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children || (
          <DefaultProgressContent
            progress={progress}
            showPercentage={showPercentage}
            showCompletionIcon={showCompletionIcon}
            label={label}
            labelStyle={labelStyle}
            percentageStyle={percentageStyle}
            colors={colors}
            typography={typography}
          />
        )}
      </View>
    </View>
  );
}

interface DefaultProgressContentProps {
  progress: number;
  showPercentage: boolean;
  showCompletionIcon: boolean;
  label?: string;
  labelStyle?: TextStyle;
  percentageStyle?: TextStyle;
  colors: ReturnType<typeof useAppTheme>["colors"];
  typography: ReturnType<typeof useAppTheme>["typography"];
}

function DefaultProgressContent({
  progress,
  showPercentage,
  showCompletionIcon,
  label,
  labelStyle,
  percentageStyle,
  colors,
  typography,
}: DefaultProgressContentProps) {
  const isComplete = progress >= 100;
  
  const contentAnimatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isComplete ? 1.1 : 1, {
      damping: 15,
      stiffness: 300,
    });
    
    return {
      transform: [{ scale }],
    };
  });

  if (isComplete && showCompletionIcon) {
    return (
      <Animated.View style={contentAnimatedStyle}>
        <IconSymbol
          name="checkmark.circle.fill"
          size={32}
          color={colors.interactive.success}
        />
      </Animated.View>
    );
  }

  return (
    <View style={{ alignItems: 'center' }}>
      {showPercentage ? <Animated.Text
          style={[
            {
              ...typography.title2,
              color: colors.text.primary,
              fontWeight: '700',
            },
            percentageStyle,
            contentAnimatedStyle,
          ]}
        >
          {Math.round(progress)}%
        </Animated.Text> : null}
      {label ? <Text
          style={[
            {
              ...typography.caption,
              color: colors.text.secondary,
              marginTop: 4,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text> : null}
    </View>
  );
}