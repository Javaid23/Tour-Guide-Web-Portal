/**
 * Performance Monitoring Utilities
 * Provides tools for monitoring and optimizing frontend performance
 */

// Performance metrics collector
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = []
    this.isSupported = typeof performance !== 'undefined'
  }

  // Start timing an operation
  startTimer(name) {
    if (!this.isSupported) return

    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    })
  }

  // End timing an operation
  endTimer(name) {
    if (!this.isSupported || !this.metrics.has(name)) return

    const metric = this.metrics.get(name)
    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    return metric.duration
  }

  // Get metric duration
  getMetric(name) {
    return this.metrics.get(name)
  }

  // Get all metrics
  getAllMetrics() {
    return Object.fromEntries(this.metrics)
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear()
  }

  // Monitor core web vitals
  observeCoreWebVitals() {
    if (!this.isSupported) return

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('LCP:', lastEntry.startTime)
      })
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime)
        })
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value)
          }
        })
      })

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        console.warn('CLS observer not supported')
      }
    }
  }

  // Disconnect all observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Memory usage monitoring
export const memoryMonitor = {
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      }
    }
    return null
  },

  checkMemoryPressure() {
    const memory = this.getMemoryUsage()
    if (memory && memory.used / memory.limit > 0.8) {
      console.warn('High memory usage detected:', memory)
      return true
    }
    return false
  }
}

// Bundle size analyzer
export const bundleAnalyzer = {
  logBundleInfo() {
    if (typeof __webpack_require__ !== 'undefined') {
      console.log('Webpack chunks loaded:', Object.keys(__webpack_require__.cache || {}).length)
    }
  },

  // Estimate component size
  estimateComponentSize(component) {
    if (typeof component === 'function') {
      return component.toString().length
    }
    return 0
  }
}

// API performance tracking
export const apiPerformance = {
  trackRequest(url, method = 'GET') {
    const startTime = performance.now()
    
    return {
      end: () => {
        const duration = performance.now() - startTime
        console.log(`API ${method} ${url}: ${duration.toFixed(2)}ms`)
        
        // Track slow API calls
        if (duration > 2000) {
          console.warn(`Slow API call: ${method} ${url} took ${duration.toFixed(2)}ms`)
        }
        
        return duration
      }
    }
  }
}

// Image optimization utilities
export const imageOptimizer = {
  // Check if image should be lazy loaded
  shouldLazyLoad(element) {
    if (!element || typeof IntersectionObserver === 'undefined') return false
    
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    
    // Load if within viewport + 200px buffer
    return rect.top > viewportHeight + 200
  },

  // Create optimized image URL
  getOptimizedImageUrl(originalUrl, width, quality = 80) {
    if (!originalUrl) return originalUrl
    
    // Add optimization parameters if supported
    if (originalUrl.includes('cloudinary') || originalUrl.includes('imagekit')) {
      return `${originalUrl}?w=${width}&q=${quality}&f=auto`
    }
    
    return originalUrl
  },

  // Preload critical images
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = src
    })
  }
}

// Component render optimization
export const renderOptimizer = {
  // Debounce function for search inputs
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // Check if element is in viewport
  isInViewport(element, threshold = 0) {
    if (!element) return false
    
    const rect = element.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth
    
    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= windowHeight + threshold &&
      rect.right <= windowWidth + threshold
    )
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.observeCoreWebVitals()
}

// Export all utilities
export default {
  performanceMonitor,
  memoryMonitor,
  bundleAnalyzer,
  apiPerformance,
  imageOptimizer,
  renderOptimizer
}
