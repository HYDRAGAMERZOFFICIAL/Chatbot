export function sanitizeForLog(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }

  return input
    .substring(0, 1000)
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r')
    .replace(/[^\x20-\x7E]/g, '?');
}

export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'\/]/g, (char) => map[char]);
}

export function stripDangerousTags(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<embed[^>]*>/gi, '');
  sanitized = sanitized.replace(/<object[^>]*(?:(?!<\/object>)<[^>]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<style[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  return sanitized;
}

export function stripEventHandlers(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  const eventHandlerPattern = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
  sanitized = sanitized.replace(eventHandlerPattern, '');

  sanitized = sanitized.replace(/\s+on\w+\s*=\s*{[^}]*}/gi, '');

  return sanitized;
}

export function stripJavaScriptProtocol(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input.replace(/javascript:/gi, '');
}

export function detectXSSPatterns(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

export function detectSQLInjectionPatterns(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /('|(\")|(--)|(;)|(\/\*))/,
    /(\b(UNION|SELECT|DROP|INSERT|UPDATE|DELETE|EXEC|EXECUTE)\b)/i,
    /(OR|AND)\s+\d+\s*=\s*\d+/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

export function detectCommandInjectionPatterns(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const cmdPatterns = [/[;&|`$()]/];

  return cmdPatterns.some((pattern) => pattern.test(input));
}

export function detectPromptInjectionPatterns(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const injectionPatterns = [
    /ignore.*instruction/i,
    /forget.*previous/i,
    /act\s+as/i,
    /role.*play/i,
    /jailbreak/i,
    /from\s+now\s+on/i,
    /you\s+are\s+a/i,
    /imagine\s+you/i,
    /disregard/i,
  ];

  return injectionPatterns.some((pattern) => pattern.test(input));
}

export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = stripDangerousTags(input);
  sanitized = stripEventHandlers(sanitized);
  sanitized = stripJavaScriptProtocol(sanitized);

  return sanitized.trim();
}

export function validateAndSanitize(
  input: string
): { isValid: boolean; sanitized: string; warnings: string[] } {
  const warnings: string[] = [];

  if (detectXSSPatterns(input)) {
    warnings.push('Potential XSS pattern detected');
  }

  if (detectSQLInjectionPatterns(input)) {
    warnings.push('Potential SQL injection pattern detected');
  }

  if (detectCommandInjectionPatterns(input)) {
    warnings.push('Potential command injection pattern detected');
  }

  if (detectPromptInjectionPatterns(input)) {
    warnings.push('Potential prompt injection pattern detected');
  }

  const sanitized = sanitizeUserInput(input);

  return {
    isValid: warnings.length === 0,
    sanitized,
    warnings,
  };
}

export function encodeForURL(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return encodeURIComponent(input);
}

export function decodeFromURL(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  try {
    return decodeURIComponent(input);
  } catch (error) {
    return '';
  }
}

export function stripNullBytes(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input.replace(/\x00/g, '');
}

export function stripControlCharacters(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input.replace(/[\x00-\x1f\x7f]/g, '');
}
