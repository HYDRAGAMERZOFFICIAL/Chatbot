# Keyword-Based Response System

## Overview
The chatbot now uses an intelligent keyword-response mapping system that automatically extracts and indexes keywords from all JSON data sources to provide precise, context-aware responses.

## System Architecture

### 1. **Keyword Index Builder** (`src/lib/keyword-response-map.ts`)

#### Data Sources Indexed:
- **Intents** (28 intents with keywords)
- **FAQ Database** (40+ FAQs with tags)
- **Academic Programs** (8 programs with subjects and specializations)
- **Internship Programs** (6 internships with domains)

#### Keywords Extracted:
```
From Intents:
- admission, documents, certificate, marksheet, apply, hostel, fees, etc.

From FAQ Tags:
- courses, programs, engineering, admission, facilities, scholarship, etc.

From Programs:
- B.Tech CSE, Data Structures, Algorithms, Machine Learning, etc.

From Internships:
- Summer Internship, Research, AI/ML, Data Science, etc.
```

### 2. **Response Matching Pipeline** (`src/lib/keyword-response-map.ts`)

```typescript
findByKeyword(query) → KeywordMatch
├─ Direct keyword match (highest priority)
├─ Partial keyword match
├─ Substring matching
└─ Returns best scored result with confidence
```

**Matching Algorithm:**
1. Split query into words
2. Search for exact keyword matches
3. Search for partial/substring matches
4. Score by: confidence × keyword relevance × match type
5. Return highest scoring match

### 3. **Fallback Hierarchy** (`src/app/actions.ts`)

```
Priority 1: Keyword Match (findByKeyword)
    ↓
Priority 2: Training Corpus Match (findBestTrainingMatches)
    ↓
Priority 3: AI-Powered Self-Healing
    ↓
Priority 4: Unanswered Question Logging
```

## Example Keyword Maps

### Intent Keywords
```json
{
  "intent": "admission_process",
  "keywords": ["apply", "admission", "application", "how to apply", "registration"],
  "answer": "Applying to Collegewala is simple..."
}
```

### Program Keywords
```json
{
  "name": "B.Tech Computer Science and Engineering",
  "keywords": ["cse", "computer science", "data structures", "algorithms", "ai/ml", ...],
  "answer": "Comprehensive 4-year program covering..."
}
```

### Internship Keywords
```json
{
  "name": "Summer Internship",
  "keywords": ["summer", "internship", "8-10 weeks", "may-july", ...],
  "answer": "Ideal for gaining industry experience..."
}
```

### FAQ Keywords
```json
{
  "tags": ["courses", "programs", "engineering", "degrees", "bachelor"],
  "answer": "Collegewala offers multiple programs..."
}
```

## Response Flow Example

### Query: "Tell me about CSE"
1. **Keyword Matching Phase**
   - Query words: ["tell", "me", "about", "cse"]
   - Index lookup: "cse" → Found in program keywords
   - Returns: B.Tech CSE program details
   - Confidence: 0.92

2. **Response Generation**
   - Uses keyword match as context
   - Enhances with AI (Gemini/GPT)
   - Generates natural language response
   - Suggests follow-up questions

### Query: "What scholarships do you offer?"
1. **Keyword Matching Phase**
   - Query words: ["scholarships", "offer"]
   - Index lookup: "scholarship" → Found in FAQ tags
   - Returns: Scholarship information
   - Confidence: 0.90

2. **Response Generation**
   - Enhances FAQ answer with AI
   - Provides all scholarship types
   - Suggests application details

## Keyword Index Statistics

Total Keywords Indexed: **200+**
- From Intents: 80+ keywords
- From FAQs: 40+ tags
- From Programs: 60+ keywords
- From Internships: 20+ keywords

## Adding New Keywords

### Method 1: Update Intents
```json
{
  "intent": "new_feature",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "answer": "Response text..."
}
```

