import { config } from 'dotenv';
config();

import '@/ai/flows/ai-powered-faq-suggestions.ts';
import '@/ai/flows/unanswered-questions-flow.ts';
import '@/ai/flows/generate-answer-flow.ts';
import '@/ai/flows/log-feedback-flow.ts';
import '@/ai/flows/save-learned-answer-flow.ts';
