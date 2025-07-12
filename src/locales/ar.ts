/**
 * Arabic translations for Nafsy app
 * Following LEVER framework - centralized translations instead of inline objects
 */
export const ar = {
  // App meta
  appName: "نفسي",
  
  // Common actions
  continue: "متابعة",
  cancel: "إلغاء",
  done: "تم",
  save: "حفظ",
  edit: "تعديل",
  delete: "حذف",
  confirm: "تأكيد",
  close: "إغلاق",
  retry: "إعادة المحاولة",
  loading: "جاري التحميل...",
  error: "خطأ",
  ok: "موافق",
  
  // Authentication
  auth: {
    welcome: {
      title: "مرحباً بك في نفسي",
      subtitle: "رفيقك الذكي للصحة النفسية",
      description: "احصل على دعم شخصي، تتبع مزاجك، وابني عادات صحية - كل ذلك في مساحة آمنة وخاصة.",
      selectLanguage: "اختر لغتك",
      arabic: "العربية",
      english: "English",
    },
    signIn: {
      title: "تسجيل الدخول",
      subtitle: "مرحباً بعودتك",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      signInButton: "تسجيل الدخول",
      orContinueWith: "أو تابع باستخدام",
      noAccount: "ليس لديك حساب؟",
      signUp: "إنشاء حساب",
      forgotPassword: "نسيت كلمة المرور؟",
      fillAllFields: "يرجى ملء جميع الحقول",
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      oauthError: "فشلت المصادقة. يرجى المحاولة مرة أخرى.",
      // OAuth providers
      google: "Google",
      apple: "Apple",
    },
    signUp: {
      title: "إنشاء حساب",
      subtitle: "انضم إلى نفسي اليوم",
      firstName: "الاسم الأول",
      lastName: "الاسم الأخير",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      signUpButton: "إنشاء حساب",
      orContinueWith: "أو تابع باستخدام",
      hasAccount: "لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
      termsAccept: "بالتسجيل، أنت توافق على",
      termsOfService: "شروط الخدمة",
      and: "و",
      privacyPolicy: "سياسة الخصوصية",
      passwordMismatch: "كلمات المرور غير متطابقة",
      passwordTooShort: "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل",
      // Email verification
      verifyEmail: "تأكيد بريدك الإلكتروني",
      verifyEmailDesc: "لقد أرسلنا رمز تأكيد إلى عنوان بريدك الإلكتروني",
      verificationCode: "رمز التأكيد",
      verify: "تأكيد",
      terms: "الشروط",
    },
    onboarding: {
      title: "مرحباً بك في نفسي",
      subtitle: "دعنا نخصص تجربتك",
      step1: {
        title: "ما الذي جلبك هنا؟",
        description: "ساعدنا في فهم أهدافك للصحة النفسية",
        options: {
          stress: "إدارة التوتر والقلق",
          mood: "تحسين المزاج والتوازن العاطفي",
          sleep: "نوم أفضل واسترخاء",
          habits: "بناء عادات صحية",
          support: "أحتاج شخصاً للحديث معه",
        },
      },
      step2: {
        title: "كيف تشعر اليوم؟",
        description: "هذا يساعدنا في تقديم دعم أفضل",
      },
      step3: {
        title: "إعداد الإشعارات",
        description: "ابق متصلاً بتذكيرات لطيفة",
        enableNotifications: "تفعيل الإشعارات",
        notificationsDescription: "سنرسل لك تذكيرات مفيدة ونصائح للعافية",
      },
      getStarted: "ابدأ",
      skip: "تخطي الآن",
      emergencyContact: "جهة اتصال الطوارئ (اختياري)",
      emergencyDescription: "أضف شخصاً يمكننا اقتراح الاتصال به في حالة الأزمات",
      encrypted: "تشفير من طرف إلى طرف",
      noSharing: "لن تُشارك بدون موافقة",
      deleteAnytime: "احذف بياناتك في أي وقت",
      // Chat onboarding specific
      preferences: "تفضيلاتك",
      notifications: "تذكيرات تسجيل المزاج اليومية",
      notificationDesc: "احصل على تذكيرات لتتبع مزاجك",
      voiceChat: "المحادثات الصوتية",
      voiceChatDesc: "تحدث مع نفسي باستخدام الصوت",
      theme: "مظهر التطبيق",
      themeAuto: "تلقائي",
      themeLight: "فاتح",
      themeDark: "داكن",
      privacy: "خصوصيتك مهمة",
      privacyDesc: "كل ما تشاركه مع نفسي مشفر وخاص. لن نشارك بياناتك أبداً دون إذنك. يمكنك حذف بياناتك في أي وقت.",
    },
  },
  
  // Main navigation
  navigation: {
    chat: "المحادثة",
    mood: "المزاج",
    exercises: "التمارين",
    profile: "الملف الشخصي",
  },
  
  // Crisis support
  crisis: {
    needHelp: "هل تحتاج مساعدة فورية؟",
    modal: {
      title: "الدعم الطارئ",
      subtitle: "إذا كنت في أزمة، المساعدة متاحة. اختر الخيار الذي يناسبك.",
    },
    callError: {
      title: "غير قادر على إجراء المكالمة",
      message: "يرجى الاتصال بالرقم يدوياً أو المحاولة مرة أخرى لاحقاً.",
    },
  },
  
  // Common actions (for global access)
  common: {
    close: "إغلاق",
    ok: "موافق",
    cancel: "إلغاء",
    continue: "متابعة",
  },
  
  // Chat screen
  chat: {
    title: "المحادثة",
    description: "رفيقك الذكي للصحة النفسية سيكون هنا قريباً",
    comingSoon: "قريباً",
    welcome: "مرحباً بك في نفسي",
    startConversation: "ابدأ محادثة مع رفيقك الذكي. أنا هنا لدعم رحلتك نحو الصحة النفسية.",
    placeholder: "اكتب رسالتك...",
    typing: "نفسي يكتب...",
    error: "خطأ في الرسالة",
    sendError: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
    floatingModeHint: "انقر مرتين للعودة إلى الوضع العائم",
    you: "أنت",
    assistant: "نفسي",
    search: {
      title: "البحث في الرسائل",
      placeholder: "ابحث في المحادثة...",
      results: "نتيجة",
      noResults: "لم يتم العثور على رسائل",
    },
    newChat: {
      title: "بدء محادثة جديدة؟",
      message: "سيؤدي هذا إلى أرشفة محادثتك الحالية وبدء محادثة جديدة. يمكنك الوصول إلى المحادثات السابقة من سجلك.",
      confirm: "محادثة جديدة",
    },
    summary: {
      title: "ملخص المحادثة",
      generating: "جاري تحليل محادثتك...",
      overview: "نظرة عامة",
      keyTopics: "المواضيع الرئيسية",
      moodProgression: "تطور المزاج",
      insights: "الرؤى العلاجية",
      nextSteps: "الخطوات المقترحة",
    },
    history: {
      title: "سجل المحادثات",
      loading: "جاري تحميل المحادثات...",
      empty: {
        title: "لا توجد محادثات بعد",
        description: "ابدأ المحادثة لترى سجل محادثاتك هنا",
      },
      message: "رسالة",
      messages: "رسائل",
      active: "الحالية",
      switchConversation: {
        title: "تبديل المحادثة؟",
        message: "سيؤدي هذا إلى التبديل إلى محادثة مختلفة. يمكنك العودة إلى هذه المحادثة لاحقاً.",
        confirm: "تبديل",
      },
    },
    management: {
      title: "أدوات المحادثة",
      features: "الميزات",
      stats: "الإحصائيات",
      totalConversations: "إجمالي المحادثات",
      newChat: {
        title: "بدء محادثة جديدة",
        description: "ابدأ محادثة جديدة",
      },
      search: {
        title: "البحث في الرسائل",
        description: "ابحث عن رسائل محددة في محادثتك",
      },
      history: {
        title: "سجل المحادثات",
        description: "تصفح محادثاتك السابقة",
      },
      summary: {
        title: "ملخص المحادثة",
        description: "احصل على رؤى من هذه المحادثة",
      },
    },
  },
  
  // Mood tracking
  mood: {
    title: "تتبع المزاج قريباً",
    description: "تتبع مزاجك اليومي واحصل على رؤى",
    trackMood: "تتبع مزاجك",
    howFeeling: "كيف تشعر؟",
    moodHistory: "تاريخ المزاج",
    insights: "الرؤى",
  },
  
  // Exercises
  exercises: {
    title: "التمارين قريباً",
    description: "تمارين علاجية لتحسين صحتك النفسية",
    exercises: "التمارين",
    breathingExercises: "تمارين التنفس",
    meditation: "التأمل",
    relaxation: "الاسترخاء",
    mindfulness: "اليقظة الذهنية",
    // Grounding exercise (5-4-3-2-1 technique)
    grounding: {
      title: "تمرين التأريض",
      step1: "اذكر 5 أشياء تراها",
      step2: "اذكر 4 أشياء تلمسها",
      step3: "اذكر 3 أشياء تسمعها",
      step4: "اذكر شيئين تشمهما",
      step5: "اذكر شيئاً واحداً تذوقه",
    },
    // Exercise data
    data: {
      // Breathing exercises
      boxBreathing: {
        title: "التنفس الصندوقي",
        description: "اهدئ عقلك بالتنفس المنتظم",
      },
      breathing478: {
        title: "تنفس 4-7-8",
        description: "تقنية استرخاء سريعة",
      },
      // Grounding exercises
      grounding54321: {
        title: "تقنية 5-4-3-2-1",
        description: "تواصل مع حواسك",
        steps: [
          "اذكر 5 أشياء يمكنك رؤيتها حولك",
          "اذكر 4 أشياء يمكنك لمسها أو الشعور بها",
          "اذكر 3 أشياء يمكنك سماعها",
          "اذكر شيئين يمكنك شمهما",
          "اذكر شيئاً واحداً يمكنك تذوقه",
        ],
      },
      // Thought challenge exercises
      thoughtChallenge: {
        title: "تحدي الأفكار",
        description: "افحص وأعد صياغة الأفكار السلبية",
        steps: [
          "حدد الفكرة السلبية",
          "قيم مشاعرك (0-10)",
          "اكتب الأدلة التي تدعم الفكرة",
          "اكتب الأدلة التي تعارض الفكرة",
          "اصنع فكرة متوازنة",
          "أعد تقييم مشاعرك",
        ],
      },
      // Gratitude exercises
      gratitudeJournal: {
        title: "يوميات الامتنان",
        description: "ركز على اللحظات الإيجابية",
        steps: [
          "فكر في 3 أشياء أنت ممتن لها اليوم",
          "اكتب لماذا أنت ممتن لكل منها",
          "لاحظ كيف تشعر بعد التأمل",
        ],
      },
    },
  },
  
  // Profile
  profile: {
    title: "الملف الشخصي",
    settings: "الإعدادات",
    preferences: "التفضيلات",
    notifications: "الإشعارات",
    privacy: "الخصوصية",
    help: "المساعدة والدعم",
    about: "عن نفسي",
    signOut: "تسجيل الخروج",
    account: "الحساب",
    general: "عام",
    support: "الدعم",
  },
  
  // Settings
  settings: {
    language: "اللغة",
    theme: "المظهر",
    notifications: "الإشعارات",
    privacy: "الخصوصية",
    security: "الأمان",
    help: "المساعدة",
    about: "حول",
    version: "الإصدار",
    feedback: "الملاحظات",
    contactSupport: "اتصال بالدعم",
  },
  
  // Errors and validation
  validation: {
    required: "هذا الحقل مطلوب",
    invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
    passwordTooShort: "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل",
    passwordsNotMatch: "كلمات المرور غير متطابقة",
    nameRequired: "الاسم مطلوب",
    emailRequired: "البريد الإلكتروني مطلوب",
    passwordRequired: "كلمة المرور مطلوبة",
  },
  
  // Success messages
  success: {
    accountCreated: "تم إنشاء الحساب بنجاح",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح",
    settingsSaved: "تم حفظ الإعدادات بنجاح",
    passwordChanged: "تم تغيير كلمة المرور بنجاح",
  },
  
  // Empty states
  empty: {
    noData: "لا توجد بيانات متاحة",
    noResults: "لم يتم العثور على نتائج",
    noNotifications: "لا توجد إشعارات",
    noHistory: "لا يوجد تاريخ متاح",
    comeBackLater: "عد لاحقاً للحصول على التحديثات",
  },
  
  // Time and dates
  time: {
    now: "الآن",
    today: "اليوم",
    yesterday: "أمس",
    thisWeek: "هذا الأسبوع",
    lastWeek: "الأسبوع الماضي",
    thisMonth: "هذا الشهر",
    lastMonth: "الشهر الماضي",
  },
  
  // Accessibility
  accessibility: {
    back: "الرجوع",
    close: "إغلاق",
    menu: "القائمة",
    search: "البحث",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    loading: "جاري التحميل",
    retry: "إعادة المحاولة",
  },
} as const;