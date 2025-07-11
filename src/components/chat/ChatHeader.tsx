import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { BaseScreen } from '@/components/layout/BaseScreen';
import { IconSymbol } from "@/components/core/Icon/IconSymbol";

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  onMenuPress: () => void;
  theme: any;
  children: React.ReactNode;
}

export function ChatHeader({ title, subtitle, onMenuPress, theme, children }: ChatHeaderProps) {
  return (
    <BaseScreen
      title={title}
      subtitle={subtitle}
      headerRight={
        <TouchableOpacity 
          onPress={onMenuPress}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="ellipsis" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
      }
      scrollable={false}
      contentPadding={false}
    >
      {children}
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
});