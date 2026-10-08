/**
 * @file telemetryService.ts
 * @description Enterprise Application Telemetry & WebGL Observability Engine for Tangent SF RP.
 * Captures runtime exceptions, WebGL context failures, GPU hardware profiles,
 * and tactical operational breadcrumbs. Integrates with Sentry / APM platforms
 * while maintaining an offline-resilient local diagnostic ring buffer.
 */

export interface GPUHardwareProfile {
  vendor: string;
  renderer: string;
  webglVersion: string;
  maxTextureSize: number;
  maxRenderBufferSize: number;
  devicePixelRatio: number;
  screenResolution: string;
  viewportSize: string;
  userAgent: string;
  jsHeapMemory?: {
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
}

export interface TelemetryBreadcrumb {
  timestamp: string;
  category: 'graphics' | 'tactical' | 'audio' | 'navigation' | 'auth' | 'ai' | 'state';
  message: string;
  level: 'info' | 'warn' | 'error';
  data?: Record<string, unknown>;
}

export interface CrashDiagnosticReport {
  timestamp: string;
  errorName: string;
  errorMessage: string;
  stack?: string;
  componentStack?: string;
  gpuProfile?: GPUHardwareProfile;
  recentBreadcrumbs: TelemetryBreadcrumb[];
  systemMetrics: {
    online: boolean;
    memoryPressure?: string;
    activeMapId?: string;
  };
}

export class TelemetryService {
  private static isInitialized = false;
  private static breadcrumbs: TelemetryBreadcrumb[] = [];
  private static readonly MAX_BREADCRUMBS = 60;
  private static cachedGPUProfile: GPUHardwareProfile | null = null;
  private static crashListeners: Array<(report: CrashDiagnosticReport) => void> = [];

