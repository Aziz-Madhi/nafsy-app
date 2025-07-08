// Date and conversation utility functions

interface ConversationWithPreview {
  _id: string;
  userId?: string;
  title?: string;
  isActive?: boolean;
  messageCount: number;
  timestamp: number;
  createdAt?: number;
  firstMessage?: {
    content: string;
    timestamp: number;
    role: 'user' | 'assistant' | 'system';
  } | null;
  lastMessage?: {
    content: string;
    timestamp: number;
    role: 'user' | 'assistant' | 'system';
  } | null;
}

interface ConversationGroup {
  date: string;
  conversations: ConversationWithPreview[];
}

export const groupConversationsByDate = (
  conversations: ConversationWithPreview[],
  locale: string
): ConversationGroup[] => {
  if (!conversations || conversations.length === 0) {
    return [];
  }

  const groups = new Map<string, ConversationWithPreview[]>();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Filter out invalid conversations and sort by timestamp (newest first)
  const validConversations = conversations.filter(conv => 
    conv && 
    conv._id && 
    conv.timestamp && 
    !isNaN(conv.timestamp) && 
    conv.timestamp > 0
  );
  
  const sortedConversations = [...validConversations].sort((a, b) => b.timestamp - a.timestamp);

  sortedConversations.forEach((conversation) => {
    try {
      const conversationDate = new Date(conversation.timestamp);
      
      // Validate the date
      if (isNaN(conversationDate.getTime())) {
        console.warn('Invalid timestamp for conversation:', conversation._id, conversation.timestamp);
        return;
      }
      let groupKey: string;

      // Check if it's today
      if (conversationDate.toDateString() === today.toDateString()) {
        groupKey = locale === 'ar' ? 'اليوم' : 'Today';
      }
      // Check if it's yesterday
      else if (conversationDate.toDateString() === yesterday.toDateString()) {
        groupKey = locale === 'ar' ? 'أمس' : 'Yesterday';
      }
      // Check if it's this week
      else if (isThisWeek(conversationDate, today)) {
        groupKey = formatWeekday(conversationDate, locale);
      }
      // Check if it's this month
      else if (conversationDate.getMonth() === today.getMonth() && conversationDate.getFullYear() === today.getFullYear()) {
        groupKey = formatDate(conversationDate, locale, 'month');
      }
      // Older conversations
      else {
        groupKey = formatDate(conversationDate, locale, 'full');
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(conversation);
    } catch (error) {
      console.warn('Error processing conversation:', conversation._id, error);
    }
  });

  // Convert to array and maintain order
  const result: ConversationGroup[] = [];
  const orderedKeys = Array.from(groups.keys()).sort((a, b) => {
    // Today and Yesterday should come first
    if (a === 'Today' || a === 'اليوم') return -1;
    if (b === 'Today' || b === 'اليوم') return 1;
    if (a === 'Yesterday' || a === 'أمس') return -1;
    if (b === 'Yesterday' || b === 'أمس') return 1;
    
    // For other dates, sort by the first conversation in each group
    const groupA = groups.get(a)!;
    const groupB = groups.get(b)!;
    return groupB[0].timestamp - groupA[0].timestamp;
  });

  orderedKeys.forEach((key) => {
    result.push({
      date: key,
      conversations: groups.get(key)!,
    });
  });

  return result;
};

const isThisWeek = (date: Date, today: Date): boolean => {
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return date >= weekStart && date <= weekEnd;
};

const formatWeekday = (date: Date, locale: string): string => {
  const weekdays = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  };
  
  return weekdays[locale as keyof typeof weekdays][date.getDay()];
};

const formatDate = (date: Date, locale: string, type: 'month' | 'full'): string => {
  if (locale === 'ar') {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    if (type === 'month') {
      return `${date.getDate()} ${months[date.getMonth()]}`;
    } else {
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
  } else {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    if (type === 'month') {
      return `${months[date.getMonth()]} ${date.getDate()}`;
    } else {
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  }
};

export const generateConversationTitle = (conversation: ConversationWithPreview, locale: string): string => {
  // Use existing title if available
  if (conversation.title) {
    return conversation.title;
  }
  
  // Generate title from first message
  if (conversation.firstMessage) {
    const content = conversation.firstMessage.content;
    const truncated = content.length > 50 ? content.substring(0, 50) + '...' : content;
    return truncated;
  }
  
  // Default titles
  const defaultTitles = {
    en: 'New Conversation',
    ar: 'محادثة جديدة'
  };
  
  return defaultTitles[locale as keyof typeof defaultTitles];
};

export const formatConversationTime = (timestamp: number, locale: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If it's today, show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // If it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return locale === 'ar' ? 'أمس' : 'Yesterday';
  }
  
  // If it's this week
  if (isThisWeek(date, now)) {
    return formatWeekday(date, locale);
  }
  
  // For older dates, show short format
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const truncateMessage = (content: string, maxLength: number = 80): string => {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '...';
};

// Export formatMessageTime from dateHelpers for consistency
export { formatMessageTime } from './dateHelpers';