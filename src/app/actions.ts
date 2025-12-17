
'use server';

import { findBestMatch } from '@/lib/similarity';
import intentsData from '@/data/json/intents.json';
import faqData from '@/data/json/faq.json';
import collegeData from '@/data/json/clg.json';
import learnedAnswersData from '@/data/json/learned_answers.json';
import { logUnansweredQuestion } from '@/ai/flows/unanswered-questions-flow';
import { generateAnswer, type GenerateAnswerInput } from '@/ai/flows/generate-answer-flow';
import { logFeedback } from '@/ai/flows/log-feedback-flow';
import { saveLearnedAnswer } from '@/ai/flows/save-learned-answer-flow';

import {
  suggestFAQ,
} from '@/ai/flows/ai-powered-faq-suggestions';

interface Intent {
  intent: string;
  keywords: string[];
  answer: string;
  questions: string[];
}

interface FaqItem {
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface LearnedAnswerItem {
    question: string;
    answer: string;
}

const intents: Intent[] = (intentsData as { intents: Intent[] }).intents;
const faqs: FaqItem[] = Object.entries(faqData).map(([question, details]) => ({
  question,
  ...(details as Omit<FaqItem, 'question'>),
}));
const learnedAnswers: LearnedAnswerItem[] = learnedAnswersData as LearnedAnswerItem[];


// Function to recursively extract searchable text from the college data
const extractSearchableText = (obj: unknown): {text: string, answer: string}[] => {
  let results: {text: string, answer: string}[] = [];
  if (obj && typeof obj === 'object') {
    // For arrays, iterate over items
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        results = results.concat(extractSearchableText(item));
      });
    } else {
      // For objects, create a text representation and an answer
      const textParts: string[] = [];
      let answer = '';
      
      if ('q' in obj && 'a' in obj) { // FAQ format
         const objWithQA = obj as { q: string; a: string };
         return [{text: objWithQA.q, answer: objWithQA.a}];
      }
      
      const searchableKeys = ['name', 'code', 'description', 'eligibility', 'duration_years', 'overview', 'mission', 'vision', 'facilities', 'activities'];
      
      const currentAnswerParts : string[] = [];
      const objRecord = obj as Record<string, unknown>;

      for(const key in objRecord) {
          if(typeof objRecord[key] === 'string' || typeof objRecord[key] === 'number') {
              if(searchableKeys.includes(key)) {
                  textParts.push(String(objRecord[key]));
              }
              currentAnswerParts.push(`${key}: ${objRecord[key]}`);
          }
      }

      answer = currentAnswerParts.join(', ');

      if(textParts.length > 0) {
           results.push({
               text: textParts.join(' '),
               answer: answer
           });
      }

      // Recurse into nested objects/arrays
      Object.values(obj).forEach(value => {
        results = results.concat(extractSearchableText(value));
      });
    }
  }
  return results;
};

const collegeSearchCorpus = extractSearchableText(collegeData);
const facultySearchCorpus: {text: string, answer: string}[] = [];

const searchCorpus: { text: string; answer: string }[] = [
  ...intents.map(i => ({ text: `${i.intent} ${i.keywords.join(' ')} ${i.questions.join(' ')}`, answer: i.answer })),
  ...faqs.map(f => ({ text: `${f.question} ${f.tags.join(' ')}`, answer: f.answer })),
  ...learnedAnswers.map(l => ({ text: l.question, answer: l.answer})),
  ...collegeSearchCorpus,
  ...facultySearchCorpus
];

const SIMILARITY_THRESHOLD = 0.1;

const queryTypeMap = {
  contact: ['contact', 'phone', 'number', 'call', 'email', 'reach', 'reach out', 'telephone', 'call college', 'speak'],
  location: ['location', 'address', 'where', 'situated', 'city', 'area', 'direction', 'route', 'reach college', 'campus location'],
  website: ['website', 'url', 'web', 'online', 'portal', 'apply online'],
  greeting: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
};

