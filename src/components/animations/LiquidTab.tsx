import React, { useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { IconSymbol, IconSymbolName } from '../core/Icon/IconSymbol';

interface Tab {
  id: string;
  label: string;
  icon?: IconSymbolName;
}

interface LiquidTabProps {
  tabs: Tab[];
  selectedTab: string;
  onTabChange: (tabId: string) => void;
  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
  style?: any;
}

export function LiquidTab({
  tabs,
  selectedTab,
  onTabChange,
  backgroundColor,
  activeColor,
  inactiveColor,
  style,
}: LiquidTabProps) {
  const { colors, isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  // Tab dimensions - adjust max width based on tab count
  const maxTabWidth = tabs.length <= 3 ? 120 : tabs.length <= 4 ? 100 : 80;
  const tabWidth = Math.min((screenWidth - 60) / tabs.length, maxTabWidth); // 60 = padding
  
  // Shared values for reanimated
  const translateX = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const gestureTranslateX = useSharedValue(0);
  
  const defaultBackgroundColor = backgroundColor || 
    (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)');
  const defaultActiveColor = activeColor || colors.interactive.primary;
  const defaultInactiveColor = inactiveColor || colors.text.secondary;

  // Update position when selectedTab changes
  useEffect(() => {
    const selectedIndex = tabs.findIndex(tab => tab.id === selectedTab);
    if (selectedIndex !== -1) {
      translateX.value = withSpring(selectedIndex * tabWidth, {
        tension: 300,
        friction: 30,
      });
      
      // Squeeze effect
      scaleX.value = withTiming(0.9, { duration: 100 }, () => {
        scaleX.value = withTiming(1, { duration: 200 });
      });
    }
  }, [selectedTab, tabWidth, tabs, translateX, scaleX]);

  // Pan gesture for swipe navigation
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      gestureTranslateX.value = translateX.value;
    })
    .onUpdate((event) => {
      'worklet';
      // Only handle horizontal swipes
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        const newTranslateX = gestureTranslateX.value + event.translationX;
        
        // Constrain to bounds
        const maxTranslate = (tabs.length - 1) * tabWidth;
        const constrainedValue = Math.max(0, Math.min(maxTranslate, newTranslateX));
        // eslint-disable-next-line react-compiler/react-compiler
        translateX.value = constrainedValue;
      }
    })
    .onEnd((event) => {
      'worklet';
      // Calculate current index from translateX value instead of using findIndex
      const currentIndex = Math.round(translateX.value / tabWidth);
      let targetIndex = currentIndex;
      
      // Determine target tab based on velocity and translation
      const { translationX, velocityX } = event;
      const swipeThreshold = tabWidth * 0.3;
      const velocityThreshold = 500;
      
      if (Math.abs(velocityX) > velocityThreshold) {
        // Fast swipe - use velocity direction
        if (velocityX > 0 && currentIndex > 0) {
          targetIndex = currentIndex - 1;
        } else if (velocityX < 0 && currentIndex < tabs.length - 1) {
          targetIndex = currentIndex + 1;
        }
      } else if (Math.abs(translationX) > swipeThreshold) {
        // Slow swipe - use translation distance
        if (translationX > 0 && currentIndex > 0) {
          targetIndex = currentIndex - 1;
        } else if (translationX < 0 && currentIndex < tabs.length - 1) {
          targetIndex = currentIndex + 1;
        }
      }
      
      // Animate to target position
      translateX.value = withSpring(targetIndex * tabWidth, {
        tension: 300,
        friction: 30,
      });
      
      // Update selected tab if changed
      if (targetIndex !== currentIndex && targetIndex >= 0 && targetIndex < tabs.length) {
        runOnJS((index: number) => {
          onTabChange(tabs[index].id);
        })(targetIndex);
      }
    });

  // Tap gesture for direct tab selection
  const createTapGesture = (tabId: string, _index: number) => {
    return Gesture.Tap()
      .onEnd(() => {
        runOnJS(onTabChange)(tabId);
      });
  };

  // Animated styles
  const liquidBackgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scaleX: scaleX.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, { backgroundColor: defaultBackgroundColor }, style]}>
        {/* Animated liquid background */}
        <Animated.View
          style={[
            styles.liquidBackground,
            {
              width: tabWidth,
              backgroundColor: defaultActiveColor,
            },
            liquidBackgroundStyle,
          ]}
        />
        
        {/* Tab buttons */}
        {tabs.map((tab, index) => {
          const isSelected = tab.id === selectedTab;
          const tapGesture = createTapGesture(tab.id, index);
          
          return (
            <GestureDetector key={tab.id} gesture={tapGesture}>
              <Animated.View style={[styles.tab, { width: tabWidth }]}>
                <View style={styles.tabContent}>
                  {tab.icon ? <IconSymbol
                      name={tab.icon}
                      size={18}
                      color={isSelected ? colors.text.inverse : defaultInactiveColor}
                      style={styles.tabIcon}
                    /> : null}
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isSelected ? colors.text.inverse : defaultInactiveColor,
                        fontWeight: isSelected ? '600' : '500',
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {tab.label}
                  </Text>
                </View>
              </Animated.View>
            </GestureDetector>
          );
        })}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  liquidBackground: {
    position: 'absolute',
    height: '100%',
    borderRadius: 21,
    top: 4,
    left: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    textAlign: 'center',
    numberOfLines: 1,
  },
});