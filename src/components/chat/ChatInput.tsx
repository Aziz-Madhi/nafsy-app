import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { IconSymbol } from "@/components/core/Icon/IconSymbol";

interface ChatInputProps {
  messageText: string;
  onChangeText: (text: string) => void;
  onSendMessage: () => void;
  placeholder: string;
  theme: any;
  activeConversation: any;
}

export function ChatInput({ 
  messageText, 
  onChangeText, 
  onSendMessage, 
  placeholder, 
  theme,
  activeConversation 
}: ChatInputProps) {
  if (!activeConversation) return null;

  return (
    <View style={[styles.inputContainer, { 
      backgroundColor: theme.colors.background.secondary, 
      borderTopColor: theme.colors.system.separator 
    }]}>
      <TextInput
        style={[styles.textInput, { 
          backgroundColor: theme.colors.background.primary,
          color: theme.colors.text.primary,
          borderColor: theme.colors.system.border
        }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.placeholder}
        value={messageText}
        onChangeText={onChangeText}
        multiline
        maxLength={1000}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.sendButton, { 
          backgroundColor: messageText.trim() ? theme.colors.interactive.primary : theme.colors.interactive.disabled,
          opacity: messageText.trim() ? 1 : 0.5
        }]}
        onPress={onSendMessage}
        disabled={!messageText.trim()}
      >
        <IconSymbol name="paperplane.fill" size={20} color={theme.colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
});