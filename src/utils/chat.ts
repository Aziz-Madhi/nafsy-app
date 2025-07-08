export interface SimpleMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/**
 * Build the recent messages array we send to the server.
 * It takes the last 9 existing messages (to keep context small)
 * and appends the newly typed user message so the LLM always sees it.
 */
export function buildRecentMessages(
  allMessages: { role: string; content: string; timestamp: number }[],
  userMessage: string,
  now: number = Date.now()
): SimpleMessage[] {
  const recent = allMessages.slice(-9).map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
    timestamp: m.timestamp,
  }));
  recent.push({ role: 'user', content: userMessage, timestamp: now });
  return recent;
} 