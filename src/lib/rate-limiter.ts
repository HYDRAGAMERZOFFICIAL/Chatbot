export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (context: unknown) => string;
  onLimitExceeded?: (key: string) => void;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private keyGenerator: (context: unknown) => string;
  private onLimitExceeded?: (key: string) => void;

  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests || 30;
    this.windowMs = config.windowMs || 60000;
    this.keyGenerator = config.keyGenerator || this.defaultKeyGenerator.bind(this);
    this.onLimitExceeded = config.onLimitExceeded;

    this.startCleanupInterval();
  }

  private defaultKeyGenerator(context: unknown): string {
    if (typeof window === 'undefined') {
      return 'server';
    }

    if (context && typeof context === 'object' && typeof (context as Record<string, unknown>).sessionId === 'string') {
      return (context as Record<string, unknown>).sessionId as string;
    }

    return 'client-default';
  }

  isAllowed(context?: unknown): boolean {
    const key = this.keyGenerator(context);
    const now = Date.now();

    const requests = this.requests.get(key) || [];

    const recentRequests = requests.filter((timestamp) => now - timestamp < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      if (this.onLimitExceeded) {
        this.onLimitExceeded(key);
      }
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  getRemaining(context?: unknown): number {
    const key = this.keyGenerator(context);
    const now = Date.now();

    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter((timestamp) => now - timestamp < this.windowMs);

    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  getReset(context?: unknown): number {
    const key = this.keyGenerator(context);
    const now = Date.now();

    const requests = this.requests.get(key) || [];

    if (requests.length === 0) {
      return now + this.windowMs;
    }

    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.windowMs;
  }

  reset(context?: unknown): void {
    const key = this.keyGenerator(context);
    this.requests.delete(key);
  }

  resetAll(): void {
    this.requests.clear();
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();

      for (const [key, timestamps] of this.requests.entries()) {
        const validTimestamps = timestamps.filter((ts) => now - ts < this.windowMs);

        if (validTimestamps.length === 0) {
          this.requests.delete(key);
        } else if (validTimestamps.length < timestamps.length) {
          this.requests.set(key, validTimestamps);
        }
      }
    }, this.windowMs);
  }
}

let globalLimiter: RateLimiter | null = null;

export function createRateLimiter(config?: Partial<RateLimiterConfig>): RateLimiter {
  return new RateLimiter({
    maxRequests: config?.maxRequests || 30,
    windowMs: config?.windowMs || 60000,
    keyGenerator: config?.keyGenerator,
    onLimitExceeded: config?.onLimitExceeded,
  });
}

export function getGlobalRateLimiter(): RateLimiter {
  if (!globalLimiter) {
    globalLimiter = createRateLimiter({
      maxRequests: 50,
      windowMs: 60000,
      onLimitExceeded: (key) => {
        console.warn(`Rate limit exceeded for key: ${key}`);
      },
    });
  }
  return globalLimiter;
}

export function createQueryRateLimiter(): RateLimiter {
  return createRateLimiter({
    maxRequests: 20,
    windowMs: 60000,
    keyGenerator: (context) => {
      if (typeof window === 'undefined') {
        return 'server-queries';
      }
      const sessionId = context && typeof context === 'object' ? (context as Record<string, unknown>).sessionId : undefined;
      return typeof sessionId === 'string' ? sessionId : 'client-queries';
    },
  });
}

export interface RateLimitInfo {
  isAllowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export function checkRateLimit(limiter: RateLimiter, context?: unknown): RateLimitInfo {
  const isAllowed = limiter.isAllowed(context);
  const remaining = limiter.getRemaining(context);
  const resetTime = new Date(limiter.getReset(context));

  return {
    isAllowed,
    remaining,
    resetTime,
    retryAfter: isAllowed ? undefined : Math.ceil((resetTime.getTime() - Date.now()) / 1000),
  };
}