export async function handleUserQuery(query: string): Promise<{ answer: string; suggestions: string[] }> {
  if (!query.trim()) {
    return {
      answer: "Please ask a question about admissions, courses, fees, placement, or any other college information. How can I help you today?",
      suggestions: [
        "What courses are offered?",
        "How much are the fees?",
        "What's the placement rate?",
        "How can I contact the college?"
      ],
    };
  }

  const queryLower = query.toLowerCase().trim();
  
  if (queryTypeMap.greeting.some(kw => queryLower.includes(kw))) {
    return {
      answer: "Hello! I'm Collegewala chatbot. I'm here to help you with any questions about our college - admissions, courses, fees, placements, facilities, and much more. What would you like to know?",
      suggestions: [
        "What courses are offered?",
        "How can I apply for admission?",
        "Is hostel facility available?",
        "What is the fee structure?"
      ],
    };
  }
  
  let prioritizeKeyword = '';
  for (const [type, keywords] of Object.entries(queryTypeMap)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      prioritizeKeyword = type;
      break;
    }
  }
  
  let searchItems = searchCorpus;
  if (prioritizeKeyword) {
    searchItems = searchCorpus.sort((a, b) => {
      const keywords = queryTypeMap[prioritizeKeyword as keyof typeof queryTypeMap];
      const aScore = keywords?.filter((kw: string) => a.text.toLowerCase().includes(kw)).length || 0;
      const bScore = keywords?.filter((kw: string) => b.text.toLowerCase().includes(kw)).length || 0;
      return bScore - aScore;
    });
  }
  
  const { bestMatch, bestScore } = findBestMatch(query, searchItems, (item) => item.text);

  if (bestMatch && bestScore > SIMILARITY_THRESHOLD) {
    try {
      const generateAnswerInput: GenerateAnswerInput = {
        question: query,
        context: bestMatch.answer,
      };
      
      const [generatedAnswer, suggestedFaqs] = await Promise.all([
        generateAnswer(generateAnswerInput),
        suggestFAQ({
          userQuestion: query,
          previousAnswer: bestMatch.answer,
        }),
      ]);

      // Save the newly generated answer for future use
      if (bestScore < 0.95) { // Don't save if it's a very close match to existing data
        await saveLearnedAnswer({ question: query, answer: generatedAnswer.answer });
      }

      return {
        answer: generatedAnswer.answer,
        suggestions: suggestedFaqs.suggestedQuestions,
      };
    } catch (error) {
      console.error('AI processing failed:', error);
      // Fallback to returning the direct answer without suggestions on AI error
      return {
        answer: bestMatch.answer,
        suggestions: [],
      };
    }
  }

  try {
    // If no good match is found, try to generate an answer from the whole context
    // This is a "self-healing" attempt.
    const fullContext = searchCorpus.map(item => item.answer).join('\n\n');
     const generatedAnswer = await generateAnswer({
        question: query,
        context: `Could not find a specific answer. Attempt to answer the user's question based on the following general knowledge of the college:\n${fullContext}`
     });

    if (generatedAnswer && generatedAnswer.answer) {
        // Save this newly generated answer
        await saveLearnedAnswer({ question: query, answer: generatedAnswer.answer });
        return {
            answer: generatedAnswer.answer,
            suggestions: [], // Suggestions might not be relevant here
        };
    }
  } catch (aiError) {
      console.error('Generative self-healing failed:', aiError);
  }


  try {
    await logUnansweredQuestion({ question: query });
  } catch (error) {
    console.error('Failed to log unanswered question:', error);
  }
  
  const suggestedFAQs = [
    "What courses are offered?",
    "How can I apply for admission?",
    "What is the fee structure?",
    "Where is the college located?",
    "How do I contact the college?"
  ];

  return {
    answer: "I'm sorry, I don't have specific information about that question. However, I can help you with admissions, courses, fees, placements, facilities, and more! Our admissions team is also available at +91-80-6751-2100 or admissions@collegewala.edu to answer any detailed questions. Would you like to know about any of these popular topics instead?",
    suggestions: suggestedFAQs,
  };
}

export async function handleFeedback(
  history: { role: 'user' | 'bot'; text: string }[],
  feedback: 'good' | 'bad'
): Promise<void> {
  try {
    await logFeedback({ history, feedback });
  } catch (error) {
    console.error('Failed to log feedback:', error);
  }
}
