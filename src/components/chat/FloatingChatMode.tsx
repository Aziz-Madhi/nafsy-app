import { GlassInput } from '@/components/glass';
import { useTypingDotsAnimation } from '@/hooks/animations';
import { useChatManager } from '@/hooks/useChatManager';
import { useAppTheme } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '../core/Icon/IconSymbol';

const { width } = Dimensions.get('window');

interface FloatingChatModeProps {
  onSwitchToFullChat: () => void;
}

// Animated message bubble component
function MessageBubble({ 
  text,
  role,
  animatedStyle,
  isDark
}: { 
  text: string;
  role: 'user' | 'assistant';
  animatedStyle: any;
  isDark: boolean;
}) {
  const isUser = role === 'user';
  
  return (
    <Animated.View style={[
      styles.messageBubble,
      isUser ? styles.userBubble : styles.assistantBubble,
      animatedStyle,
      isDark && !isUser && { backgroundColor: 'rgba(175, 122, 197, 0.8)' },
      isDark && isUser && { backgroundColor: 'rgba(74, 144, 226, 0.9)' },
    ]}>
      <Text style={[
        styles.messageText,
        { color: '#FFFFFF' }
      ]}>
        {text}
      </Text>
    </Animated.View>
  );
}

// Simple typing indicator
function SimpleTyping() {
  const { dotStyles } = useTypingDotsAnimation({
    duration: 400,
    delay: 150,
    dotCount: 3,
  });

  const dotBaseStyle = {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    backgroundColor: '#C0C5D0',
  };

  return (
    <View style={{
      flexDirection: 'row',
      padding: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignSelf: 'center',
    }}>
      {dotStyles.map((dotStyle, index) => (
        <Animated.View key={index} style={[dotBaseStyle, dotStyle]} />
      ))}
    </View>
  );
}

export function FloatingChatMode({
  onSwitchToFullChat,
}: FloatingChatModeProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  
  // Use chat manager for real AI conversations
  const {
    handleSendMessage: sendToAI,
    isTyping,
    floatingMessages,
  } = useChatManager('floating');
  
  // Animation values for message transitions
  const firstMessageOpacity = useSharedValue(1);
  const firstMessageTranslateY = useSharedValue(0);
  const secondMessageOpacity = useSharedValue(1);
  const secondMessageTranslateY = useSharedValue(0);
  
  // Get latest 2 messages
  const latestMessages = floatingMessages.slice(-2);
  const [firstMessage, secondMessage] = latestMessages;
  
  // Animate message transitions when new messages arrive
  useEffect(() => {
    if (latestMessages.length === 2) {
      // When we have 2 messages, animate the first one moving up
      firstMessageTranslateY.value = withSpring(-20, { damping: 15 });
      firstMessageOpacity.value = withTiming(0.7, { duration: 300 });
      
      // Second message slides in from below
      secondMessageTranslateY.value = withSpring(0, { damping: 15 });
      secondMessageOpacity.value = withTiming(1, { duration: 300 });
    } else if (latestMessages.length === 1) {
      // Reset positions when we only have one message
      firstMessageTranslateY.value = withSpring(0, { damping: 15 });
      firstMessageOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [latestMessages.length, latestMessages, firstMessageOpacity, firstMessageTranslateY, secondMessageOpacity, secondMessageTranslateY]);
  
  // Animated styles
  const firstMessageStyle = useAnimatedStyle(() => ({
    opacity: firstMessageOpacity.value,
    transform: [{ translateY: firstMessageTranslateY.value }],
  }));
  
  const secondMessageStyle = useAnimatedStyle(() => ({
    opacity: secondMessageOpacity.value,
    transform: [{ translateY: secondMessageTranslateY.value }],
  }));

  // Gradient colors adapt based on theme
  const gradientColors = (isDark
    ? [colors.background.primary, colors.background.secondary, colors.background.tertiary]
    : ['#F5F7FA', '#EBF0F7', '#E1E9F5']) as [string, string, string];

  const handleSendMessage = () => {
    if (inputText.trim()) {
      sendToAI(inputText.trim());
      setInputText('');
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={onSwitchToFullChat}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'height' : undefined}>
        <LinearGradient
          colors={gradientColors}
          style={styles.gradient}
        >
          <SafeAreaView style={[styles.safeArea, { paddingBottom: insets.bottom }]}>          
            {/* Message bubbles container */}
            <View style={styles.messagesContainer}>
              {firstMessage ? (
                <MessageBubble
                  text={firstMessage.content}
                  role={firstMessage.role}
                  animatedStyle={firstMessageStyle}
                  isDark={isDark}
                />
              ) : null}
              
              {secondMessage ? (
                <MessageBubble
                  text={secondMessage.content}
                  role={secondMessage.role}
                  animatedStyle={secondMessageStyle}
                  isDark={isDark}
                />
              ) : null}
              
              {/* Show typing indicator */}
              {isTyping ? (
                <View style={{ marginTop: 16 }}>
                  <SimpleTyping />
                </View>
              ) : null}
            </View>

            {/* Input area at bottom */}
            <View style={styles.inputArea}>
              <GlassInput
                variant="input"
                borderRadius={30}
                padding={0}
                style={styles.blurContainer}
              >
                <View style={[
                  styles.inputContainer,
                  isDark && {
                    backgroundColor: '#2D3748',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }
                ]}>
                  <TextInput
                    style={[styles.textInput, isDark ? { color: '#FFFFFF' } : { color: '#1F2937' }]}
                    placeholder="Message..."
                    placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(107, 114, 128, 0.7)'}
                    value={inputText}
                    onChangeText={setInputText}
                    maxLength={200}
                    returnKeyType="send"
                    onSubmitEditing={handleSendMessage}
                  />
                  {inputText.trim() && (
                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={handleSendMessage}
                    >
                      <IconSymbol name="arrow.up.circle.fill" size={32} color="#6495ED" />
                    </TouchableOpacity>
                  )}
                </View>
              </GlassInput>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  messageBubble: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    marginVertical: 8,
    minWidth: 120,
    maxWidth: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assistantBubble: {
    backgroundColor: '#AF7AC5', // Lavender color for AI messages
    alignSelf: 'center',
  },
  userBubble: {
    backgroundColor: '#4A90E2', // Blue color for user messages
    alignSelf: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputArea: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  blurContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    // Ensure the blurred wrapper stretches full width so it doesn't collapse
    width: '100%',
    // Guarantee enough height so the input isn't reduced to a thin line
    minHeight: 56,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF', // Solid white background for maximum visibility
    width: '100%', // Prevent collapsing width so the input is always visible
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    color: '#1F2937', // Default color, overridden by inline styles
    minHeight: 24,
    fontWeight: '500',
    textAlignVertical: 'center',
  },
  sendButton: {
    marginLeft: 12,
  },
});