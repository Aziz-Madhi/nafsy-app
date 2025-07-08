import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useTheme } from '@/theme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/hooks/useLocale';

interface MoodFactor {
  id: string;
  emoji: string;
  label: { en: string; ar: string };
}

const MOOD_FACTORS: MoodFactor[] = [
  { id: 'sleep', emoji: '😴', label: { en: 'Sleep', ar: 'النوم' } },
  { id: 'exercise', emoji: '🏃', label: { en: 'Exercise', ar: 'التمرين' } },
  { id: 'work', emoji: '💼', label: { en: 'Work', ar: 'العمل' } },
  { id: 'relationships', emoji: '❤️', label: { en: 'Relationships', ar: 'العلاقات' } },
  { id: 'health', emoji: '🏥', label: { en: 'Health', ar: 'الصحة' } },
  { id: 'finance', emoji: '💰', label: { en: 'Finance', ar: 'المال' } },
  { id: 'social', emoji: '👥', label: { en: 'Social', ar: 'الاجتماعي' } },
  { id: 'hobby', emoji: '🎨', label: { en: 'Hobbies', ar: 'الهوايات' } },
  { id: 'weather', emoji: '☀️', label: { en: 'Weather', ar: 'الطقس' } },
  { id: 'food', emoji: '🍽️', label: { en: 'Food', ar: 'الطعام' } },
  { id: 'stress', emoji: '😰', label: { en: 'Stress', ar: 'التوتر' } },
  { id: 'anxiety', emoji: '😟', label: { en: 'Anxiety', ar: 'القلق' } },
];

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊', '😄', '🤩'];

interface MoodTrackerProps {
  userId: Id<"users">;
  onComplete?: () => void;
}

export function MoodTracker({ userId, onComplete }: MoodTrackerProps) {
  const { colors, isDark } = useTheme();
  const { t, locale } = useLocale();
  const insets = useSafeAreaInsets();
  
  const [moodRating, setMoodRating] = useState(5);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const recordMood = useMutation(api.moods.recordMood);

  const getMoodEmoji = (rating: number) => {
    const index = Math.floor((rating - 1) / 1.5);
    return MOOD_EMOJIS[Math.min(index, MOOD_EMOJIS.length - 1)];
  };

  const getMoodText = (rating: number) => {
    if (rating <= 2) return locale === 'ar' ? 'صعب جداً' : 'Very Difficult';
    if (rating <= 4) return locale === 'ar' ? 'صعب' : 'Difficult';
    if (rating <= 6) return locale === 'ar' ? 'معتدل' : 'Neutral';
    if (rating <= 8) return locale === 'ar' ? 'جيد' : 'Good';
    return locale === 'ar' ? 'ممتاز!' : 'Excellent!';
  };

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev =>
      prev.includes(factorId)
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await recordMood({
        userId,
        rating: moodRating,
        note: note.trim() || undefined,
        factors: selectedFactors.length > 0 ? selectedFactors : undefined,
      });
      
      // Reset form
      setMoodRating(5);
      setSelectedFactors([]);
      setNote('');
      
      onComplete?.();
    } catch (error) {
      console.error('Error recording mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
      >
        {/* Mood Rating Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {locale === 'ar' ? 'كيف تشعر اليوم؟' : 'How are you feeling today?'}
          </Text>
          
          <View style={styles.moodDisplay}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(moodRating)}</Text>
            <Text style={[styles.moodValue, { color: colors.text.primary }]}>
              {moodRating}/10
            </Text>
            <Text style={[styles.moodText, { color: colors.text.secondary }]}>
              {getMoodText(moodRating)}
            </Text>
          </View>
          
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderLabel, { color: colors.text.tertiary }]}>1</Text>
            <Slider
              style={styles.slider}
              value={moodRating}
              onValueChange={setMoodRating}
              minimumValue={1}
              maximumValue={10}
              step={1}
              minimumTrackTintColor={colors.interactive.primary}
              maximumTrackTintColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
              thumbTintColor={colors.interactive.primary}
            />
            <Text style={[styles.sliderLabel, { color: colors.text.tertiary }]}>10</Text>
          </View>
        </View>

        {/* Mood Factors Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {locale === 'ar' ? 'ما الذي يؤثر على مزاجك؟' : "What's affecting your mood?"}
          </Text>
          
          <View style={styles.factorsGrid}>
            {MOOD_FACTORS.map(factor => (
              <TouchableOpacity
                key={factor.id}
                style={[
                  styles.factorButton,
                  {
                    backgroundColor: selectedFactors.includes(factor.id)
                      ? colors.interactive.primary
                      : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    borderColor: selectedFactors.includes(factor.id)
                      ? colors.interactive.primary
                      : 'transparent',
                  },
                ]}
                onPress={() => toggleFactor(factor.id)}
              >
                <Text style={styles.factorEmoji}>{factor.emoji}</Text>
                <Text
                  style={[
                    styles.factorLabel,
                    {
                      color: selectedFactors.includes(factor.id)
                        ? '#FFFFFF'
                        : colors.text.secondary,
                    },
                  ]}
                >
                  {factor.label[locale]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {locale === 'ar' ? 'أي شيء آخر تود مشاركته؟' : 'Anything else you want to share?'}
          </Text>
          
          <View style={[styles.noteContainer, { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
          }]}>
            <TextInput
              style={[styles.noteInput, { color: colors.text.primary }]}
              placeholder={
                locale === 'ar' 
                  ? 'اكتب أفكارك هنا... (اختياري)'
                  : 'Write your thoughts here... (optional)'
              }
              placeholderTextColor={colors.text.tertiary}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
              textAlignVertical="top"
              textAlign={locale === 'ar' ? 'right' : 'left'}
            />
            <Text style={[styles.charCount, { color: colors.text.tertiary }]}>
              {note.length}/500
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.interactive.primary },
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {locale === 'ar' ? 'حفظ المزاج' : 'Save Mood'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  moodDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  moodEmoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  moodValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  moodText: {
    fontSize: 18,
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 20,
    textAlign: 'center',
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  factorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
  },
  factorEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  factorLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  noteContainer: {
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  noteInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});