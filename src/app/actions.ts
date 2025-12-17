
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

const intents: Intent[] = (intentsData as any).intents;
const faqs: FaqItem[] = Object.entries(faqData).map(([question, details]) => ({
  question,
  ...(details as Omit<FaqItem, 'question'>),
}));
const learnedAnswers: LearnedAnswerItem[] = learnedAnswersData as LearnedAnswerItem[];


// Function to recursively extract searchable text from the college data
const extractSearchableText = (obj: any): {text: string, answer: string}[] => {
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
         return [{text: obj.q, answer: obj.a}];
      }
      
      const searchableKeys = ['name', 'code', 'description', 'eligibility', 'duration_years', 'overview', 'mission', 'vision', 'facilities', 'activities'];
      
      let currentAnswerParts : string[] = [];

      for(const key in obj) {
          if(typeof obj[key] === 'string' || typeof obj[key] === 'number') {
              if(searchableKeys.includes(key)) {
                  textParts.push(String(obj[key]));
              }
              currentAnswerParts.push(`${key}: ${obj[key]}`);
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

const SIMILARITY_THRESHOLD = 0.2;

export async function handleUserQuery(query: string): Promise<{ answer: string; suggestions: string[] }> {
  if (!query.trim()) {
    return {
      answer: "Please ask a question.",
      suggestions: [],
    };
  }
  
  const { bestMatch, bestScore } = findBestMatch(query, searchCorpus, (item) => item.text);

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
  
  return {
    answer: "I'm sorry, I couldn't find an answer to your question. Would you like to talk with someone?",
    suggestions: [],
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
