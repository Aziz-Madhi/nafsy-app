/**
 * English translations for Nafsy app
 * Following LEVER framework - centralized translations instead of inline objects
 */
export const en = {
  // App meta
  appName: "Nafsy",
  
  // Common actions
  continue: "Continue",
  cancel: "Cancel",
  done: "Done",
  save: "Save",
  edit: "Edit",
  delete: "Delete",
  confirm: "Confirm",
  close: "Close",
  retry: "Retry",
  loading: "Loading...",
  error: "Error",
  
  // Authentication
  auth: {
    welcome: {
      title: "Welcome to Nafsy",
      subtitle: "Your AI-powered mental wellness companion",
      description: "Get personalized support, track your mood, and build healthy habits - all in a safe, private space.",
      selectLanguage: "Select your language",
      arabic: "العربية",
      english: "English",
    },
    signIn: {
      title: "Sign In",
      subtitle: "Welcome back",
      email: "Email",
      password: "Password",
      signInButton: "Sign In",
      orContinueWith: "Or continue with",
      noAccount: "Don't have an account?",
      signUp: "Sign Up",
      forgotPassword: "Forgot password?",
      fillAllFields: "Please fill in all fields",
      invalidCredentials: "Invalid email or password",
      oauthError: "Authentication failed. Please try again.",
      // OAuth providers
      google: "Google",
      apple: "Apple",
    },
    signUp: {
      title: "Create Account",
      subtitle: "Join Nafsy today",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      signUpButton: "Create Account",
      orContinueWith: "Or continue with",
      hasAccount: "Already have an account?",
      signIn: "Sign In",
      termsAccept: "By signing up, you agree to our",
      termsOfService: "Terms of Service",
      and: "and",
      privacyPolicy: "Privacy Policy",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 8 characters",
      // Email verification
      verifyEmail: "Verify Your Email",
      verifyEmailDesc: "We've sent a verification code to your email address",
      verificationCode: "Verification Code",
      verify: "Verify",
      terms: "Terms",
    },
    onboarding: {
      title: "Welcome to Nafsy",
      subtitle: "Let's personalize your experience",
      step1: {
        title: "What brings you here?",
        description: "Help us understand your mental wellness goals",
        options: {
          stress: "Managing stress and anxiety",
          mood: "Improving mood and emotional balance",
          sleep: "Better sleep and relaxation",
          habits: "Building healthy habits",
          support: "Need someone to talk to",
        },
      },
      step2: {
        title: "How are you feeling today?",
        description: "This helps us provide better support",
      },
      step3: {
        title: "Set up notifications",
        description: "Stay connected with gentle reminders",
        enableNotifications: "Enable notifications",
        notificationsDescription: "We'll send you helpful reminders and wellness tips",
      },
      getStarted: "Get Started",
      skip: "Skip for now",
      emergencyContact: "Emergency Contact (Optional)",
      emergencyDescription: "Add someone we can suggest contacting if you're in crisis",
      encrypted: "End-to-end encrypted",
      noSharing: "Never shared without consent",
      deleteAnytime: "Delete your data anytime",
      // Chat onboarding specific
      preferences: "Your Preferences",
      notifications: "Daily Mood Check-ins",
      notificationDesc: "Get reminded to track your mood",
      voiceChat: "Voice Conversations",
      voiceChatDesc: "Talk to Nafsy using voice",
      theme: "App Theme",
      themeAuto: "Automatic",
      themeLight: "Light",
      themeDark: "Dark",
      privacy: "Your privacy matters",
      privacyDesc: "Everything you share with Nafsy is encrypted and private. We never share your data without your permission. You can delete your data anytime.",
    },
  },
  
  // Main navigation
  navigation: {
    chat: "Chat",
    mood: "Mood",
    exercises: "Exercises",
    profile: "Profile",
  },
  
  // Chat screen
  chat: {
    title: "Chat",
    description: "Your AI wellness companion will be here soon",
    comingSoon: "Coming Soon",
    welcome: "Welcome to Nafsy",
    startConversation: "Start a conversation with your AI companion. I'm here to support your mental wellness journey.",
    placeholder: "Type your message...",
    typing: "Nafsy is typing...",
    error: "Message Error",
    sendError: "Failed to send message. Please try again.",
    floatingModeHint: "Double-tap to return to floating mode",
    you: "You",
    assistant: "Nafsy",
    search: {
      title: "Search Messages",
      placeholder: "Search in conversation...",
      results: "results found",
      noResults: "No messages found",
    },
    newChat: {
      title: "Start New Chat?",
      message: "This will archive your current conversation and start a fresh one. You can still access previous conversations from your history.",
      confirm: "New Chat",
    },
    summary: {
      title: "Conversation Summary",
      generating: "Analyzing your conversation...",
      overview: "Overview",
      keyTopics: "Key Topics",
      moodProgression: "Mood Progression",
      insights: "Therapeutic Insights",
      nextSteps: "Suggested Next Steps",
    },
    history: {
      title: "Chat History",
      loading: "Loading conversations...",
      empty: {
        title: "No conversations yet",
        description: "Start chatting to see your conversation history here",
      },
      message: "message",
      messages: "messages",
      active: "Current",
      switchConversation: {
        title: "Switch Conversation?",
        message: "This will switch to a different conversation. You can always come back to this one later.",
        confirm: "Switch",
      },
    },
    management: {
      title: "Chat Tools",
      features: "Features",
      stats: "Statistics",
      totalConversations: "Total Conversations",
      newChat: {
        title: "Start New Chat",
        description: "Begin a fresh conversation",
      },
      search: {
        title: "Search Messages",
        description: "Find specific messages in your chat",
      },
      history: {
        title: "Chat History",
        description: "Browse your past conversations",
      },
      summary: {
        title: "Conversation Summary",
        description: "Get insights from this chat",
      },
    },
  },
  
  // Mood tracking
  mood: {
    title: "Mood Tracking Coming Soon",
    description: "Track your daily mood and see insights",
    trackMood: "Track Your Mood",
    howFeeling: "How are you feeling?",
    moodHistory: "Mood History",
    insights: "Insights",
  },
  
  // Exercises
  exercises: {
    title: "Exercises Coming Soon",
    description: "Therapeutic exercises to improve your wellbeing",
    exercises: "Exercises",
    breathingExercises: "Breathing Exercises",
    meditation: "Meditation",
    relaxation: "Relaxation",
    mindfulness: "Mindfulness",
    // Grounding exercise (5-4-3-2-1 technique)
    grounding: {
      title: "Grounding Exercise",
      step1: "Name 5 things you can see",
      step2: "Name 4 things you can touch",
      step3: "Name 3 things you can hear",
      step4: "Name 2 things you can smell",
      step5: "Name 1 thing you can taste",
    },
    // Exercise data
    data: {
      // Breathing exercises
      boxBreathing: {
        title: "Box Breathing",
        description: "Calm your mind with rhythmic breathing",
      },
      breathing478: {
        title: "4-7-8 Breathing",
        description: "Quick relaxation technique",
      },
      // Grounding exercises
      grounding54321: {
        title: "5-4-3-2-1 Grounding",
        description: "Connect with your senses",
        steps: [
          "Name 5 things you can see around you",
          "Name 4 things you can touch or feel",
          "Name 3 things you can hear",
          "Name 2 things you can smell",
          "Name 1 thing you can taste",
        ],
      },
      // Thought challenge exercises
      thoughtChallenge: {
        title: "Thought Challenge",
        description: "Examine and reframe negative thoughts",
        steps: [
          "Identify the negative thought",
          "Rate your emotions (0-10)",
          "List evidence supporting the thought",
          "List evidence against the thought",
          "Create a balanced thought",
          "Re-rate your emotions",
        ],
      },
      // Gratitude exercises
      gratitudeJournal: {
        title: "Gratitude Journal",
        description: "Focus on positive moments",
        steps: [
          "Think of 3 things you are grateful for today",
          "Write why you are grateful for each",
          "Notice how you feel after reflecting",
        ],
      },
    },
  },
  
  // Profile
  profile: {
    title: "Profile",
    settings: "Settings",
    preferences: "Preferences",
    notifications: "Notifications",
    privacy: "Privacy",
    help: "Help & Support",
    about: "About Nafsy",
    signOut: "Sign Out",
    account: "Account",
    general: "General",
    support: "Support",
  },
  
  // Settings
  settings: {
    language: "Language",
    theme: "Theme",
    notifications: "Notifications",
    privacy: "Privacy",
    security: "Security",
    help: "Help",
    about: "About",
    version: "Version",
    feedback: "Feedback",
    contactSupport: "Contact Support",
  },
  
  // Errors and validation
  validation: {
    required: "This field is required",
    invalidEmail: "Please enter a valid email",
    passwordTooShort: "Password must be at least 8 characters",
    passwordsNotMatch: "Passwords do not match",
    nameRequired: "Name is required",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
  },
  
  // Success messages
  success: {
    accountCreated: "Account created successfully",
    profileUpdated: "Profile updated successfully",
    settingsSaved: "Settings saved successfully",
    passwordChanged: "Password changed successfully",
  },
  
  // Empty states
  empty: {
    noData: "No data available",
    noResults: "No results found",
    noNotifications: "No notifications",
    noHistory: "No history available",
    comeBackLater: "Come back later for updates",
  },
  
  // Time and dates
  time: {
    now: "Now",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This week",
    lastWeek: "Last week",
    thisMonth: "This month",
    lastMonth: "Last month",
  },
  
  // Accessibility
  accessibility: {
    back: "Go back",
    close: "Close",
    menu: "Menu",
    search: "Search",
    profile: "Profile",
    settings: "Settings",
    loading: "Loading",
    retry: "Retry",
  },
} as const;