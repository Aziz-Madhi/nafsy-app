import { useTheme } from '@/theme';
import { useFloatingChunkedDisplay } from '@/hooks/useChunkedDisplay';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './IconSymbol';

const { width, height } = Dimensions.get('window');

interface FloatingMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  animation?: Animated.Value;
  fadeAnimation?: Animated.Value;
  chunks?: string[]; // For chunked display of AI responses
}

interface FloatingChatModeProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  recentMessages: FloatingMessage[];
  onSwitchToFullChat: () => void;
  quickReplies?: Array<{
    id: string;
    text: string;
    sentiment: 'positive' | 'neutral' | 'supportive';
  }>;
}

export function FloatingChatMode({
  onSendMessage,
  isTyping,
  recentMessages,
  onSwitchToFullChat,
  quickReplies = [],
}: FloatingChatModeProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [displayedMessages, setDisplayedMessages] = useState<FloatingMessage[]>([]);
  const [currentDisplayMessage, setCurrentDisplayMessage] = useState<FloatingMessage | null>(null);
  
  // Track last processed message to prevent duplicates
  const lastProcessedMessageId = useRef<string | null>(null);
  
  // Animations
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const inputPulseAnimation = useRef(new Animated.Value(1)).current;

  // Get the LATEST AI message for chunked display (not first)
  const latestAIMessage = recentMessages.slice().reverse().find(msg => msg.role === 'assistant');
  const aiChunks = latestAIMessage?.chunks || (latestAIMessage ? [latestAIMessage.content] : []);
  
  // Chunked display for AI responses
  const {
    currentChunk,
    currentIndex,
    totalChunks,
    isDisplaying: isDisplayingChunks,
    nextChunk,
    pauseChunks,
    resumeChunks,
    isPaused,
  } = useFloatingChunkedDisplay(aiChunks);

  // Gradient colors adapt based on theme
  const gradientColors = (isDark
    ? [colors.background.primary, colors.background.secondary, colors.background.tertiary]
    : ['#F5F7FA', '#EBF0F7', '#E1E9F5']) as [string, string, string];

  // Start gentle pulsing animation for input when empty
  useEffect(() => {
    if (!inputText) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(inputPulseAnimation, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(inputPulseAnimation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      inputPulseAnimation.setValue(1);
    }
  }, [inputText, inputPulseAnimation]);

  // Handle new messages - simplified and consolidated with chunked display
  useEffect(() => {
    if (recentMessages.length === 0) {
      setDisplayedMessages([]);
      lastProcessedMessageId.current = null;
      return;
    }

    // Get the latest message regardless of role
    const latestMessage = recentMessages[recentMessages.length - 1];
    
    // Check if this is truly a new message using ID tracking
    const isNewMessage = lastProcessedMessageId.current !== latestMessage.id;
    
    if (isNewMessage) {
      lastProcessedMessageId.current = latestMessage.id;
      
      // For user messages, show immediately
      // For AI messages, let chunked display handle it
      if (latestMessage.role === 'user') {
        const animatedMessage = {
          ...latestMessage,
          animation: new Animated.Value(0),
          fadeAnimation: new Animated.Value(0),
        };

        setDisplayedMessages([animatedMessage]);
        
        // Animate in user message immediately
        setTimeout(() => {
          Animated.timing(animatedMessage.fadeAnimation, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
        }, 30);
      } else if (latestMessage.role === 'assistant') {
        // For AI messages, create animated message but let chunked display control content
        const animatedMessage = {
          ...latestMessage,
          animation: new Animated.Value(0),
          fadeAnimation: new Animated.Value(1), // Start visible for AI messages
        };

        setDisplayedMessages([animatedMessage]);
      }
    }
  }, [recentMessages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  // Truncate AI messages for floating mode
  const truncateMessage = (content: string, role: 'user' | 'assistant') => {
    if (role === 'assistant' && content.length > 80) {
      return content.substring(0, 80) + '...';
    }
    return content;
  };

  const MessageBubble = ({ message, index, isLatestAI }: { 
    message: FloatingMessage; 
    index: number; 
    isLatestAI?: boolean;
  }) => {
    const isUser = message.role === 'user';
    
    // fadeAnimation: 0 = invisible, 1 = visible
    const opacity = message.fadeAnimation!;

    // Use chunked display for latest AI message, regular display for others
    const displayText = isLatestAI && message.role === 'assistant' 
      ? currentChunk 
      : truncateMessage(message.content, message.role);

    return (
      <TouchableOpacity
        style={[
          styles.floatingMessage,
          {
            opacity,
            zIndex: 10 - index, // Higher messages have lower z-index
          },
        ]}
        onPress={isLatestAI && totalChunks > 1 ? nextChunk : undefined}
        activeOpacity={isLatestAI && totalChunks > 1 ? 0.7 : 1}
      >
        <View style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          !isUser && isDark && { backgroundColor: 'rgba(60, 60, 60, 0.95)' },
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
            !isUser && isDark && { color: '#E5E7EB' },
          ]}>
            {displayText}
          </Text>
          
          {/* Progress indicator for chunked AI responses */}
          {isLatestAI && totalChunks > 1 && (
            <View style={styles.chunkProgress}>
              <View style={styles.progressDots}>
                {Array.from({ length: totalChunks }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor: i <= currentIndex 
                          ? (isDark ? '#6495ED' : '#4F46E5')
                          : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'),
                      },
                    ]}
                  />
                ))}
              </View>
              {totalChunks > 1 && (
                <Text style={[
                  styles.progressText,
                  { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }
                ]}>
                  {isPaused ? 'Tap to continue' : `${currentIndex + 1}/${totalChunks}`}
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Adjust UI when keyboard shows/hides (real devices)
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Simple three-dot typing indicator
  const SimpleTyping = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const createAnim = (dot: Animated.Value, delay: number) => {
        const anim = Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
          ])
        );
        anim.start();
        return anim;
      };

      const a1 = createAnim(dot1, 0);
      const a2 = createAnim(dot2, 150);
      const a3 = createAnim(dot3, 300);
      return () => { a1.stop(); a2.stop(); a3.stop(); };
    }, []);

    const renderDot = (opacity: Animated.Value) => (
      <Animated.View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          marginHorizontal: 2,
          backgroundColor: '#C0C5D0',
          opacity,
        }}
      />
    );

    return (
      <View style={{ flexDirection: 'row', padding: 6 }}>
        {renderDot(dot1)}
        {renderDot(dot2)}
        {renderDot(dot3)}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1} 
      onPress={onSwitchToFullChat}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
      >
        {/* Tap hint at top */}
        <SafeAreaView style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap anywhere for full chat</Text>
        </SafeAreaView>

        {/* Floating messages */}
        <Animated.View
          style={[
            styles.messagesContainer,
            {
              // Push the container up so that the bubble never overlaps the input.
              bottom: Animated.add(insets.bottom + 140, keyboardOffset),
            },
          ]}
        >
          {displayedMessages.map((message, index) => {
            // Check if this is the latest AI message for chunked display
            const isLatestAI = message.role === 'assistant' && 
                              message.id === latestAIMessage?.id;
            
            return (
              <MessageBubble 
                key={message.id} 
                message={message} 
                index={index}
                isLatestAI={isLatestAI}
              />
            );
          })}
          
          {/* Typing Indicator as floating bubble */}
          {isTyping && (
            <Animated.View 
              style={[
                styles.floatingMessage, 
                styles.typingBubble,
                isDark && { backgroundColor: 'rgba(60, 60, 60, 0.95)' },
                {
                  bottom: displayedMessages.length * 90,
                  opacity: 1,
                }
              ]}
            >
              <SimpleTyping />
            </Animated.View>
          )}
        </Animated.View>

        {/* Central Input Area */}
        <Animated.View style={[styles.inputArea, { bottom: Animated.add(insets.bottom + 20, keyboardOffset) }]}>
          <Animated.View
            style={[
              styles.inputWrapper,
              {
                transform: [{ scale: inputPulseAnimation }],
              },
            ]}
          >
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
              <View style={[styles.inputContainer, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <TextInput
                  style={[styles.textInput, isDark && { color: '#E5E7EB' }]}
                  placeholder="What's on your mind?"
                  placeholderTextColor={isDark ? 'rgba(156, 163, 175, 0.6)' : 'rgba(107, 114, 128, 0.6)'}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={200}
                  textAlign="center"
                  returnKeyType="send"
                  onSubmitEditing={handleSendMessage}
                />
                {inputText.trim() && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                  >
                    <IconSymbol 
                      name="arrow.up.circle.fill" 
                      size={32} 
                      color="#6495ED" 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </BlurView>
          </Animated.View>

          {/* Quick replies are hidden in floating mode to reduce clutter. */}
        </Animated.View>
      </LinearGradient>
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
  tapHint: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  tapHintText: {
    fontSize: 12,
    color: 'rgba(107, 114, 128, 0.5)',
    fontStyle: 'italic',
  },
  messagesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  floatingMessage: {
    position: 'absolute',
    bottom: 0,
    maxWidth: width * 0.8,
  },
  centerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 350,
  },
  blurContainer: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    color: '#1F2937',
    minHeight: 24,
    maxHeight: 80,
    fontWeight: '500',
  },
  sendButton: {
    marginLeft: 12,
  },
  bubble: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  userBubble: {
    backgroundColor: '#6495ED',
    alignSelf: 'center',
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignSelf: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#1F2937',
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  quickRepliesWrapper: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  bubblesWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 260, // leave room for the lower input field
  },
  inputArea: {
    position: "absolute",
    left: 0,
    right: 0,
    // bottom is animated via style prop
    alignItems: "center",
    paddingHorizontal: 24,
  },
  chunkProgress: {
    marginTop: 8,
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '500',
  },
});