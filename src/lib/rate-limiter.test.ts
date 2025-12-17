import { createRateLimiter, getGlobalRateLimiter, checkRateLimit } from './rate-limiter';

describe('rate-limiter.ts', () => {
  describe('createRateLimiter', () => {
    it('should create rate limiter with default config', () => {
      const limiter = createRateLimiter();
      expect(limiter).toBeDefined();
      expect(limiter.isAllowed()).toBe(true);
    });

    it('should create rate limiter with custom config', () => {
      const limiter = createRateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });
      expect(limiter).toBeDefined();
    });
  });

  describe('isAllowed', () => {
    it('should allow requests within limit', () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 1000 });

      for (let i = 0; i < 5; i++) {
        expect(limiter.isAllowed()).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });

      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(false);
    });

    it('should allow requests after window reset', async () => {
      const limiter = createRateLimiter({ maxRequests: 1, windowMs: 100 });

      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(limiter.isAllowed()).toBe(true);
    });

    it('should track requests per context key', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });

      expect(limiter.isAllowed({ sessionId: 'session-1' })).toBe(true);
      expect(limiter.isAllowed({ sessionId: 'session-1' })).toBe(true);
      expect(limiter.isAllowed({ sessionId: 'session-1' })).toBe(false);

      expect(limiter.isAllowed({ sessionId: 'session-2' })).toBe(true);
      expect(limiter.isAllowed({ sessionId: 'session-2' })).toBe(true);
      expect(limiter.isAllowed({ sessionId: 'session-2' })).toBe(false);
    });
  });

  describe('getRemaining', () => {
    it('should return correct remaining count', () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 1000 });

      expect(limiter.getRemaining()).toBe(5);

      limiter.isAllowed();
      expect(limiter.getRemaining()).toBe(4);

      limiter.isAllowed();
      limiter.isAllowed();
      expect(limiter.getRemaining()).toBe(2);
    });

    it('should return 0 when limit exceeded', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isAllowed();
      limiter.isAllowed();
      limiter.isAllowed();

      expect(limiter.getRemaining()).toBe(0);
    });
  });

  describe('getReset', () => {
    it('should return future reset time', () => {
      const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 });
      const now = Date.now();

      const resetTime = limiter.getReset();
      expect(resetTime).toBeGreaterThan(now);
      expect(resetTime).toBeLessThanOrEqual(now + 1100);
    });
  });

  describe('reset', () => {
    it('should reset limiter for context', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });
      const context = { sessionId: 'session-1' };

      limiter.isAllowed(context);
      limiter.isAllowed(context);
      expect(limiter.isAllowed(context)).toBe(false);

      limiter.reset(context);
      expect(limiter.isAllowed(context)).toBe(true);
    });
  });

  describe('resetAll', () => {
    it('should reset all limiters', () => {
      const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 });

      limiter.isAllowed({ sessionId: 'session-1' });
      limiter.isAllowed({ sessionId: 'session-2' });

      limiter.resetAll();

      expect(limiter.isAllowed({ sessionId: 'session-1' })).toBe(true);
      expect(limiter.isAllowed({ sessionId: 'session-2' })).toBe(true);
    });
  });

  describe('getGlobalRateLimiter', () => {
    it('should return singleton instance', () => {
      const limiter1 = getGlobalRateLimiter();
      const limiter2 = getGlobalRateLimiter();

      expect(limiter1).toBe(limiter2);
    });
  });

  describe('checkRateLimit', () => {
    it('should return rate limit info', () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 1000 });

      const info = checkRateLimit(limiter);

      expect(info).toHaveProperty('isAllowed');
      expect(info).toHaveProperty('remaining');
      expect(info).toHaveProperty('resetTime');
      expect(typeof info.isAllowed).toBe('boolean');
      expect(typeof info.remaining).toBe('number');
      expect(info.resetTime instanceof Date).toBe(true);
    });

    it('should include retryAfter when limit exceeded', () => {
      const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 });

      limiter.isAllowed();
      const info = checkRateLimit(limiter);

      expect(info.isAllowed).toBe(false);
      expect(typeof info.retryAfter).toBe('number');
      expect(info.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('onLimitExceeded callback', () => {
    it('should call callback when limit exceeded', () => {
      let callCount = 0;
      const limiter = createRateLimiter({
        maxRequests: 1,
        windowMs: 1000,
        onLimitExceeded: () => {
          callCount++;
        },
      });

      limiter.isAllowed();
      limiter.isAllowed();

      expect(callCount).toBe(1);
    });
  });
});
