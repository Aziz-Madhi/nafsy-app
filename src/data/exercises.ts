// OPTIMIZATION: Moved exercise data from inline to separate file for lazy loading
// This reduces initial bundle parsing time and allows for code splitting
// Following LEVER framework - Bundle size optimization
// NOTE: Uses centralized translation keys instead of inline translations

export const EXERCISES = {
  breathing: [
    {
      id: 'box-breathing',
      titleKey: 'exercises.data.boxBreathing.title',
      descriptionKey: 'exercises.data.boxBreathing.description',
      duration: '5 min',
      type: 'breathing' as const,
      difficulty: 'beginner' as const,
      icon: 'wind',
      gradient: ['#A3C9E2', '#85C1E9'] as [string, string], // Softer blue for breathing
      pattern: { inhale: 4, hold: 4, exhale: 4 },
    },
    {
      id: '478-breathing',
      titleKey: 'exercises.data.breathing478.title',
      descriptionKey: 'exercises.data.breathing478.description',
      duration: '3 min',
      type: 'breathing' as const,
      difficulty: 'intermediate' as const,
      icon: 'leaf',
      gradient: ['#8BC34A', '#7ED321'] as [string, string], // Softer green for calm
      pattern: { inhale: 4, hold: 7, exhale: 8 },
    },
  ],
  grounding: [
    {
      id: '54321-grounding',
      titleKey: 'exercises.data.grounding54321.title',
      descriptionKey: 'exercises.data.grounding54321.description',
      duration: '7 min',
      type: 'grounding' as const,
      difficulty: 'beginner' as const,
      icon: 'hand.raised',
      gradient: ['#FFAB78', '#F5A623'] as [string, string], // Softer orange for grounding
      stepsKey: 'exercises.data.grounding54321.steps',
    },
  ],
  thoughtChallenge: [
    {
      id: 'thought-record',
      titleKey: 'exercises.data.thoughtChallenge.title',
      descriptionKey: 'exercises.data.thoughtChallenge.description',
      duration: '10 min',
      type: 'thoughtChallenge' as const,
      difficulty: 'advanced' as const,
      icon: 'brain',
      gradient: ['#B19CD9', '#AF7AC5'] as [string, string], // Softer purple for thoughts
      stepsKey: 'exercises.data.thoughtChallenge.steps',
    },
  ],
  gratitude: [
    {
      id: 'gratitude-journal',
      titleKey: 'exercises.data.gratitudeJournal.title',
      descriptionKey: 'exercises.data.gratitudeJournal.description',
      duration: '5 min',
      type: 'gratitude' as const,
      difficulty: 'beginner' as const,
      icon: 'heart.fill',
      gradient: ['#FFB6C1', '#FF91A4'] as [string, string], // Softer pink for gratitude
      stepsKey: 'exercises.data.gratitudeJournal.steps',
    },
  ],
};

export type Exercise = typeof EXERCISES.breathing[0];
export type ExerciseType = keyof typeof EXERCISES;