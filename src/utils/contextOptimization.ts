/**
 * Smart Context Optimization for AI Interactions
 * Intelligently prunes conversation context to optimize token usage while maintaining relevance
 */

export interface MessageContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  relevanceScore?: number;
  sentiment?: string;
  metadata?: {
    language?: string;
    crisis?: boolean;
    topics?: string[];
  };
}

export interface ContextOptimizationOptions {
  maxTokens: number;
  prioritizeCrisis: boolean;
  maintainConversationFlow: boolean;
  includeSystemMessages: boolean;
  languagePreference?: 'en' | 'ar';
  topicRelevanceThreshold: number;
}

/**
 * Estimates token count for a message (rough approximation)
 */
function estimateTokenCount(content: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English, 2-3 for Arabic
  const hasArabic = /[\u0600-\u06FF]/.test(content);
  const avgCharsPerToken = hasArabic ? 2.5 : 4;
  return Math.ceil(content.length / avgCharsPerToken);
}

/**
 * Calculate relevance score for a message based on various factors
 */
function calculateRelevanceScore(
  message: MessageContext,
  options: ContextOptimizationOptions,
  currentTopics: string[] = []
): number {
  let score = 1; // Base score

  // Recency factor (more recent = higher score)
  const ageInHours = (Date.now() - message.timestamp) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 2 - ageInHours / 24); // Decays over 48 hours
  score += recencyScore;

  // Crisis content gets highest priority
  if (options.prioritizeCrisis && message.metadata?.crisis) {
    score += 10;
  }

  // Role-based scoring
  if (message.role === 'system') {
    score += options.includeSystemMessages ? 3 : -5;
  } else if (message.role === 'assistant') {
    score += 0.5; // Slightly prefer keeping AI responses for context
  }

  // Language preference
  if (options.languagePreference) {
    const messageLanguage = detectMessageLanguage(message.content);
    if (messageLanguage === options.languagePreference) {
      score += 1;
    } else {
      score -= 0.5;
    }
  }

  // Topic relevance
  if (message.metadata?.topics && currentTopics.length > 0) {
    const topicOverlap = message.metadata.topics.filter(topic => 
      currentTopics.includes(topic)
    ).length;
    const topicRelevance = topicOverlap / Math.max(currentTopics.length, 1);
    
    if (topicRelevance >= options.topicRelevanceThreshold) {
      score += topicRelevance * 2;
    }
  }

  // Sentiment considerations
  if (message.sentiment) {
    switch (message.sentiment) {
      case 'crisis':
      case 'negative':
        score += options.prioritizeCrisis ? 2 : 0.5;
        break;
      case 'positive':
        score += 0.5;
        break;
      case 'neutral':
        score += 0.1;
        break;
    }
  }

  // Message length consideration (very short messages are less valuable)
  if (message.content.length < 10) {
    score -= 0.5;
  } else if (message.content.length > 500) {
    score += 0.5; // Longer messages might contain more context
  }

  return Math.max(0, score);
}

/**
 * Simple language detection
 */
