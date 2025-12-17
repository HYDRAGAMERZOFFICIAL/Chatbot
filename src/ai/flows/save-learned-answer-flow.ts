'use server';

/**
 * @fileOverview This file defines a Genkit flow for saving a newly generated question-answer pair.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fs from 'fs/promises';
import path from 'path';

const LearnedAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  timestamp: z.string(),
});

type LearnedAnswer = z.infer<typeof LearnedAnswerSchema>;

const SaveLearnedAnswerInputSchema = z.object({
  question: z.string().describe("The user's question."),
  answer: z.string().describe('The generated answer to be saved.'),
});

export type SaveLearnedAnswerInput = z.infer<
  typeof SaveLearnedAnswerInputSchema
>;

export async function saveLearnedAnswer(
  input: SaveLearnedAnswerInput
): Promise<void> {
  return saveLearnedAnswerFlow(input);
}

const saveLearnedAnswerFlow = ai.defineFlow(
  {
    name: 'saveLearnedAnswerFlow',
    inputSchema: SaveLearnedAnswerInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const filePath = path.resolve(process.cwd(), 'src/data/json/learned_answers.json');
    
    try {
      let learnedAnswers: LearnedAnswer[] = [];
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        // Avoid parsing empty file
        if (data.trim()) {
            learnedAnswers = JSON.parse(data);
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Avoid saving duplicate questions
      const existingQuestion = learnedAnswers.find(
        (item) => item.question.toLowerCase() === input.question.toLowerCase()
      );

      if (!existingQuestion) {
        learnedAnswers.push({
          question: input.question,
          answer: input.answer,
          timestamp: new Date().toISOString(),
        });
        await fs.writeFile(filePath, JSON.stringify(learnedAnswers, null, 2), 'utf-8');
      }

    } catch (error) {
      console.error('Error saving learned answer:', error);
    }
  }
);
