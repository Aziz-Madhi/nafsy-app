
// Detect whether a text is Arabic or English (naïve heuristic)
export function detectMessageLanguage(text: string): 'en' | 'ar' {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  const arabicKeywords = ['انا', 'هذا', 'هل', 'ماذا', 'كيف', 'متى', 'اين', 'لماذا', 'من', 'الى', 'في', 'على', 'مع', 'بعد', 'قبل'];
  const englishKeywords = ['i', 'am', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

  const lower = text.toLowerCase();

  if (arabicRegex.test(text)) return 'ar';

  const arabicCount = arabicKeywords.filter(k => lower.includes(k)).length;
  const englishCount = englishKeywords.filter(k => lower.includes(k)).length;

  if (arabicCount > 0) return 'ar';
  if (englishCount > arabicCount) return 'en';
  return 'en';
}

// Very light-weight sentiment heuristic (placeholder until we plug proper API)
export function analyzeSentiment(text: string): { score: number; label: string } {
  const positiveWords = ['happy', 'great', 'wonderful', 'excellent', 'proud', 'joy', 'سعيد', 'رائع', 'ممتاز', 'فخور', 'فرح'];
  const negativeWords = ['sad', 'difficult', 'hard', 'struggle', 'pain', 'حزين', 'صعب', 'ألم', 'معاناة'];

  const lower = text.toLowerCase();
  let score = 0;
  positiveWords.forEach(w => {
    if (lower.includes(w)) score += 0.2;
  });
  negativeWords.forEach(w => {
    if (lower.includes(w)) score -= 0.2;
  });
  score = Math.max(-1, Math.min(1, score));

  let label: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (score > 0.3) label = 'positive';
  else if (score < -0.3) label = 'negative';

  return { score, label };
}

// Break long AI responses into small chunks for floating mode
export function smartChunkResponse(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) return [text];

  const chunks: string[] = [];
  let currentChunk = '';
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (currentChunk.length + sentence.length + 1 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());

  // Final safeguard – split any oversized chunk by words
  const final: string[] = [];
  for (const c of chunks) {
    if (c.length <= maxChunkSize) final.push(c);
    else {
      const words = c.split(' ');
      let buf = '';
      for (const w of words) {
        if (buf.length + w.length + 1 <= maxChunkSize) buf += (buf ? ' ' : '') + w;
        else {
          if (buf) final.push(buf);
          buf = w;
        }
      }
      if (buf) final.push(buf);
    }
  }
  return final.length ? final : [text.slice(0, maxChunkSize)];
} 