function detectMessageLanguage(content: string): 'en' | 'ar' | 'mixed' {
  const arabicChars = (content.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = content.replace(/\s/g, '').length;
  
  if (arabicChars === 0) return 'en';
  if (arabicChars / totalChars > 0.7) return 'ar';
  return 'mixed';
}

/**
 * Extract topics from message content (simplified keyword extraction)
 */
function extractTopics(content: string): string[] {
  const topicKeywords = {
    mental_health: ['anxiety', 'depression', 'stress', 'panic', 'قلق', 'اكتئاب', 'ضغط'],
    relationships: ['family', 'friends', 'partner', 'love', 'عائلة', 'أصدقاء', 'حب'],
    work: ['job', 'career', 'boss', 'workplace', 'عمل', 'وظيفة', 'مهنة'],
    health: ['pain', 'sick', 'doctor', 'hospital', 'ألم', 'مريض', 'طبيب'],
    crisis: ['suicide', 'death', 'hurt', 'kill', 'انتحار', 'موت', 'أذى'],
    emotions: ['happy', 'sad', 'angry', 'fear', 'سعيد', 'حزين', 'غاضب', 'خوف'],
  };

  const contentLower = content.toLowerCase();
  const detectedTopics: string[] = [];

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics;
}

/**
 * Maintain conversation flow by ensuring context continuity
 */
function ensureConversationFlow(
  selectedMessages: MessageContext[],
  originalMessages: MessageContext[]
): MessageContext[] {
  if (!selectedMessages.length || selectedMessages.length === originalMessages.length) {
    return selectedMessages;
  }

  const result = [...selectedMessages];
  
  // Ensure we have recent conversation flow
  const lastSelected = selectedMessages[selectedMessages.length - 1];
  const lastSelectedIndex = originalMessages.findIndex(m => 
    m.timestamp === lastSelected.timestamp && m.content === lastSelected.content
  );

  // If there's a gap at the end, fill it with most recent messages
  if (lastSelectedIndex < originalMessages.length - 1) {
    const recentMessages = originalMessages.slice(lastSelectedIndex + 1);
    result.push(...recentMessages);
  }

  // Sort by timestamp to maintain order
  return result.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Smart context pruning algorithm
 */
export function optimizeContext(
  messages: MessageContext[],
  options: ContextOptimizationOptions
): MessageContext[] {
  if (!messages.length) return [];

  // Enhance messages with metadata and relevance scores
  const currentTopics = extractTopics(
    messages.slice(-3).map(m => m.content).join(' ')
  );

  const enhancedMessages = messages.map(message => ({
    ...message,
    metadata: {
      ...message.metadata,
      language: detectMessageLanguage(message.content),
      topics: extractTopics(message.content),
    },
    relevanceScore: calculateRelevanceScore(message, options, currentTopics),
  }));

  // Always include crisis messages
  const crisisMessages = enhancedMessages.filter(m => 
    options.prioritizeCrisis && (
      m.metadata?.crisis || 
      (m.metadata?.topics && m.metadata.topics.includes('crisis'))
    )
  );

  // Sort by relevance score (descending)
  const sortedByRelevance = enhancedMessages
    .filter(m => !crisisMessages.includes(m))
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  // Select messages within token limit
  let selectedMessages: MessageContext[] = [...crisisMessages];
  let totalTokens = selectedMessages.reduce(
    (sum, msg) => sum + estimateTokenCount(msg.content),
    0
  );

  // Add messages by relevance until we hit token limit
  for (const message of sortedByRelevance) {
    const messageTokens = estimateTokenCount(message.content);
    
    if (totalTokens + messageTokens <= options.maxTokens) {
      selectedMessages.push(message);
      totalTokens += messageTokens;
    }
  }

  // Maintain conversation flow if requested
  if (options.maintainConversationFlow) {
    selectedMessages = ensureConversationFlow(selectedMessages, enhancedMessages);
  }

  // Final sort by timestamp
  return selectedMessages.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get optimized context for AI interactions
 */
export function getOptimizedContext(
  messages: any[],
  newMessage: string,
  maxTokens: number = 4000
): MessageContext[] {
  // Convert messages to MessageContext format
  const contextMessages: MessageContext[] = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp || Date.now(),
    sentiment: msg.sentiment,
    metadata: {
      language: msg.metadata?.language,
      crisis: msg.metadata?.crisis,
    },
  }));

  // Add the new message
  contextMessages.push({
    role: 'user',
    content: newMessage,
    timestamp: Date.now(),
    metadata: {
      language: detectMessageLanguage(newMessage),
      topics: extractTopics(newMessage),
      crisis: extractTopics(newMessage).includes('crisis'),
    },
  });

  // Optimize context
  const options: ContextOptimizationOptions = {
    maxTokens,
    prioritizeCrisis: true,
    maintainConversationFlow: true,
    includeSystemMessages: false,
    topicRelevanceThreshold: 0.3,
  };

  return optimizeContext(contextMessages, options);
}

/**
 * Alternative to buildRecentMessages that uses smart optimization
 */
export function buildOptimizedRecentMessages(
  messages: any[],
  newMessage: string,
  maxTokens: number = 4000
): { role: string; content: string; timestamp: number }[] {
  const optimizedContext = getOptimizedContext(messages, newMessage, maxTokens);
  
  return optimizedContext.map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
  }));
}

/**
 * Analyze context efficiency
 */
export function analyzeContextEfficiency(
  originalMessages: MessageContext[],
  optimizedMessages: MessageContext[]
): {
  originalTokens: number;
  optimizedTokens: number;
  compressionRatio: number;
  messagesKept: number;
  messagesRemoved: number;
  crisisMessagesPreserved: number;
} {
  const originalTokens = originalMessages.reduce(
    (sum, msg) => sum + estimateTokenCount(msg.content),
    0
  );
  
  const optimizedTokens = optimizedMessages.reduce(
    (sum, msg) => sum + estimateTokenCount(msg.content),
    0
  );

  const crisisMessagesPreserved = optimizedMessages.filter(
    msg => msg.metadata?.crisis || msg.metadata?.topics?.includes('crisis')
  ).length;

  return {
    originalTokens,
    optimizedTokens,
    compressionRatio: originalTokens > 0 ? optimizedTokens / originalTokens : 1,
    messagesKept: optimizedMessages.length,
    messagesRemoved: originalMessages.length - optimizedMessages.length,
    crisisMessagesPreserved,
  };
}