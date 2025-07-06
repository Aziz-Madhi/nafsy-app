import { buildRecentMessages } from "@/utils/chat";

describe('buildRecentMessages', () => {
  it('should include last 9 messages plus new user message', () => {
    const base = Array.from({ length: 12 }).map((_, i) => ({
      role: i % 2 === 0 ? 'assistant' : 'user',
      content: `msg${i}`,
      timestamp: i,
    }));

    const result = buildRecentMessages(base, 'hello');

    // Should take last 9 of base => indices 3..11
    expect(result.length).toBe(10);
    expect(result[0].content).toBe('msg3');
    expect(result[8].content).toBe('msg11');
    // last element is the new user message
    expect(result[9]).toEqual(
      expect.objectContaining({ role: 'user', content: 'hello' })
    );
  });
}); 