import { useTranslation } from "@/hooks/useLocale";

export function formatMessageDate(timestamp: number, locale: string = 'en'): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Today
  if (diffDays === 0 && date.getDate() === now.getDate()) {
    return locale === 'ar' ? 'اليوم' : 'Today';
  }

  // Yesterday
  if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
    return locale === 'ar' ? 'أمس' : 'Yesterday';
  }

  // Within a week
  if (diffDays < 7) {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', options).format(date);
  }

  // Older dates
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', options).format(date);
}

export function groupMessagesByDate(messages: any[], locale: string = 'en') {
  const groups: { date: string; messages: any[] }[] = [];
  let currentGroup: { date: string; messages: any[] } | null = null;

  messages.forEach((message) => {
    const messageDate = formatMessageDate(message.timestamp, locale);

    if (!currentGroup || currentGroup.date !== messageDate) {
      currentGroup = { date: messageDate, messages: [] };
      groups.push(currentGroup);
    }

    currentGroup.messages.push(message);
  });

  return groups;
}

export function formatMessageTime(timestamp: number, locale: string = 'en'): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale === 'en',
  };
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', options).format(date);
}