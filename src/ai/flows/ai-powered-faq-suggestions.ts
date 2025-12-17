'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting follow-up questions or related FAQs using AI.
 *
 * @interface AIPoweredFAQSuggestionsInput - Defines the input for the flow, including the user's question and the previous answer.
 * @interface AIPoweredFAQSuggestionsOutput - Defines the output of the flow, which is a list of suggested questions.
 * @function suggestFAQ - The main function that takes an input and returns a list of suggested FAQs.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredFAQSuggestionsInputSchema = z.object({
  userQuestion: z.string().describe('The user\'s initial question.'),
  previousAnswer: z.string().describe('The answer provided to the user\'s question.'),
});

export type AIPoweredFAQSuggestionsInput = z.infer<
  typeof AIPoweredFAQSuggestionsInputSchema
>;

const AIPoweredFAQSuggestionsOutputSchema = z.object({
  suggestedQuestions: z.array(z.string()).describe('A list of suggested follow-up questions or related FAQs.'),
});

export type AIPoweredFAQSuggestionsOutput = z.infer<
  typeof AIPoweredFAQSuggestionsOutputSchema
>;

export async function suggestFAQ(
  input: AIPoweredFAQSuggestionsInput
): Promise<AIPoweredFAQSuggestionsOutput> {
  return aiPoweredFAQSuggestionsFlow(input);
}

const faqSuggestionsPrompt = ai.definePrompt({
  name: 'faqSuggestionsPrompt',
  input: {schema: AIPoweredFAQSuggestionsInputSchema},
  output: {schema: AIPoweredFAQSuggestionsOutputSchema},
  prompt: `Given the user's question and the previous answer, suggest three potential follow-up questions or related FAQs that the user might be interested in.

User Question: {{{userQuestion}}}
Previous Answer: {{{previousAnswer}}}

Suggested Questions:`,
});

const aiPoweredFAQSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiPoweredFAQSuggestionsFlow',
    inputSchema: AIPoweredFAQSuggestionsInputSchema,
    outputSchema: AIPoweredFAQSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await faqSuggestionsPrompt(input);
    return output!;
  }
);
