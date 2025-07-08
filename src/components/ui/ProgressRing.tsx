import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { useProgressAnimation } from '@/utils/progressAnimationHelper';

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
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Use our custom progress animation helper
  const { progress: animatedProgress, animateProgress, getStrokeDashoffset } = useProgressAnimation(0, animated ? duration : 0);
  
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
      {children ? <View
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
          {children}
        </View> : null}
    </View>
  );
}