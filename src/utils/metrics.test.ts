/**
 * Unit Tests for Metrics Collection System
 * Tests the performance monitoring and metrics tracking functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { metricsCollector, recordChatMetric, getMetricsSummary } from './metrics';

describe('Metrics Collection System', () => {
  beforeEach(() => {
    // Clear metrics before each test
    metricsCollector.clearMetrics();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Basic Metric Recording', () => {
    it('should record a basic chat metric', () => {
      const metric = {
        messageLength: 50,
        language: 'en' as const,
        chatMode: 'full' as const,
        contextSize: 5,
        hasRecentMessages: true,
        hasUserInfo: true,
        totalDuration: 1500,
        crisisDetected: false,
      };

      recordChatMetric(metric);
      
      const summary = getMetricsSummary();
      expect(summary.totalMessages).toBe(1);
      expect(summary.averageResponseTime).toBe(1500);
    });

    it('should handle metrics with all optional fields', () => {
      const metric = {
        messageLength: 100,
        language: 'ar' as const,
        chatMode: 'floating' as const,
        contextSize: 10,
        hasRecentMessages: true,
        hasUserInfo: true,
        totalDuration: 2000,
        languageDetectionTime: 50,
        contextBuildingTime: 100,
        sendMessageTime: 1850,
        crisisDetected: true,
        crisisSeverity: 'high' as const,
        crisisIndicators: ['hopeless', 'anxiety'],
        aiResponseQuality: 4,
        responseRelevance: 5,
        error: 'Network timeout',
        errorType: 'network' as const,
        userId: 'user123',
        conversationId: 'conv456',
      };

      recordChatMetric(metric);
      
      const summary = getMetricsSummary();
      expect(summary.totalMessages).toBe(1);
      expect(summary.crisisDetectionRate).toBe(1);
      expect(summary.errorRate).toBe(1);
      expect(summary.qualityScore).toBe(4);
    });
  });

  describe('Aggregated Metrics Calculation', () => {
    it('should calculate correct averages for multiple metrics', () => {
      const metrics = [
        {
          messageLength: 50,
          language: 'en' as const,
          chatMode: 'full' as const,
          contextSize: 5,
          hasRecentMessages: true,
          hasUserInfo: true,
          totalDuration: 1000,
          crisisDetected: false,
          aiResponseQuality: 3,
        },
        {
          messageLength: 100,
          language: 'ar' as const,
          chatMode: 'floating' as const,
          contextSize: 8,
          hasRecentMessages: true,
          hasUserInfo: true,
          totalDuration: 2000,
          crisisDetected: true,
          aiResponseQuality: 5,
        },
        {
          messageLength: 75,
          language: 'en' as const,
          chatMode: 'full' as const,
          contextSize: 6,
          hasRecentMessages: true,
          hasUserInfo: true,
          totalDuration: 1500,
          crisisDetected: false,
          aiResponseQuality: 4,
          error: 'API Error',
        }
      ];

      metrics.forEach(recordChatMetric);
      
      const summary = getMetricsSummary();
      expect(summary.totalMessages).toBe(3);
      expect(summary.averageResponseTime).toBe(1500); // (1000 + 2000 + 1500) / 3
      expect(summary.crisisDetectionRate).toBeCloseTo(1/3);
      expect(summary.errorRate).toBeCloseTo(1/3);
      expect(summary.qualityScore).toBe(4); // (3 + 5 + 4) / 3
      expect(summary.languageDistribution.en).toBe(2);
      expect(summary.languageDistribution.ar).toBe(1);
      expect(summary.chatModeUsage.full).toBe(2);
      expect(summary.chatModeUsage.floating).toBe(1);
    });

    it('should calculate 95th percentile correctly', () => {
      // Add 100 metrics with known response times
      const responseTimes = Array.from({ length: 100 }, (_, i) => (i + 1) * 100);
      
      responseTimes.forEach(duration => {
        recordChatMetric({
          messageLength: 50,
          language: 'en',
          chatMode: 'full',
          contextSize: 5,
          hasRecentMessages: true,
          hasUserInfo: true,
          totalDuration: duration,
          crisisDetected: false,
        });
      });

      const summary = getMetricsSummary();
      expect(summary.performanceP95).toBe(9500); // 95th percentile of 100-10000ms range
    });
  });

  describe('Error Tracking', () => {
    it('should track different error types', () => {
      const errorMetrics = [
        {
          messageLength: 50,
          language: 'en' as const,
          chatMode: 'full' as const,
          contextSize: 5,
          hasRecentMessages: true,
          hasUserInfo: true,
          totalDuration: 1000,
          crisisDetected: false,
          error: 'Network error',
          errorType: 'network' as const,
        },
        {
          messageLength: 60,
          language: 'en' as const,
          chatMode: 'full' as const,
          contextSize: 5,
          hasRecentMessages: true,
          hasUserInfo: true,
          totalDuration: 1200,
          crisisDetected: false,
          error: 'API error',
          errorType: 'api' as const,
        }
      ];

      errorMetrics.forEach(recordChatMetric);
      
      const summary = getMetricsSummary();
      expect(summary.errorRate).toBe(1); // All messages had errors
      expect(summary.totalMessages).toBe(2);
    });

    it('should log errors immediately', () => {
      recordChatMetric({
        messageLength: 50,
        language: 'en',
        chatMode: 'full',
        contextSize: 5,
        hasRecentMessages: true,
        hasUserInfo: true,
        totalDuration: 1000,
        crisisDetected: false,
        error: 'Test error',
        errorType: 'internal',
      });

      // In development mode, should have logged the error
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it('should warn about slow performance', () => {
      recordChatMetric({
        messageLength: 50,
        language: 'en',
        chatMode: 'full',
        contextSize: 5,
        hasRecentMessages: true,
        hasUserInfo: true,
        totalDuration: 15000, // Very slow
        crisisDetected: false,
      });

      expect(console.warn).toHaveBeenCalledWith(
        'Slow chat response detected:',
        expect.any(Object)
      );
    });

    it('should detect crisis patterns', () => {
      recordChatMetric({
        messageLength: 50,
        language: 'en',
        chatMode: 'full',
        contextSize: 5,
        hasRecentMessages: true,
        hasUserInfo: true,
        totalDuration: 1000,
        crisisDetected: true,
        crisisSeverity: 'critical',
        crisisIndicators: ['suicide', 'hopeless'],
      });

      expect(console.warn).toHaveBeenCalledWith(
        'Critical crisis detected:',
        expect.any(Object)
      );
    });
  });

  describe('Memory Management', () => {
    it('should limit stored metrics to prevent memory leaks', () => {
      // Add more than the maximum stored metrics
      for (let i = 0; i < 1200; i++) {
        recordChatMetric({
          messageLength: 50,
          language: 'en',
          chatMode: 'full',
          contextSize: 5,
          hasRecentMessages: true,
          hasUserInfo: true,
          totalDuration: 1000,
          crisisDetected: false,
        });
      }

      const summary = getMetricsSummary();
      expect(summary.totalMessages).toBe(1000); // Should be capped at maxStoredMetrics
    });
  });

  describe('Time Range Queries', () => {
    it('should filter metrics by time range', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // Add metrics at different times
      recordChatMetric({
        messageLength: 50,
        language: 'en',
        chatMode: 'full',
        contextSize: 5,
        hasRecentMessages: true,
        hasUserInfo: true,
        totalDuration: 1000,
        crisisDetected: false,
      });

      // Mock the timestamp to be older
      const oldMetric = {
        messageLength: 60,
        language: 'ar' as const,
        chatMode: 'floating' as const,
        contextSize: 3,
        hasRecentMessages: true,
        hasUserInfo: true,
        totalDuration: 1500,
        crisisDetected: false,
        timestamp: twoHoursAgo.toISOString(),
        platform: 'ios' as const,
        version: '1.0.0',
      };

      metricsCollector.recordChatMetric(oldMetric);

      const recentMetrics = metricsCollector.getMetricsInRange(oneHourAgo, now);
      expect(recentMetrics).toHaveLength(1);
      expect(recentMetrics[0].messageLength).toBe(50);
    });
  });

  describe('Export Functionality', () => {
    it('should export metrics in correct JSON format', () => {
      recordChatMetric({
        messageLength: 50,
        language: 'en',
        chatMode: 'full',
        contextSize: 5,
        hasRecentMessages: true,
        hasUserInfo: true,
        totalDuration: 1000,
        crisisDetected: false,
      });

      const exported = metricsCollector.exportMetrics();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('exportTime');
      expect(parsed).toHaveProperty('aggregated');
      expect(parsed).toHaveProperty('detailed');
      expect(parsed.aggregated.totalMessages).toBe(1);
      expect(parsed.detailed).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration metrics', () => {
      recordChatMetric({
        messageLength: 0,
        language: 'en',
        chatMode: 'full',
        contextSize: 0,
        hasRecentMessages: false,
        hasUserInfo: false,
        totalDuration: 0,
        crisisDetected: false,
      });

      const summary = getMetricsSummary();
      expect(summary.totalMessages).toBe(1);
      expect(summary.averageResponseTime).toBe(0);
    });

    it('should handle metrics with missing optional quality scores', () => {
      recordChatMetric({
        messageLength: 50,
        language: 'en',
        chatMode: 'full',
        contextSize: 5,
        hasRecentMessages: true,
        hasUserInfo: true,
        totalDuration: 1000,
        crisisDetected: false,
        // No aiResponseQuality provided
      });

      const summary = getMetricsSummary();
      expect(summary.qualityScore).toBe(0); // Should handle missing quality scores
    });

    it('should handle empty metrics collection', () => {
      const summary = getMetricsSummary();
      
      expect(summary.totalMessages).toBe(0);
      expect(summary.averageResponseTime).toBe(0);
      expect(summary.errorRate).toBe(0);
      expect(summary.crisisDetectionRate).toBe(0);
      expect(summary.performanceP95).toBe(0);
      expect(summary.qualityScore).toBe(0);
    });
  });
});