// Monitoring and error tracking utilities

export class Monitoring {
  static logError(error, context = {}) {
    console.error("[Monitoring Error]", {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });

    // In production, send to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD && window.Sentry) {
      window.Sentry.captureException(error, { extra: context });
    }
  }

  static logWarning(message, context = {}) {
    console.warn("[Monitoring Warning]", {
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  static logInfo(message, context = {}) {
    console.log("[Monitoring Info]", {
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  static trackEvent(eventName, properties = {}) {
    console.log("[Event Tracked]", {
      eventName,
      properties,
      timestamp: new Date().toISOString(),
    });

    // In production, send to analytics service (e.g., Google Analytics)
    if (import.meta.env.PROD && window.gtag) {
      window.gtag("event", eventName, properties);
    }
  }

  static trackPageView(pageName) {
    console.log("[Page View]", {
      pageName,
      timestamp: new Date().toISOString(),
    });

    // In production, send to analytics service
    if (import.meta.env.PROD && window.gtag) {
      window.gtag("event", "page_view", {
        page_title: pageName,
        page_location: window.location.href,
      });
    }
  }

  static trackPerformance(metricName, value, unit = "ms") {
    console.log("[Performance Metric]", {
      metricName,
      value,
      unit,
      timestamp: new Date().toISOString(),
    });

    // In production, send to performance monitoring service
    if (import.meta.env.PROD && window.performance) {
      window.performance.mark(metricName);
    }
  }

  static trackAPICall(endpoint, duration, success = true) {
    console.log("[API Call]", {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString(),
    });

    // Track API performance metrics
    this.trackPerformance(`api_${endpoint}`, duration);
  }
}

// Performance monitoring utility
export function measurePerformance(fn, metricName) {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      Monitoring.trackPerformance(metricName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      Monitoring.trackPerformance(`${metricName}_error`, duration);
      Monitoring.logError(error, { metricName, duration });
      throw error;
    }
  };
}

export default Monitoring;
