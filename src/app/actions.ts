
'use server';

import {
  buildTrainingCorpus,
  findBestTrainingMatches,
  type TrainingItem,
} from '@/lib/training-data';
import {
  findByKeyword,
} from '@/lib/keyword-response-map';
import { logUnansweredQuestion } from '@/ai/flows/unanswered-questions-flow';
import { generateAnswer, type GenerateAnswerInput } from '@/ai/flows/generate-answer-flow';
import { logFeedback } from '@/ai/flows/log-feedback-flow';
import { saveLearnedAnswer } from '@/ai/flows/save-learned-answer-flow';

import {
  suggestFAQ,
} from '@/ai/flows/ai-powered-faq-suggestions';

let trainingCorpus: TrainingItem[] | null = null;

const getTrainingCorpus = (): TrainingItem[] => {
  if (!trainingCorpus) {
    trainingCorpus = buildTrainingCorpus();
  }
  return trainingCorpus;
};
const SIMILARITY_THRESHOLD = 0.4;

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

  try {
    const keywordMatch = findByKeyword(query);
    
    if (keywordMatch) {
      try {
        const generateAnswerInput: GenerateAnswerInput = {
          question: query,
          context: keywordMatch.answer,
        };
        
        const [generatedAnswer, suggestedFaqs] = await Promise.all([
          generateAnswer(generateAnswerInput),
          suggestFAQ({
            userQuestion: query,
            previousAnswer: keywordMatch.answer,
          }),
        ]);

        await saveLearnedAnswer({ question: query, answer: generatedAnswer.answer });

        return {
          answer: generatedAnswer.answer,
          suggestions: suggestedFaqs.suggestedQuestions,
        };
      } catch (error) {
        console.error('AI processing failed:', error);
        return {
          answer: keywordMatch.answer,
          suggestions: [],
        };
      }
    }

    const corpus = getTrainingCorpus();
    const trainingMatches = findBestTrainingMatches(query, corpus, 3);
    
    if (trainingMatches.length > 0 && trainingMatches[0].score > SIMILARITY_THRESHOLD) {
      const bestMatch = trainingMatches[0].item;
      
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

        if (trainingMatches[0].score < 0.95) {
          await saveLearnedAnswer({ question: query, answer: generatedAnswer.answer });
        }

        return {
          answer: generatedAnswer.answer,
          suggestions: suggestedFaqs.suggestedQuestions,
        };
      } catch (error) {
        console.error('AI processing failed:', error);
        return {
          answer: bestMatch.answer,
          suggestions: [],
        };
      }
    }

    try {
      const topMatches = corpus.slice(0, 10).map(item => item.answer).join('\n\n');
      const generatedAnswer = await generateAnswer({
        question: query,
        context: `Could not find a specific answer. Attempt to answer the user's question based on the following general knowledge of the college:\n${topMatches}`
      });

      if (generatedAnswer && generatedAnswer.answer) {
        await saveLearnedAnswer({ question: query, answer: generatedAnswer.answer });
        return {
          answer: generatedAnswer.answer,
          suggestions: [],
        };
      }
    } catch (aiError) {
      console.error('Generative self-healing failed:', aiError);
    }
  } catch (error) {
    console.error('Error in query processing:', error);
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
