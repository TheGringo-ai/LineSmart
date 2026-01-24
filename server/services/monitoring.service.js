import logger from '../config/logger.js';

/**
 * AI Provider Monitoring Service
 * Tracks response times, error rates, and health metrics
 */
class MonitoringService {
  constructor() {
    this.metrics = {
      providers: new Map(),
      startTime: Date.now(),
      totalRequests: 0,
      totalErrors: 0
    };

    // Initialize known providers
    ['openai', 'gemini', 'grok', 'claude', 'llama'].forEach(provider => {
      this.metrics.providers.set(provider, {
        requests: 0,
        errors: 0,
        totalResponseTime: 0,
        avgResponseTime: 0,
        lastResponseTime: 0,
        lastError: null,
        lastSuccess: null,
        status: 'unknown'
      });
    });
  }

  /**
   * Record the start of an AI request
   */
  startRequest(provider) {
    return {
      provider,
      startTime: Date.now()
    };
  }

  /**
   * Record a successful AI response
   */
  recordSuccess(requestContext) {
    const { provider, startTime } = requestContext;
    const responseTime = Date.now() - startTime;

    const providerMetrics = this.metrics.providers.get(provider);
    if (providerMetrics) {
      providerMetrics.requests++;
      providerMetrics.totalResponseTime += responseTime;
      providerMetrics.avgResponseTime = Math.round(
        providerMetrics.totalResponseTime / providerMetrics.requests
      );
      providerMetrics.lastResponseTime = responseTime;
      providerMetrics.lastSuccess = new Date().toISOString();
      providerMetrics.status = 'healthy';
    }

    this.metrics.totalRequests++;

    logger.info('AI request completed', {
      provider,
      responseTime,
      avgResponseTime: providerMetrics?.avgResponseTime
    });
  }

  /**
   * Record a failed AI request
   */
  recordError(requestContext, error) {
    const { provider, startTime } = requestContext;
    const responseTime = Date.now() - startTime;

    const providerMetrics = this.metrics.providers.get(provider);
    if (providerMetrics) {
      providerMetrics.requests++;
      providerMetrics.errors++;
      providerMetrics.totalResponseTime += responseTime;
      providerMetrics.avgResponseTime = Math.round(
        providerMetrics.totalResponseTime / providerMetrics.requests
      );
      providerMetrics.lastResponseTime = responseTime;
      providerMetrics.lastError = {
        message: error.message,
        timestamp: new Date().toISOString()
      };
      providerMetrics.status = 'degraded';
    }

    this.metrics.totalRequests++;
    this.metrics.totalErrors++;

    logger.error('AI request failed', {
      provider,
      responseTime,
      error: error.message
    });
  }

  /**
   * Update provider health status
   */
  updateProviderStatus(provider, status, details = {}) {
    const providerMetrics = this.metrics.providers.get(provider);
    if (providerMetrics) {
      providerMetrics.status = status;
      if (details.error) {
        providerMetrics.lastError = {
          message: details.error,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  /**
   * Get metrics for a specific provider
   */
  getProviderMetrics(provider) {
    return this.metrics.providers.get(provider) || null;
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const uptime = Math.floor((Date.now() - this.metrics.startTime) / 1000);
    const providers = {};

    this.metrics.providers.forEach((metrics, name) => {
      const errorRate = metrics.requests > 0
        ? ((metrics.errors / metrics.requests) * 100).toFixed(2)
        : 0;

      providers[name] = {
        status: metrics.status,
        requests: metrics.requests,
        errors: metrics.errors,
        errorRate: `${errorRate}%`,
        avgResponseTime: `${metrics.avgResponseTime}ms`,
        lastResponseTime: `${metrics.lastResponseTime}ms`,
        lastSuccess: metrics.lastSuccess,
        lastError: metrics.lastError
      };
    });

    const totalErrorRate = this.metrics.totalRequests > 0
      ? ((this.metrics.totalErrors / this.metrics.totalRequests) * 100).toFixed(2)
      : 0;

    return {
      uptime: `${uptime}s`,
      totalRequests: this.metrics.totalRequests,
      totalErrors: this.metrics.totalErrors,
      overallErrorRate: `${totalErrorRate}%`,
      providers
    };
  }

  /**
   * Get health summary for dashboard
   */
  getHealthSummary() {
    const providers = {};
    let healthyCount = 0;
    let totalCount = 0;

    this.metrics.providers.forEach((metrics, name) => {
      if (metrics.status !== 'unknown') {
        totalCount++;
        if (metrics.status === 'healthy') {
          healthyCount++;
        }
      }
      providers[name] = {
        status: metrics.status,
        errorRate: metrics.requests > 0
          ? `${((metrics.errors / metrics.requests) * 100).toFixed(1)}%`
          : '0%'
      };
    });

    const overallStatus = healthyCount === totalCount ? 'healthy'
      : healthyCount > 0 ? 'degraded'
      : 'unhealthy';

    return {
      status: overallStatus,
      healthy: healthyCount,
      total: totalCount,
      providers
    };
  }

  /**
   * Reset metrics (for testing)
   */
  reset() {
    this.metrics.totalRequests = 0;
    this.metrics.totalErrors = 0;
    this.metrics.providers.forEach(provider => {
      provider.requests = 0;
      provider.errors = 0;
      provider.totalResponseTime = 0;
      provider.avgResponseTime = 0;
      provider.lastResponseTime = 0;
      provider.lastError = null;
      provider.lastSuccess = null;
      provider.status = 'unknown';
    });
  }
}

// Export singleton instance
const monitoringService = new MonitoringService();
export default monitoringService;