  /**
   * Initializes the application telemetry service.
   */
  public static initialize(): void {
    if (this.isInitialized) return;

    // Listen for global unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.addBreadcrumb('state', `Unhandled script error: ${event.message}`, 'error', {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
        this.addBreadcrumb('state', `Unhandled promise rejection: ${reason}`, 'error');
      });
    }

    this.isInitialized = true;
    this.addBreadcrumb('navigation', 'Tangent SF RP Telemetry Sentinel initialized', 'info');
  }

  /**
   * Records an operational breadcrumb in the ring buffer.
   */
  public static addBreadcrumb(
    category: TelemetryBreadcrumb['category'],
    message: string,
    level: TelemetryBreadcrumb['level'] = 'info',
    data?: Record<string, unknown>
  ): void {
    const entry: TelemetryBreadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      level,
      data
    };

    this.breadcrumbs.push(entry);
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }

    if (level === 'error') {
      console.warn(`[Telemetry:${category.toUpperCase()}] ${message}`, data || '');
    }
  }

  /**
   * Extracts GPU hardware profile and WebGL capabilities from a canvas.
   */
  public static getGPUHardwareProfile(canvas?: HTMLCanvasElement | null): GPUHardwareProfile {
    if (this.cachedGPUProfile && !canvas) {
      return this.cachedGPUProfile;
    }

    const targetCanvas = canvas || (typeof document !== 'undefined' ? document.createElement('canvas') : null);
    let vendor = 'Unknown';
    let renderer = 'Unknown';
    let webglVersion = 'None';
    let maxTextureSize = 0;
    let maxRenderBufferSize = 0;

    if (targetCanvas) {
      const gl2 = targetCanvas.getContext('webgl2') as WebGL2RenderingContext | null;
      const gl = (gl2 || targetCanvas.getContext('webgl')) as (WebGLRenderingContext | WebGL2RenderingContext | null);

      if (gl) {
        webglVersion = gl2 ? 'WebGL 2.0' : 'WebGL 1.0';
        maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0;
        maxRenderBufferSize = Number(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)) || 0;

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          vendor = String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown');
          renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown');
        }
      }
    }

    const perfMem = typeof window !== 'undefined' && (window.performance as any)?.memory;

    const profile: GPUHardwareProfile = {
      vendor,
      renderer,
      webglVersion,
      maxTextureSize,
      maxRenderBufferSize,
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      screenResolution: typeof window !== 'undefined' ? `${window.screen?.width || 0}x${window.screen?.height || 0}` : 'Unknown',
      viewportSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      jsHeapMemory: perfMem ? {
        totalJSHeapSize: perfMem.totalJSHeapSize,
        usedJSHeapSize: perfMem.usedJSHeapSize,
        jsHeapSizeLimit: perfMem.jsHeapSizeLimit
      } : undefined
    };

    this.cachedGPUProfile = profile;
    return profile;
  }

  /**
   * Specifically handles WebGL Context Loss (`webglcontextlost`) and GPU crashes.
   */
  public static reportWebGLCrash(canvas: HTMLCanvasElement, contextSource: string): CrashDiagnosticReport {
    const gpuProfile = this.getGPUHardwareProfile(canvas);
    this.addBreadcrumb('graphics', `FATAL: WebGL context lost in ${contextSource}`, 'error', {
      renderer: gpuProfile.renderer,
      vendor: gpuProfile.vendor
    });

    const report: CrashDiagnosticReport = {
      timestamp: new Date().toISOString(),
      errorName: 'WebGLContextLostException',
      errorMessage: `Graphics context lost in [${contextSource}]. GPU: ${gpuProfile.renderer} (${gpuProfile.vendor})`,
      gpuProfile,
      recentBreadcrumbs: [...this.breadcrumbs],
      systemMetrics: {
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
        memoryPressure: gpuProfile.jsHeapMemory ? `${Math.round((gpuProfile.jsHeapMemory.usedJSHeapSize || 0) / 1048576)} MB used` : undefined
      }
    };

    this.notifyCrashListeners(report);
    return report;
  }

  /**
   * Captures a React ErrorBoundary crash.
   */
  public static reportReactCrash(error: Error, componentStack?: string): CrashDiagnosticReport {
    const gpuProfile = this.getGPUHardwareProfile();
    this.addBreadcrumb('state', `React render crash: ${error.message}`, 'error', {
      stackSnippet: error.stack?.slice(0, 300)
    });

    const report: CrashDiagnosticReport = {
      timestamp: new Date().toISOString(),
      errorName: error.name || 'ReactRenderError',
      errorMessage: error.message || 'Unknown error occurred in component tree',
      stack: error.stack,
      componentStack,
      gpuProfile,
      recentBreadcrumbs: [...this.breadcrumbs],
      systemMetrics: {
        online: typeof navigator !== 'undefined' ? navigator.onLine : true
      }
    };

    this.notifyCrashListeners(report);
    return report;
  }

  /**
   * Subscribe to crash events (for UI modal alerts, recovery toasts, or remote APM dispatch).
   */
  public static onCrash(listener: (report: CrashDiagnosticReport) => void): () => void {
    this.crashListeners.push(listener);
    return () => {
      this.crashListeners = this.crashListeners.filter(l => l !== listener);
    };
  }

  private static notifyCrashListeners(report: CrashDiagnosticReport): void {
    for (const listener of this.crashListeners) {
      try {
        listener(report);
      } catch (err) {
        console.error('[TelemetryService] Error in crash listener:', err);
      }
    }
  }

  /**
   * Formats a diagnostic payload into a clean string suitable for GitHub issue reporting or clipboard export.
   */
  public static exportDiagnosticSummary(report: CrashDiagnosticReport): string {
    return [
      `=== TANGENT SF RP CRASH REPORT ===`,
      `Timestamp: ${report.timestamp}`,
      `Error: ${report.errorName}: ${report.errorMessage}`,
      `Stack: ${report.stack || 'No stack trace'}`,
      `Component: ${report.componentStack || 'None'}`,
      ``,
      `--- GPU & HARDWARE PROFILE ---`,
      `Renderer: ${report.gpuProfile?.renderer || 'Unknown'}`,
      `Vendor: ${report.gpuProfile?.vendor || 'Unknown'}`,
      `WebGL: ${report.gpuProfile?.webglVersion || 'None'} (Max Texture: ${report.gpuProfile?.maxTextureSize}px)`,
      `Viewport: ${report.gpuProfile?.viewportSize} (DPR: ${report.gpuProfile?.devicePixelRatio})`,
      `Heap: ${report.systemMetrics.memoryPressure || 'N/A'}`,
      `User Agent: ${report.gpuProfile?.userAgent || 'Unknown'}`,
      ``,
      `--- RECENT TELEMETRY BREADCRUMBS ---`,
      ...report.recentBreadcrumbs.map(b => `[${b.timestamp.slice(11, 19)}] [${b.category.toUpperCase()}] ${b.message}`)
    ].join('\n');
  }
}
