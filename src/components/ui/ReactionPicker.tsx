import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
 Platform } from 'react-native';
import { useTheme } from '@/theme';
import { useTranslation } from '@/hooks/useLocale';
import { BlurView } from 'expo-blur';

interface ReactionPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectReaction: (type: 'helpful' | 'not-helpful' | 'emoji', emoji?: string) => void;
  position: { x: number; y: number };
}

const REACTIONS = [
  { type: 'helpful' as const, emoji: '👍', label: 'Helpful' },
  { type: 'not-helpful' as const, emoji: '👎', label: 'Not helpful' },
  { type: 'emoji' as const, emoji: '❤️', label: 'Love' },
  { type: 'emoji' as const, emoji: '🤗', label: 'Comforting' },
  { type: 'emoji' as const, emoji: '💡', label: 'Insightful' },
  { type: 'emoji' as const, emoji: '🙏', label: 'Grateful' },
];

export function ReactionPicker({ isVisible, onClose, onSelectReaction, position }: ReactionPickerProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Calculate position to keep picker on screen
  const pickerWidth = 280;
  const pickerHeight = 80;
  const padding = 20;
  
  let adjustedX = position.x - pickerWidth / 2;
  let adjustedY = position.y - pickerHeight - 20;
  
  // Keep within screen bounds
  adjustedX = Math.max(padding, Math.min(adjustedX, screenWidth - pickerWidth - padding));
  adjustedY = Math.max(padding, Math.min(adjustedY, screenHeight - pickerHeight - padding));

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View 
          style={[
            styles.pickerContainer,
            {
              position: 'absolute',
              left: adjustedX,
              top: adjustedY,
            }
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={95} tint="systemMaterial" style={styles.blurContainer}>
              <View style={styles.reactionsRow}>
                {REACTIONS.map((reaction, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.reactionButton}
                    onPress={() => {
                      onSelectReaction(reaction.type, reaction.type === 'emoji' ? reaction.emoji : undefined);
                      onClose();
                    }}
                  >
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          ) : (
            <View style={[
              styles.androidContainer,
              { 
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.system.border,
              }
            ]}>
              <View style={styles.reactionsRow}>
                {REACTIONS.map((reaction, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.reactionButton}
                    onPress={() => {
                      onSelectReaction(reaction.type, reaction.type === 'emoji' ? reaction.emoji : undefined);
                      onClose();
                    }}
                  >
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  pickerContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  androidContainer: {
    borderRadius: 20,
    borderWidth: 1,
  },
  reactionsRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  reactionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  reactionEmoji: {
    fontSize: 24,
  },
});