/**
 * Comprehensive Unit Tests for Crisis Detection System
 * Tests the enhanced crisis detection functionality in ai.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from './_generated/api';
import schema from './schema';

// Mock fetch for OpenAI API calls
global.fetch = vi.fn();

describe('Crisis Detection System', () => {
  let t: ConvexTestingHelper<typeof schema>;

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema);
    
    // Reset fetch mock
    vi.clearAllMocks();
    
    // Set up default OpenAI API mock response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify({
              isCrisis: false,
              severity: 'low',
              indicators: [],
              suggestedActions: []
            })
          }
        }]
      })
    });
  });

  describe('English Crisis Detection', () => {
    it('should detect critical suicide threats', async () => {
      const testMessages = [
        'I want to kill myself tonight',
        'I am planning to end my life',
        'I have pills ready to overdose',
        'This is my final message goodbye forever',
        'I cant go on anymore, ready to die'
      ];

      for (const message of testMessages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'en'
        });

        expect(result.isCrisis).toBe(true);
        expect(result.severity).toBe('critical');
        expect(result.indicators.length).toBeGreaterThan(0);
        expect(result.suggestedActions.length).toBeGreaterThan(0);
      }
    });

    it('should detect high severity emotional distress', async () => {
      const testMessages = [
        'I feel completely hopeless and alone',
        'I am having a severe panic attack',
        'I feel worthless and nobody cares about me',
        'I am completely broken inside',
        'I am losing my mind and going crazy'
      ];

      for (const message of testMessages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'en'
        });

        expect(result.isCrisis).toBe(true);
        expect(['high', 'critical']).toContain(result.severity);
        expect(result.indicators.length).toBeGreaterThan(0);
      }
    });

    it('should detect medium severity depression and anxiety', async () => {
      const testMessages = [
        'I feel depressed and overwhelmed',
        'I am struggling with anxiety daily',
        'I feel scared and cant cope anymore',
        'I am breaking down and need help',
        'I feel desperate and losing control'
      ];

      for (const message of testMessages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'en'
        });

        expect(result.isCrisis).toBe(true);
        expect(['medium', 'high']).toContain(result.severity);
      }
    });

    it('should not flag normal conversations as crisis', async () => {
      const testMessages = [
        'How are you doing today?',
        'I had a great day at work',
        'What should I have for dinner?',
        'I love spending time with my family',
        'The weather is nice today'
      ];

      for (const message of testMessages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'en'
        });

        expect(result.isCrisis).toBe(false);
        expect(result.severity).toBe('low');
      }
    });
  });

  describe('Arabic Crisis Detection', () => {
    it('should detect critical suicide threats in Arabic', async () => {
      const testMessages = [
        'أريد أن اقتل نفسي الليلة',
        'أنوي إنهاء حياتي',
        'لدي حبوب جاهزة للانتحار',
        'هذه رسالتي الأخيرة وداعاً للأبد',
        'لا أستطيع المتابعة، مستعد للموت'
      ];

      for (const message of testMessages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'ar'
        });

        expect(result.isCrisis).toBe(true);
        expect(result.severity).toBe('critical');
        expect(result.indicators.length).toBeGreaterThan(0);
      }
    });

    it('should detect high severity emotional distress in Arabic', async () => {
      const testMessages = [
        'أشعر باليأس التام والوحدة',
        'أعاني من نوبة هلع شديدة',
        'أشعر بأنني لا قيمة لي ولا أحد يهتم بي',
        'أنا منكسر تماماً من الداخل',
        'أفقد عقلي وأصبح مجنوناً'
      ];

      for (const message of testMessages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'ar'
        });

        expect(result.isCrisis).toBe(true);
        expect(['high', 'critical']).toContain(result.severity);
      }
    });

    it('should detect cultural and religious distress in Arabic', async () => {
      const testMessages = [
        'أصبحت عار العائلة وخجل الأهل',
        'أشعر أن الله لا يريدني',
        'لقد أهانت عائلتي وسمعتها',
        'أصبحت حراماً ومذنباً',
        'فضيحة الأسرة كلها بسببي'
      ];

      for (const message of testMessages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'ar'
        });

        expect(result.isCrisis).toBe(true);
        expect(result.indicators).toContain('Religious/Cultural Distress');
      }
    });
  });

  describe('Contextual Factor Analysis', () => {
    it('should escalate severity based on multiple contextual factors', async () => {
      const message = 'I feel hopeless and alone, nobody understands me, I cant take it anymore';
      
      const result = await t.action(api.ai.detectCrisis, {
        message,
        language: 'en'
      });

      expect(result.isCrisis).toBe(true);
      // Should be escalated due to multiple factors (hopelessness + isolation + emotional intensity)
      expect(['high', 'critical']).toContain(result.severity);
    });

    it('should detect time urgency factors', async () => {
      const testMessages = [
        'I am planning to do it tonight',
        'I will end this right now',
        'This is happening today',
        'Very soon I will be gone'
      ];

      for (const message of testMessages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'en'
        });

        expect(result.isCrisis).toBe(true);
        expect(['high', 'critical']).toContain(result.severity);
      }
    });

    it('should detect method references', async () => {
      const testMessages = [
        'I have rope ready for tonight',
        'The pills are in my hand',
        'I will jump from the bridge',
        'The knife is sharp enough'
      ];

      for (const message of testMessages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'en'
        });

        expect(result.isCrisis).toBe(true);
        expect(result.severity).toBe('critical');
      }
    });
  });

  describe('Severity Scoring System', () => {
    it('should accumulate severity scores correctly', async () => {
      // Multiple medium-level indicators should escalate to high
      const message = 'I feel depressed and anxious and overwhelmed and scared';
      
      const result = await t.action(api.ai.detectCrisis, {
        message,
        language: 'en'
      });

      expect(result.isCrisis).toBe(true);
      expect(['medium', 'high']).toContain(result.severity);
    });

    it('should not over-escalate low-severity content', async () => {
      const message = 'I feel a bit sad today';
      
      const result = await t.action(api.ai.detectCrisis, {
        message,
        language: 'en'
      });

      // Should remain low severity
      expect(result.severity).toBe('low');
    });
  });

  describe('AI Integration Fallback', () => {
    it('should fallback to keyword detection when AI fails', async () => {
      // Mock API failure
      (global.fetch as any).mockRejectedValue(new Error('API Error'));

      const message = 'I want to kill myself';
      
      const result = await t.action(api.ai.detectCrisis, {
        message,
        language: 'en'
      });

      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.indicators).toContain('kill myself');
    });

    it('should combine AI analysis with keyword detection', async () => {
      // Mock AI response that detects crisis
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                isCrisis: true,
                severity: 'high',
                indicators: ['AI detected hopelessness'],
                suggestedActions: ['Seek immediate help']
              })
            }
          }]
        })
      });

      const message = 'I feel hopeless and want to give up';
      
      const result = await t.action(api.ai.detectCrisis, {
        message,
        language: 'en'
      });

      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('high');
      // Should combine both keyword and AI indicators
      expect(result.indicators.length).toBeGreaterThan(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed AI responses gracefully', async () => {
      // Mock malformed JSON response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'invalid json'
            }
          }]
        })
      });

      const message = 'I feel sad';
      
      const result = await t.action(api.ai.detectCrisis, {
        message,
        language: 'en'
      });

      // Should fallback to keyword detection
      expect(result.severity).toBe('low');
      expect(result.isCrisis).toBe(false);
    });

    it('should handle API timeout gracefully', async () => {
      // Mock timeout
      (global.fetch as any).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const message = 'I want to hurt myself';
      
      const result = await t.action(api.ai.detectCrisis, {
        message,
        language: 'en'
      });

      // Should fallback to keyword detection
      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('critical');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle very long messages', async () => {
      const longMessage = 'I feel sad '.repeat(1000) + 'and want to kill myself';
      
      const result = await t.action(api.ai.detectCrisis, {
        message: longMessage,
        language: 'en'
      });

      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('critical');
    });

    it('should handle empty messages', async () => {
      const result = await t.action(api.ai.detectCrisis, {
        message: '',
        language: 'en'
      });

      expect(result.isCrisis).toBe(false);
      expect(result.severity).toBe('low');
    });

    it('should handle special characters and emojis', async () => {
      const message = '😭💔 I want to kill myself 💔😭';
      
      const result = await t.action(api.ai.detectCrisis, {
        message,
        language: 'en'
      });

      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('critical');
    });

    it('should be case insensitive', async () => {
      const messages = [
        'I WANT TO KILL MYSELF',
        'i want to kill myself',
        'I Want To Kill Myself'
      ];

      for (const message of messages) {
        const result = await t.action(api.ai.detectCrisis, {
          message,
          language: 'en'
        });

        expect(result.isCrisis).toBe(true);
        expect(result.severity).toBe('critical');
      }
    });
  });

  describe('Integration with Emergency Resources', () => {
    it('should return emergency resources for critical cases', async () => {
      // Mock emergency resources
      await t.mutation(api.resources.create, {
        title: 'Crisis Helpline',
        description: 'Emergency support',
        type: 'hotline',
        phone: '988',
        isEmergency: true,
        language: 'en'
      });

      const message = 'I want to kill myself tonight';
      
      const result = await t.action(api.ai.detectCrisis, {
        message,
        language: 'en'
      });

      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.resources).toBeDefined();
      expect(result.resources!.length).toBeGreaterThan(0);
      expect(result.resources![0]).toHaveProperty('phone');
    });
  });
});