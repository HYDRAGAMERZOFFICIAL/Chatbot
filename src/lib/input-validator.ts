export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

export interface ValidationConfig {
  maxLength?: number;
  minLength?: number;
  allowedCharacters?: RegExp;
  maxLines?: number;
  maxConsecutiveChars?: number;
}

const DEFAULT_CONFIG: ValidationConfig = {
  maxLength: 10000,
  minLength: 1,
  maxLines: 100,
  maxConsecutiveChars: 500,
};

export function validateInput(
  input: string,
  config: ValidationConfig = {}
): ValidationResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (input === null || input === undefined) {
    return { isValid: false, error: 'Input is null or undefined' };
  }

  if (typeof input !== 'string') {
    return { isValid: false, error: 'Input must be a string' };
  }

  const trimmed = input.trim();

  if (finalConfig.minLength && trimmed.length < finalConfig.minLength) {
    return {
      isValid: false,
      error: `Input must be at least ${finalConfig.minLength} characters`,
    };
  }

  if (finalConfig.maxLength && input.length > finalConfig.maxLength) {
    return {
      isValid: false,
      error: `Input exceeds maximum length of ${finalConfig.maxLength} characters`,
    };
  }

  if (finalConfig.maxLines) {
    const lines = input.split('\n').length;
    if (lines > finalConfig.maxLines) {
      return {
        isValid: false,
        error: `Input exceeds maximum of ${finalConfig.maxLines} lines`,
      };
    }
  }

  if (finalConfig.maxConsecutiveChars) {
    const match = input.match(/(.)\1{499,}/);
    if (match) {
      return {
        isValid: false,
        error: `Input contains too many consecutive identical characters`,
      };
    }
  }

  if (finalConfig.allowedCharacters && !finalConfig.allowedCharacters.test(input)) {
    return {
      isValid: false,
      error: 'Input contains disallowed characters',
    };
  }

  return { isValid: true, sanitized: trimmed };
}

export function validateQueryInput(query: string): ValidationResult {
  return validateInput(query, {
    maxLength: 10000,
    minLength: 0,
    maxLines: 50,
  });
}

export function validateHistoryMessage(message: string): ValidationResult {
  return validateInput(message, {
    maxLength: 50000,
    minLength: 0,
    maxLines: 500,
  });
}

export function validateSessionId(sessionId: string): ValidationResult {
  const sessionIdPattern = /^session-\d+$/;
  if (!sessionIdPattern.test(sessionId)) {
    return { isValid: false, error: 'Invalid session ID format' };
  }
  return { isValid: true };
}

export function truncateInput(input: string, maxLength: number = 10000): string {
  if (input.length > maxLength) {
    return input.substring(0, maxLength);
  }
  return input;
}

export function validateFeedbackHistory(
  history: Array<{ role: string; text: string }>
): ValidationResult {
  if (!Array.isArray(history)) {
    return { isValid: false, error: 'History must be an array' };
  }

  if (history.length > 1000) {
    return { isValid: false, error: 'History exceeds maximum size' };
  }

  for (const item of history) {
    if (typeof item.role !== 'string' || typeof item.text !== 'string') {
      return { isValid: false, error: 'Invalid history format' };
    }

    if (!['user', 'bot'].includes(item.role)) {
      return { isValid: false, error: 'Invalid role in history' };
    }

    const textValidation = validateHistoryMessage(item.text);
    if (!textValidation.isValid) {
      return textValidation;
    }
  }

  return { isValid: true };
}
