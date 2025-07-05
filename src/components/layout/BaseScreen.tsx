import React from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from '@/components/ui/img';
import { CommonStyles } from '@/utils/styles';
import { useTranslation } from '@/hooks/useLocale';
import * as AC from '@bacons/apple-colors';

interface BaseScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  headerRight?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollable?: boolean;
  centered?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  contentPadding?: boolean;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * BaseScreen - Reusable screen layout component
 * Following LEVER framework - single component handling all screen patterns
 * 
 * Features:
 * - Consistent header layout with optional back button
 * - Configurable content area (scrollable/fixed, centered/top-aligned)
 * - Keyboard avoidance for forms
 * - Pull-to-refresh support
 * - Customizable safe area handling
 */
export const BaseScreen = React.memo<BaseScreenProps>(function BaseScreen({
  children,
  title,
  subtitle,
  showBackButton = false,
  headerRight,
  refreshing = false,
  onRefresh,
  scrollable = false,
  centered = false,
  keyboardAvoiding = false,
  backgroundColor,
  contentPadding = true,
  safeAreaEdges = ['top', 'bottom'],
}) {
  const router = useRouter();
  const { locale } = useTranslation();

  const containerStyle = [
    CommonStyles.container,
    backgroundColor && { backgroundColor },
  ];

  const contentStyle = [
    contentPadding && CommonStyles.paddedContent,
    centered && CommonStyles.centeredContent,
    !contentPadding && !centered && { flex: 1 },
  ];

  const renderHeader = () => {
    if (!title && !showBackButton && !headerRight) return null;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          {showBackButton && (
            <TouchableOpacity
              style={CommonStyles.button}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Image
                source={locale === 'ar' ? 'sf:chevron.right' : 'sf:chevron.left'}
                size={24}
                tintColor={AC.systemBlue}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerCenter}>
          {title && <Text style={CommonStyles.title}>{title}</Text>}
          {subtitle && <Text style={CommonStyles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.headerRight}>
          {headerRight}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            centered && CommonStyles.centeredContent,
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={AC.systemBlue}
              />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={contentStyle}>
        {children}
      </View>
    );
  };

  const screenContent = (
    <SafeAreaView 
      style={containerStyle}
      edges={safeAreaEdges}
    >
      {renderHeader()}
      {renderContent()}
    </SafeAreaView>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {screenContent}
      </KeyboardAvoidingView>
    );
  }

  return screenContent;
});

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  headerLeft: {
    width: 60,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
});

/**
 * Specialized screen variants for common patterns
 */

// Form screen with keyboard avoidance
export const FormScreen = React.memo<Omit<BaseScreenProps, 'keyboardAvoiding' | 'scrollable'>>(function FormScreen(props) {
  return (
    <BaseScreen
      {...props}
      keyboardAvoiding
      scrollable
      showBackButton
    />
  );
});

// Content screen with pull-to-refresh
export const ContentScreen = React.memo<Omit<BaseScreenProps, 'scrollable'>>(function ContentScreen(props) {
  return (
    <BaseScreen
      {...props}
      scrollable
    />
  );
});

// Simple centered screen for empty states
export const CenteredScreen = React.memo<Omit<BaseScreenProps, 'centered' | 'scrollable'>>(function CenteredScreen(props) {
  return (
    <BaseScreen
      {...props}
      centered
    />
  );
});

// Modal-style screen with close button
export const ModalScreen = React.memo<Omit<BaseScreenProps, 'showBackButton'> & { onClose?: () => void }>(function ModalScreen(props) {
  const { onClose, ...rest } = props;
  
  return (
    <BaseScreen
      {...rest}
      headerRight={
        onClose ? (
          <TouchableOpacity onPress={onClose}>
            <Text style={CommonStyles.link}>Close</Text>
          </TouchableOpacity>
        ) : undefined
      }
    />
  );
});