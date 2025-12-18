const fs = require('fs');
const path = require('path');

const FEEDBACK_PATH = path.join(process.cwd(), 'src/data/json/feedback.json');
const EXT_PATH = path.join(process.cwd(), 'src/data/json/ext.json');
const FAILED_QUERIES_PATH = path.join(process.cwd(), 'src/data/json/failed_queries_training.json');

const FAILED_RESPONSE_PATTERNS = [
  "I'm sorry, I couldn't find an answer to your question",
  "couldn't find specific information",
  "I don't have specific information",
  "I don't have information about",
  "not available in provided context"
];

function preprocess(text) {
  const stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
  
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(word => word.length > 0 && !stopWords.has(word));
  return tokens;
}

function vectorize(tokens, vocabulary) {
  const vector = new Array(vocabulary.length).fill(0);
  for (const token of tokens) {
    const index = vocabulary.indexOf(token);
    if (index !== -1) {
      vector[index]++;
    }
  }
  return vector;
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

function findBestMatch(query, corpus) {
  const queryTokens = preprocess(query);
  
  let bestScore = -1;
  let bestMatch = null;

  for (const item of corpus) {
    const itemTokens = preprocess(item.text);
    const vocabulary = Array.from(new Set([...queryTokens, ...itemTokens]));
    
    const queryVector = vectorize(queryTokens, vocabulary);
    const itemVector = vectorize(itemTokens, vocabulary);
    const score = cosineSimilarity(queryVector, itemVector);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return { match: bestMatch, score: bestScore };
}

function isFailedResponse(botText) {
  return FAILED_RESPONSE_PATTERNS.some(pattern => 
    botText.toLowerCase().includes(pattern.toLowerCase())
  );
}

function extractFailedQueries() {
  const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_PATH, 'utf-8'));
  const failedQueries = new Map();

  for (const record of feedbackData) {
    if (!record.history || record.history.length === 0) continue;

    for (let i = 0; i < record.history.length; i++) {
      const msg = record.history[i];
      
      if (msg.role === 'bot' && isFailedResponse(msg.text)) {
        let userQuestion = '';
        for (let j = i - 1; j >= 0; j--) {
          if (record.history[j].role === 'user') {
            userQuestion = record.history[j].text;
            break;
          }
        }
        
        if (userQuestion) {
          const normalized = userQuestion.toLowerCase().trim();
          failedQueries.set(normalized, (failedQueries.get(normalized) || 0) + 1);
        }
      }
    }
  }

  return Array.from(failedQueries.keys()).sort((a, b) => 
    (failedQueries.get(b) || 0) - (failedQueries.get(a) || 0)
  );
}

function buildCorpus() {
  const extData = JSON.parse(fs.readFileSync(EXT_PATH, 'utf-8'));
  const corpus = [];

  for (const [question, details] of Object.entries(extData)) {
    corpus.push({
      text: `${question} ${details.tags?.join(' ') || ''}`,
      answer: details.answer,
      category: details.category,
      tags: details.tags || []
    });
  }

  return corpus;
}

function generateTags(question) {
  const tokens = preprocess(question);
  const tags = new Set();

  tokens.slice(0, 3).forEach(token => tags.add(token));
  
  const words = question.toLowerCase().split(/\s+/);
  if (words.includes('what') || words.includes('tell')) tags.add('information');
  if (words.includes('how')) tags.add('process');
  if (words.includes('where')) tags.add('location');
  if (words.includes('how') && words.includes('many')) tags.add('quantity');

  return Array.from(tags).slice(0, 8);
}

function updateFailedQueriesTraining() {
  console.log('🔍 Processing feedback.json...');
  const failedQueries = extractFailedQueries();
  console.log(`Found ${failedQueries.length} unique failed queries\n`);

  const corpus = buildCorpus();
  console.log(`Built corpus with ${corpus.length} entries\n`);

  const existingData = JSON.parse(fs.readFileSync(FAILED_QUERIES_PATH, 'utf-8'));
  const existingKeys = new Set(Object.keys(existingData).map(q => q.toLowerCase().trim()));
  
  let addedCount = 0;
  const newEntries = [];

  for (const query of failedQueries.slice(0, 30)) {
    if (existingKeys.has(query)) {
      continue;
    }

    const { match, score } = findBestMatch(query, corpus);
    
    if (match && score > 0.2) {
      const tags = generateTags(query);
      newEntries.push({
        question: query,
        answer: match.answer,
        category: match.category,
        tags
      });

      console.log(`✅ Query: "${query}"`);
      console.log(`   Category: ${match.category}, Score: ${(score * 100).toFixed(1)}%\n`);
      addedCount++;
    } else {
      console.log(`⚠️  Query: "${query}" - No good match found (score: ${(score * 100).toFixed(1)}%)\n`);
    }
  }

  for (const entry of newEntries) {
    existingData[entry.question] = {
      answer: entry.answer,
      category: entry.category,
      tags: entry.tags
    };
  }

  fs.writeFileSync(FAILED_QUERIES_PATH, JSON.stringify(existingData, null, 2));
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total failed queries analyzed: ${failedQueries.length}`);
  console.log(`   New entries added: ${addedCount}`);
  console.log(`   Total entries in failed_queries_training.json: ${Object.keys(existingData).length}`);
}

updateFailedQueriesTraining();
