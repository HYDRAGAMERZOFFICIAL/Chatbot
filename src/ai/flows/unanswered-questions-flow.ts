'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fs from 'fs/promises';
import path from 'path';

type UnansweredQuestion = {
  question: string;
  timestamp: string;
};

const LogUnansweredQuestionInputSchema = z.object({
  question: z.string().describe("The user's question that could not be answered."),
});

export type LogUnansweredQuestionInput = z.infer<typeof LogUnansweredQuestionInputSchema>;

export async function logUnansweredQuestion(input: LogUnansweredQuestionInput): Promise<void> {
  return logUnansweredQuestionFlow(input);
}

const logUnansweredQuestionFlow = ai.defineFlow(
  {
    name: 'logUnansweredQuestionFlow',
    inputSchema: LogUnansweredQuestionInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const filePath = path.resolve(process.cwd(), 'src/data/json/unanswered_questions.json');
    
    try {
      let questions: UnansweredQuestion[] = [];
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        questions = JSON.parse(data);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }

      questions.push({
        question: input.question,
        timestamp: new Date().toISOString(),
      });

      await fs.writeFile(filePath, JSON.stringify(questions, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error logging unanswered question:', error);
      // Decide if you want to re-throw or handle it silently
    }
  }
);
