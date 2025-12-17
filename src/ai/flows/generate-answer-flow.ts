'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a conversational answer from a given context.
 *
 * @interface GenerateAnswerInput - Defines the input for the flow, including the user's question and the context to answer from.
 * @interface GenerateAnswerOutput - Defines the output of the flow, which is the generated answer.
 * @function generateAnswer - The main function that takes an input and returns a generated answer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnswerInputSchema = z.object({
  question: z.string().describe('The user\'s question.'),
  context: z.string().describe('The information to use to answer the user\'s question.'),
});

export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

const GenerateAnswerOutputSchema = z.object({
  answer: z.string().describe('The generated conversational answer.'),
});

export type GenerateAnswerOutput = z.infer<typeof GenerateAnswerOutputSchema>;

export async function generateAnswer(
  input: GenerateAnswerInput
): Promise<GenerateAnswerOutput> {
  return generateAnswerFlow(input);
}

const generateAnswerPrompt = ai.definePrompt({
  name: 'generateAnswerPrompt',
  input: {schema: GenerateAnswerInputSchema},
  output: {schema: GenerateAnswerOutputSchema},
  prompt: `You are a helpful AI assistant for a college. Your task is to answer the user's question based on the provided context. The answer should be conversational and directly address the user's query.

User Question: {{{question}}}
Context: {{{context}}}

Based on the context, provide a clear and concise answer.`,
});

const generateAnswerFlow = ai.defineFlow(
  {
    name: 'generateAnswerFlow',
    inputSchema: GenerateAnswerInputSchema,
    outputSchema: GenerateAnswerOutputSchema,
  },
  async input => {
    const {output} = await generateAnswerPrompt(input);
    return output!;
  }
);
