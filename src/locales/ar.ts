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
  success: "نجح",
  
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
    },
  },
  
  // Main navigation
  navigation: {
    chat: "المحادثة",
    mood: "المزاج",
    exercises: "التمارين",
    profile: "الملف الشخصي",
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