import {
  validateInput,
  validateQueryInput,
  validateSessionId,
  truncateInput,
  validateFeedbackHistory,
} from './input-validator';

describe('input-validator.ts', () => {
  describe('validateInput', () => {
    it('should reject null input', () => {
      const result = validateInput(null as unknown as string);
      expect(result.isValid).toBe(false);
    });

    it('should reject non-string input', () => {
      const result = validateInput(123 as unknown as string);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid string', () => {
      const result = validateInput('Hello world');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('Hello world');
    });

    it('should trim whitespace', () => {
      const result = validateInput('  hello  ');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('hello');
    });

    it('should reject strings exceeding maxLength', () => {
      const result = validateInput('a'.repeat(10001), { maxLength: 10000 });
      expect(result.isValid).toBe(false);
    });

    it('should reject strings below minLength', () => {
      const result = validateInput('', { minLength: 1 });
      expect(result.isValid).toBe(false);
    });

    it('should reject excessive line count', () => {
      const manyLines = 'line\n'.repeat(101);
      const result = validateInput(manyLines, { maxLines: 100 });
      expect(result.isValid).toBe(false);
    });

    it('should detect excessive consecutive characters', () => {
      const tooMany = 'a'.repeat(500);
      const result = validateInput(tooMany, { maxConsecutiveChars: 499 });
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateQueryInput', () => {
    it('should accept normal query', () => {
      const result = validateQueryInput('What are the courses?');
      expect(result.isValid).toBe(true);
    });

    it('should reject very long query', () => {
      const longQuery = 'a'.repeat(10001);
      const result = validateQueryInput(longQuery);
      expect(result.isValid).toBe(false);
    });

    it('should allow empty query', () => {
      const result = validateQueryInput('');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateSessionId', () => {
    it('should accept valid session ID', () => {
      const result = validateSessionId('session-1234567890');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid session ID format', () => {
      const result = validateSessionId('invalid-session');
      expect(result.isValid).toBe(false);
    });

    it('should reject malformed IDs', () => {
      expect(validateSessionId('session-abc').isValid).toBe(false);
      expect(validateSessionId('123').isValid).toBe(false);
      expect(validateSessionId('').isValid).toBe(false);
    });
  });

  describe('truncateInput', () => {
    it('should not truncate short input', () => {
      const input = 'short';
      expect(truncateInput(input)).toBe('short');
    });

    it('should truncate long input', () => {
      const longInput = 'a'.repeat(10001);
      const result = truncateInput(longInput, 10000);
      expect(result.length).toBe(10000);
    });

    it('should use default limit of 10000', () => {
      const longInput = 'b'.repeat(10001);
      const result = truncateInput(longInput);
      expect(result.length).toBe(10000);
    });
  });

  describe('validateFeedbackHistory', () => {
    it('should accept valid history', () => {
      const history = [
        { role: 'user', text: 'Test question' },
        { role: 'bot', text: 'Test answer' },
      ];
      const result = validateFeedbackHistory(history);
      expect(result.isValid).toBe(true);
    });

    it('should reject non-array input', () => {
      const result = validateFeedbackHistory('not array' as unknown);
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid role', () => {
      const history = [{ role: 'invalid', text: 'text' }] as unknown;
      const result = validateFeedbackHistory(history);
      expect(result.isValid).toBe(false);
    });

    it('should reject oversized history', () => {
      const history = Array(1001).fill({ role: 'user', text: 'test' });
      const result = validateFeedbackHistory(history);
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid text in history', () => {
      const history = [
        { role: 'user', text: 'a'.repeat(50001) },
      ];
      const result = validateFeedbackHistory(history);
      expect(result.isValid).toBe(false);
    });
  });
});
