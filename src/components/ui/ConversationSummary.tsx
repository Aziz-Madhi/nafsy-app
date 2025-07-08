import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { IconSymbol } from './IconSymbol';
import { useTheme } from '@/theme';
import { useTranslation } from '@/hooks/useLocale';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface ConversationSummaryProps {
  isVisible: boolean;
  onClose: () => void;
  conversationId: string | undefined;
  language: string;
}

export function ConversationSummary({ isVisible, onClose, conversationId, language }: ConversationSummaryProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  
  const summarizeConversation = useAction(api.ai.summarizeConversation);

  React.useEffect(() => {
    if (isVisible && conversationId && !summary) {
      loadSummary();
    }
  }, [isVisible, conversationId, loadSummary, summary]);

  const loadSummary = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      const result = await summarizeConversation({
        conversationId: conversationId as any,
        language,
      });
      setSummary(result);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!summary) return;
    
    const shareText = `${t('chat.summary.title')}\n\n${summary.summary}\n\n${t('chat.summary.keyTopics')}:\n${summary.keyTopics.join('\n• ')}\n\n${t('chat.summary.insights')}:\n${summary.therapeuticInsights.join('\n• ')}`;
    
    try {
      await Share.share({
        message: shareText,
        title: t('chat.summary.title'),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.system.separator }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {t('chat.summary.title')}
          </Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton} disabled={!summary}>
            <IconSymbol name="square.and.arrow.up" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                {t('chat.summary.generating')}
              </Text>
            </View>
          ) : summary ? (
            <View style={styles.summaryContainer}>
              {/* Summary */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  {t('chat.summary.overview')}
                </Text>
                <Text style={[styles.sectionContent, { color: theme.colors.text.secondary }]}>
                  {summary.summary}
                </Text>
              </View>

              {/* Key Topics */}
              {summary.keyTopics.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                    {t('chat.summary.keyTopics')}
                  </Text>
                  <View style={styles.tagContainer}>
                    {summary.keyTopics.map((topic: string, index: number) => (
                      <View
                        key={index}
                        style={[styles.tag, { backgroundColor: theme.colors.system.secondaryBackground }]}
                      >
                        <Text style={[styles.tagText, { color: theme.colors.text.primary }]}>
                          {topic}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Mood Progression */}
              {summary.moodProgression ? <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                    {t('chat.summary.moodProgression')}
                  </Text>
                  <Text style={[styles.sectionContent, { color: theme.colors.text.secondary }]}>
                    {summary.moodProgression}
                  </Text>
                </View> : null}

              {/* Therapeutic Insights */}
              {summary.therapeuticInsights.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                    {t('chat.summary.insights')}
                  </Text>
                  {summary.therapeuticInsights.map((insight: string, index: number) => (
                    <View key={index} style={styles.insightItem}>
                      <IconSymbol 
                        name="lightbulb.fill" 
                        size={16} 
                        color={theme.colors.mood.calm} 
                      />
                      <Text style={[styles.insightText, { color: theme.colors.text.secondary }]}>
                        {insight}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Next Steps */}
              {summary.suggestedNextSteps.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                    {t('chat.summary.nextSteps')}
                  </Text>
                  {summary.suggestedNextSteps.map((step: string, index: number) => (
                    <View key={index} style={styles.stepItem}>
                      <Text style={[styles.stepNumber, { color: theme.colors.interactive.primary }]}>
                        {index + 1}
                      </Text>
                      <Text style={[styles.stepText, { color: theme.colors.text.secondary }]}>
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  shareButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  summaryContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '600',
    width: 24,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});