/**
 * Preprocesses text by converting to lowercase, removing punctuation, and splitting into tokens.
 * A simple set of common English stop words are removed.
 */
function preprocess(text: string): string[] {
  const stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
  
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // remove punctuation
    .split(/\s+/) // split into words
    .filter(word => word.length > 0 && !stopWords.has(word)); // remove empty strings and stop words
  return tokens;
}

/**
 * Creates a term frequency vector for a set of tokens based on a vocabulary.
 */
function vectorize(tokens: string[], vocabulary: string[]): number[] {
  const vector = new Array(vocabulary.length).fill(0);
  for (const token of tokens) {
    const index = vocabulary.indexOf(token);
    if (index !== -1) {
      vector[index]++;
    }
  }
  return vector;
}

/**
 * Calculates the cosine similarity between two vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the best matching item from a list of items with text fields, based on cosine similarity.
 */
export function findBestMatch<T>(
  query: string,
  items: T[],
  textAccessor: (item: T) => string
): { bestMatch: T | null; bestScore: number } {
  if (!query || items.length === 0) {
    return { bestMatch: null, bestScore: -1 };
  }

  const queryTokens = preprocess(query);
  const itemTokensList = items.map(item => preprocess(textAccessor(item)));

  const vocabulary = Array.from(new Set([...queryTokens, ...itemTokensList.flat()]));

  const queryVector = vectorize(queryTokens, vocabulary);

  let bestScore = -1;
  let bestMatch: T | null = null;

  items.forEach((item, index) => {
    const itemVector = vectorize(itemTokensList[index], vocabulary);
    const score = cosineSimilarity(queryVector, itemVector);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  return { bestMatch, bestScore };
}