### Method 2: Update FAQ
```json
{
  "Your Question": {
    "tags": ["tag1", "tag2", "tag3"],
    "answer": "Answer text..."
  }
}
```

### Method 3: Update Programs
Programs automatically index:
- Program name
- Degree type
- Specialization
- Core subjects
- Specializations

### Method 4: Update Internships
Internships automatically index:
- Internship name
- Domains offered

## API Functions

### `findByKeyword(query: string): KeywordMatch | null`
- Returns single best matching keyword
- Used as primary matching method
- Confidence score 0.85-0.95

### `findAllByKeywords(query: string, limit: number = 5): KeywordMatch[]`
- Returns up to 5 matching keywords
- Sorted by relevance score
- Useful for finding related topics

### `getKeywordIndex(): KeywordIndex`
- Returns complete keyword index
- Cached in memory
- Rebuilds on first call

### `getKeywordStats(): Object`
- Returns index statistics
- Breakdown by source
- Sample keywords

## Performance Optimization

1. **Lazy Loading**: Index built on first use
2. **In-Memory Caching**: Index stays in memory
3. **Direct Lookup**: O(1) exact keyword lookup
4. **Scoring Optimization**: Minimal computation
5. **Multi-Word Support**: Handles natural queries

## Confidence Scores

```
Source Confidence:
- Intents: 0.95 (highest priority)
- Programs: 0.92
- Internships: 0.92
- FAQ: 0.90
- Training Corpus: 0.85-0.90
```

## Testing Keywords

Try these queries to see keyword matching:

1. **Intent Keywords**
   - "I need to apply"
   - "Tell me about hostel"
   - "What documents needed?"

2. **Program Keywords**
   - "Tell me about CSE"
   - "What's in the MBA?"
   - "Data structures course"

3. **Internship Keywords**
   - "Summer internship details"
   - "Research internship opportunities"
   - "AI/ML internship"

4. **FAQ Keywords**
   - "Are scholarships available?"
   - "Tell me about placement"
   - "Library facilities?"

## Future Enhancements

- [ ] Fuzzy matching for typos
- [ ] Multi-language keyword support
- [ ] Dynamic keyword learning from conversations
- [ ] Keyword synonym mapping
- [ ] Category-based filtering
- [ ] Contextual keyword disambiguation

## Files Structure

```
src/
├── lib/
│   ├── keyword-response-map.ts      (Keyword index builder)
│   └── training-data.ts              (Training corpus)
├── app/
│   └── actions.ts                    (Query handler with keyword matching)
└── data/json/
    ├── intents.json                  (Keyword source 1)
    ├── faq.json                      (Keyword source 2)
    ├── programs.json                 (Keyword source 3)
    └── internships.json              (Keyword source 4)
```

## How It Works: Visual Flow

```
User Query
    ↓
[Query Normalization: lowercase, trim]
    ↓
[Greeting Check] → Greeting Response?
    ↓ No
[Keyword Matching] → Keyword found?
    ├─ YES → Direct response + AI enhancement
    │
    └─ NO → [Training Corpus Matching]
            ├─ YES → Response + AI enhancement
            │
            └─ NO → [AI Self-Healing]
                    ├─ YES → Generated response
                    │
                    └─ NO → [Log Unanswered] → Fallback response
```

## Integration Points

1. **ChatInterface.tsx**: Uses `handleUserQuery()` from actions.ts
2. **actions.ts**: Orchestrates keyword matching + AI flow
3. **keyword-response-map.ts**: Builds and searches keyword index
4. **training-data.ts**: Provides fallback training corpus

## Statistics Generated

```typescript
getKeywordStats() → {
  totalKeywords: 200+,
  bySource: {
    intent: 80+,
    faq: 40+,
    program: 60+,
    internship: 20+
  },
  sampleKeywords: [...]
}
```

---

**Last Updated:** December 18, 2025
**Version:** 2.0 (Keyword-Based Response System)
**Status:** Production Ready ✅
