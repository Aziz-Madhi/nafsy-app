import { useTheme } from '@/theme';
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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [displayedMessages, setDisplayedMessages] = useState<FloatingMessage[]>([]);
  
  // Animations
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const inputPulseAnimation = useRef(new Animated.Value(1)).current;

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

  // Handle new messages with floating animation
  useEffect(() => {
    if (recentMessages.length === 0) return;

    const latestMessage = recentMessages[recentMessages.length - 1];
    
    // Only process if this message is new
    const isNewMessage = displayedMessages.length === 0 || displayedMessages[0].id !== latestMessage.id;
    
    if (isNewMessage) {
      // Create animated message
      const animatedMessage = {
        ...latestMessage,
        animation: new Animated.Value(0), // Stationary; no slide-in
        fadeAnimation: new Animated.Value(0), // Start invisible
      };

      // If an old message is currently displayed, fade it out and remove it first
      if (displayedMessages.length === 1) {
        const old = displayedMessages[0];
        Animated.parallel([
          Animated.timing(old.fadeAnimation!, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Defer state update to next frame to avoid scheduling during commit
          requestAnimationFrame(() => {
            setDisplayedMessages([animatedMessage]);
            // animate the new message in after state update
            Animated.parallel([
              Animated.timing(animatedMessage.fadeAnimation, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
            ]).start();
          });
        });
      } else {
        // No previous message, just show this one
        setDisplayedMessages([animatedMessage]);
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(animatedMessage.fadeAnimation, {
              toValue: 1,
              duration: 250,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start();
        }, 30);
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

  const MessageBubble = ({ message, index }: { message: FloatingMessage; index: number }) => {
    const isUser = message.role === 'user';
    
    // fadeAnimation: 0 = invisible, 1 = visible
    const opacity = message.fadeAnimation!;

    return (
      <Animated.View
        style={[
          styles.floatingMessage,
          {
            opacity,
            zIndex: 10 - index, // Higher messages have lower z-index
          },
        ]}
        pointerEvents="none"
      >
        <View style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}>
            {truncateMessage(message.content, message.role)}
          </Text>
        </View>
      </Animated.View>
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
        colors={['#F5F7FA', '#EBF0F7', '#E1E9F5']}
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
          {displayedMessages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              index={index} 
            />
          ))}
          
          {/* Typing Indicator as floating bubble */}
          {isTyping && (
            <Animated.View 
              style={[
                styles.floatingMessage, 
                styles.typingBubble,
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
            <BlurView intensity={80} tint="light" style={styles.blurContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="What's on your mind?"
                  placeholderTextColor="rgba(107, 114, 128, 0.6)"
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
});