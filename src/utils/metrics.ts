/**
 * Performance and Quality Metrics Tracking System
 * For monitoring chat system performance and AI response quality
 */

export interface ChatMetrics {
  // Message characteristics
  messageId?: string;
  messageLength: number;
  language: 'en' | 'ar';
  chatMode: 'floating' | 'full';
  
  // Context information
  contextSize: number;
  hasRecentMessages: boolean;
  hasUserInfo: boolean;
  
  // Performance timing (in milliseconds)
  totalDuration: number;
  languageDetectionTime?: number;
  contextBuildingTime?: number;
  sendMessageTime?: number;
  userMessageTime?: number;
  crisisDetectionTime?: number;
  aiResponseTime?: number;
  
  // Quality metrics
  crisisDetected: boolean;
  crisisSeverity?: 'low' | 'medium' | 'high' | 'critical';
  crisisIndicators?: string[];
  aiResponseQuality?: number; // 1-5 rating
  responseRelevance?: number; // 1-5 rating
  
  // Error tracking
  error?: string;
  errorType?: 'network' | 'api' | 'validation' | 'internal' | 'unknown';
  
  // Metadata
  timestamp: string;
  userId?: string;
  conversationId?: string;
  platform: 'ios' | 'android' | 'web';
  version: string;
}

export interface AggregatedMetrics {
  totalMessages: number;
  averageResponseTime: number;
  errorRate: number;
  crisisDetectionRate: number;
  languageDistribution: { en: number; ar: number };
  chatModeUsage: { floating: number; full: number };
  performanceP95: number; // 95th percentile response time
  qualityScore: number; // Average AI response quality
}

class MetricsCollector {
  private metrics: ChatMetrics[] = [];
  private maxStoredMetrics = 1000; // Keep last 1000 metrics in memory

  /**
   * Record a chat interaction metric
   */
  recordChatMetric(metric: ChatMetrics) {
    // Add platform and version info
    const enhancedMetric: ChatMetrics = {
      ...metric,
      platform: this.getPlatform(),
      version: this.getAppVersion(),
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(enhancedMetric);

    // Keep only recent metrics in memory
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics);
    }

    // Log performance issues immediately
    this.checkPerformanceThresholds(enhancedMetric);

    // In production, you might want to send this to an analytics service
    if (__DEV__) {
      console.log('Chat Metric Recorded:', enhancedMetric);
    }
  }

  /**
   * Get aggregated metrics for the current session
   */
  getAggregatedMetrics(): AggregatedMetrics {
    if (this.metrics.length === 0) {
      return {
        totalMessages: 0,
        averageResponseTime: 0,
        errorRate: 0,
        crisisDetectionRate: 0,
        languageDistribution: { en: 0, ar: 0 },
        chatModeUsage: { floating: 0, full: 0 },
        performanceP95: 0,
        qualityScore: 0,
      };
    }

    const totalMessages = this.metrics.length;
    const withErrors = this.metrics.filter(m => m.error).length;
    const withCrisis = this.metrics.filter(m => m.crisisDetected).length;
    
    const responseTimes = this.metrics
      .filter(m => m.totalDuration > 0)
      .map(m => m.totalDuration)
      .sort((a, b) => a - b);

    const p95Index = Math.floor(responseTimes.length * 0.95);
    const performanceP95 = responseTimes[p95Index] || 0;

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    const qualityScores = this.metrics
      .filter(m => m.aiResponseQuality)
      .map(m => m.aiResponseQuality!);
    
    const qualityScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : 0;

    const languageDistribution = this.metrics.reduce(
      (acc, m) => {
        acc[m.language]++;
        return acc;
      },
      { en: 0, ar: 0 }
    );

    const chatModeUsage = this.metrics.reduce(
      (acc, m) => {
        acc[m.chatMode]++;
        return acc;
      },
      { floating: 0, full: 0 }
    );

    return {
      totalMessages,
      averageResponseTime,
      errorRate: withErrors / totalMessages,
      crisisDetectionRate: withCrisis / totalMessages,
      languageDistribution,
      chatModeUsage,
      performanceP95,
      qualityScore,
    };
  }

  /**
   * Get metrics for a specific time range
   */
  getMetricsInRange(startTime: Date, endTime: Date): ChatMetrics[] {
    return this.metrics.filter(m => {
      const metricTime = new Date(m.timestamp);
      return metricTime >= startTime && metricTime <= endTime;
    });
  }

  /**
   * Check for performance issues and log warnings
   */
  private checkPerformanceThresholds(metric: ChatMetrics) {
    // Check for slow response times
    if (metric.totalDuration > 10000) {
      console.warn('Slow chat response detected:', {
        duration: `${metric.totalDuration}ms`,
        messageLength: metric.messageLength,
        contextSize: metric.contextSize,
        chatMode: metric.chatMode,
      });
    }

    // Check for errors
    if (metric.error) {
      console.error('Chat error detected:', {
        error: metric.error,
        errorType: metric.errorType,
        messageLength: metric.messageLength,
        language: metric.language,
      });
    }

    // Check for crisis detection patterns
    if (metric.crisisDetected && metric.crisisSeverity === 'critical') {
      console.warn('Critical crisis detected:', {
        severity: metric.crisisSeverity,
        indicators: metric.crisisIndicators,
        language: metric.language,
      });
    }
  }

  /**
   * Get current platform
   */
  private getPlatform(): 'ios' | 'android' | 'web' {
    if (typeof window !== 'undefined') {
      return 'web';
    }
    
    // In React Native, you'd use Platform.OS
    // For now, defaulting to ios
    return 'ios';
  }

  /**
   * Get app version
   */
  private getAppVersion(): string {
    // In production, you'd get this from app config
    return '1.0.0';
  }

  /**
   * Export metrics for analysis (JSON format)
   */
  exportMetrics(): string {
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      aggregated: this.getAggregatedMetrics(),
      detailed: this.metrics,
    }, null, 2);
  }

  /**
   * Clear all stored metrics
   */
  clearMetrics() {
    this.metrics = [];
  }
}

// Global metrics collector instance
export const metricsCollector = new MetricsCollector();

/**
 * Helper function to record a chat metric
 */
export function recordChatMetric(metric: Omit<ChatMetrics, 'timestamp' | 'platform' | 'version'>) {
  metricsCollector.recordChatMetric(metric as ChatMetrics);
}

/**
 * Helper function to get current metrics summary
 */
export function getMetricsSummary(): AggregatedMetrics {
  return metricsCollector.getAggregatedMetrics();
}

/**
 * Performance monitoring hook for React components
 */
export function usePerformanceMonitor() {
  return {
    recordMetric: recordChatMetric,
    getMetrics: getMetricsSummary,
    exportMetrics: () => metricsCollector.exportMetrics(),
  };
}