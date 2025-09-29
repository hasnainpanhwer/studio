'use server';
/**
 * @fileOverview Translates text into Sindhi and Urdu.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  textToTranslate: z.string().describe('The text to be translated.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translation1: z.string().describe('The text translated into Sindhi.'),
  translation2: z.string().describe('The text translated into Urdu.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are a translation expert. Translate the following text into two languages as requested.

Text to translate:
{{{textToTranslate}}}

Translate the text above into "Sindhi" and return it in the 'translation1' field.
Translate the text above into "Urdu" and return it in the 'translation2' field.
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    const {output} = await translatePrompt(input);
    return output!;
  }
);
