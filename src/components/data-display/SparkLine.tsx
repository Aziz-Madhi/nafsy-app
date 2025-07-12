import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  gradientColors?: string[];
  strokeWidth?: number;
  filled?: boolean;
}

export function SparkLine({
  data,
  width = 80,
  height = 30,
  color = '#007AFF',
  gradientColors,
  strokeWidth = 2,
  filled = false,
}: SparkLineProps) {
  if (!data || data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  // Create path for the line
  const createPath = () => {
    const stepX = width / (data.length - 1);
    let path = '';

    data.forEach((value, index) => {
      const x = index * stepX;
      const y = height - ((value - minValue) / range) * height;
      
      if (index === 0) {
        path += `M${x},${y}`;
      } else {
        path += ` L${x},${y}`;
      }
    });

    return path;
  };

  // Create filled area path
  const createFilledPath = () => {
    if (!filled) return '';
    
    const linePath = createPath();
    const stepX = width / (data.length - 1);
    const lastX = (data.length - 1) * stepX;
    
    return `${linePath} L${lastX},${height} L0,${height} Z`;
  };

  const defaultGradientColors = [color + '80', color + '20'];

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          {(filled || gradientColors) ? <LinearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop 
                offset="0%" 
                stopColor={gradientColors?.[0] || defaultGradientColors[0]} 
              />
              <Stop 
                offset="100%" 
                stopColor={gradientColors?.[1] || defaultGradientColors[1]} 
              />
            </LinearGradient> : null}
        </Defs>
        
        {filled ? <Path
            d={createFilledPath()}
            fill="url(#sparkGradient)"
          /> : null}
        
        <Path
          d={createPath()}
          stroke={gradientColors ? 'url(#sparkGradient)' : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}