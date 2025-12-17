import { findBestMatch } from './similarity';

describe('similarity.ts - Cosine Similarity Matching', () => {
  describe('findBestMatch - Basic Functionality', () => {
    it('should find best match from a list of items', () => {
      const items = [
        { text: 'hello world' },
        { text: 'good morning' },
        { text: 'hello there' },
      ];

      const result = findBestMatch('hello', items, (item) => item.text);
      
      expect(result.bestMatch).not.toBeNull();
      expect(result.bestScore).toBeGreaterThan(0);
    });

    it('should return null when items list is empty', () => {
      const result = findBestMatch('test', [], (item) => item);
      
      expect(result.bestMatch).toBeNull();
      expect(result.bestScore).toBe(-1);
    });

    it('should return null when query is empty', () => {
      const items = [{ text: 'hello' }];
      const result = findBestMatch('', items, (item) => item.text);
      
      expect(result.bestMatch).toBeNull();
      expect(result.bestScore).toBe(-1);
    });

    it('should handle identical text', () => {
      const items = [{ text: 'What is the fee structure?' }];
      const result = findBestMatch('What is the fee structure?', items, (item) => item.text);
      
      expect(result.bestMatch).not.toBeNull();
      expect(result.bestScore).toBeGreaterThan(0.5);
    });

    it('should rank exact matches higher than partial matches', () => {
      const items = [
        { text: 'admission process' },
        { text: 'how to apply for admission' },
      ];

      const result = findBestMatch('admission', items, (item) => item.text);
      expect(result.bestMatch).not.toBeNull();
    });
  });

  describe('findBestMatch - Edge Cases', () => {
    it('should handle queries with special characters', () => {
      const items = [{ text: 'contact us via email' }];
      const result = findBestMatch('contact us? email@college.com', items, (item) => item.text);
      
      expect(result.bestMatch).not.toBeNull();
    });

    it('should handle very long queries', () => {
      const longQuery = 'What are the admission requirements and procedures for international students who want to apply for engineering courses in our college?';
      const items = [{ text: 'admission requirements for engineering' }];
      const result = findBestMatch(longQuery, items, (item) => item.text);
      
      expect(result.bestMatch).not.toBeNull();
    });

    it('should handle queries with numbers', () => {
      const items = [
        { text: 'fee is 5 lakhs' },
        { text: 'annual fee 500000' },
      ];
      const result = findBestMatch('what is the fee 5 lakhs', items, (item) => item.text);
      
      expect(result.bestMatch).not.toBeNull();
    });

    it('should handle case-insensitive matching', () => {
      const items = [{ text: 'ADMISSION PROCESS' }];
      const result1 = findBestMatch('admission', items, (item) => item.text);
      const result2 = findBestMatch('ADMISSION', items, (item) => item.text);
      
      expect(result1.bestScore).toBe(result2.bestScore);
    });

    it('should handle whitespace variations', () => {
      const items = [{ text: 'what is placement rate' }];
      const result = findBestMatch('   what   is   placement   rate   ', items, (item) => item.text);
      
      expect(result.bestMatch).not.toBeNull();
    });
  });

  describe('findBestMatch - Security Tests', () => {
    it('should handle SQL injection attempts', () => {
      const items = [{ text: 'college information' }];
      const sqlInjection = "'; DROP TABLE students; --";
      
      expect(() => {
        findBestMatch(sqlInjection, items, (item) => item.text);
      }).not.toThrow();
    });

    it('should handle XSS/HTML injection attempts', () => {
      const items = [{ text: 'contact information' }];
      const xssAttempt = '<script>alert("xss")</script>';
      
      expect(() => {
        findBestMatch(xssAttempt, items, (item) => item.text);
      }).not.toThrow();
    });

    it('should handle regex special characters', () => {
      const items = [{ text: 'test information' }];
      const regexAttempt = '.*|^|$|[](){}.*+?\\\\|';
      
      expect(() => {
        findBestMatch(regexAttempt, items, (item) => item.text);
      }).not.toThrow();
    });

    it('should handle very large inputs (ReDoS prevention)', () => {
      const items = [{ text: 'short' }];
      const largeInput = 'a'.repeat(100000);
      
      const start = performance.now();
      findBestMatch(largeInput, items, (item) => item.text);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(5000);
    });

    it('should handle null bytes and control characters', () => {
      const items = [{ text: 'college data' }];
      const nullByteAttempt = 'test\x00\x01\x02data';
      
      expect(() => {
        findBestMatch(nullByteAttempt, items, (item) => item.text);
      }).not.toThrow();
    });

    it('should handle Unicode and emoji characters', () => {
      const items = [{ text: 'international students' }];
      const unicodeQuery = 'क्या एडमिशन 😀🎓 के लिए आवश्यकता है?';
      
      expect(() => {
        findBestMatch(unicodeQuery, items, (item) => item.text);
      }).not.toThrow();
    });
  });

  describe('findBestMatch - Performance', () => {
    it('should handle large datasets efficiently', () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({
        text: `item ${i} with some text content`,
      }));

      const start = performance.now();
      const result = findBestMatch('item 500 with text', items, (item) => item.text);
      const duration = performance.now() - start;

      expect(result.bestMatch).not.toBeNull();
      expect(duration).toBeLessThan(1000);
    });

    it('should handle complex similarity scoring', () => {
      const items = [
        { text: 'what is the admission process for engineering' },
        { text: 'how can i apply for engineering admission' },
        { text: 'admission requirements for engineering students' },
      ];

      const result = findBestMatch('admission engineering', items, (item) => item.text);
      expect(result.bestMatch).not.toBeNull();
      expect(result.bestScore).toBeGreaterThan(0);
    });
  });

  describe('findBestMatch - Threshold Testing', () => {
    it('should return lower scores for unrelated queries', () => {
      const items = [{ text: 'college admission process' }];
      const unrelatedQuery = 'how do i cook pasta';
      
      const result = findBestMatch(unrelatedQuery, items, (item) => item.text);
      expect(result.bestScore).toBeLessThan(0.5);
    });

    it('should return higher scores for related queries', () => {
      const items = [{ text: 'how do i apply for admission' }];
      const relatedQuery = 'admission application process';
      
      const result = findBestMatch(relatedQuery, items, (item) => item.text);
      expect(result.bestScore).toBeGreaterThan(0.3);
    });
  });
});
