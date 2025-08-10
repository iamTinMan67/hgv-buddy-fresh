// Performance monitoring utility for code splitting
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private startTime: number = performance.now();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track component load time
  trackComponentLoad(componentName: string, loadTime: number) {
    this.metrics.set(`component_${componentName}_load`, loadTime);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }
  }

  // Track chunk load time
  trackChunkLoad(chunkName: string, loadTime: number) {
    this.metrics.set(`chunk_${chunkName}_load`, loadTime);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Chunk ${chunkName} loaded in ${loadTime.toFixed(2)}ms`);
    }
  }

  // Track initial bundle size
  trackBundleSize(bundleSize: number) {
    this.metrics.set('initial_bundle_size', bundleSize);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Initial bundle size: ${(bundleSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  // Get performance summary
  getPerformanceSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      summary[key] = value;
    });
    return summary;
  }

  // Export metrics for analytics
  exportMetrics(): string {
    return JSON.stringify(this.getPerformanceSummary(), null, 2);
  }

  // Reset metrics
  reset() {
    this.metrics.clear();
    this.startTime = performance.now();
  }
}

// Hook for tracking component performance
export const usePerformanceTracking = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    trackLoad: () => {
      const loadTime = performance.now() - startTime;
      PerformanceMonitor.getInstance().trackComponentLoad(componentName, loadTime);
    }
  };
};

// Utility to measure chunk loading performance
export const measureChunkPerformance = async <T>(
  chunkLoader: () => Promise<T>,
  chunkName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await chunkLoader();
    const loadTime = performance.now() - startTime;
    PerformanceMonitor.getInstance().trackChunkLoad(chunkName, loadTime);
    return result;
  } catch (error) {
    const loadTime = performance.now() - startTime;
    PerformanceMonitor.getInstance().trackChunkLoad(`error_${chunkName}`, loadTime);
    throw error;
  }
};

// Initialize performance tracking for code splitting only
export const initializePerformanceTracking = () => {
  // Track initial bundle size if available
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const bundleSize = navigation.transferSize || 0;
      PerformanceMonitor.getInstance().trackBundleSize(bundleSize);
    }
  }
};
