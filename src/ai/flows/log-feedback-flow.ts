'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fs from 'fs/promises';
import path from 'path';

type Feedback = {
  history: Array<{
    role: 'user' | 'bot';
    text: string;
  }>;
  feedback: 'good' | 'bad';
  timestamp: string;
};

const LogFeedbackInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'bot']),
    text: z.string(),
  })).describe("The conversation history."),
  feedback: z.enum(['good', 'bad']).describe("The user's feedback."),
});

export type LogFeedbackInput = z.infer<typeof LogFeedbackInputSchema>;

export async function logFeedback(input: LogFeedbackInput): Promise<void> {
  return logFeedbackFlow(input);
}

const logFeedbackFlow = ai.defineFlow(
  {
    name: 'logFeedbackFlow',
    inputSchema: LogFeedbackInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const filePath = path.resolve(process.cwd(), 'src/data/json/feedback.json');
    
    try {
      let feedbackData: Feedback[] = [];
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        feedbackData = JSON.parse(data);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }

      feedbackData.push({
        history: input.history,
        feedback: input.feedback,
        timestamp: new Date().toISOString(),
      });

      await fs.writeFile(filePath, JSON.stringify(feedbackData, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error logging feedback:', error);
      // Decide if you want to re-throw or handle it silently
    }
  }
);
