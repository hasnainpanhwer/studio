'use server';
/**
 * @fileOverview Translates text from English to Urdu, and then from Urdu to Sindhi.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  textToTranslate: z.string().describe('The text to be translated, which is in English.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translation1: z.string().describe('The final text translated into Sindhi.'),
  translation2: z.string().describe('The intermediate text translated into Urdu.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

// Prompt 1: English to Urdu
const englishToUrduPrompt = ai.definePrompt({
  name: 'englishToUrduPrompt',
  input: {schema: z.object({ text: z.string() })},
  output: {schema: z.object({ urduTranslation: z.string() })},
  prompt: `Translate the following English text into Urdu:

"{{{text}}}"
`,
});

// Prompt 2: Urdu to Sindhi
const urduToSindhiPrompt = ai.definePrompt({
  name: 'urduToSindhiPrompt',
  input: {schema: z.object({ text: z.string() })},
  output: {schema: z.object({ sindhiTranslation: z.string() })},
  prompt: `Translate the following Urdu text into Sindhi:

"{{{text}}}"
`,
});


const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    // Step 1: Translate English to Urdu
    const urduResult = await englishToUrduPrompt({ text: input.textToTranslate });
    const urduTranslation = urduResult.output?.urduTranslation || '';

    if (!urduTranslation) {
        throw new Error("Failed to translate from English to Urdu.");
    }
    
    // Step 2: Translate Urdu to Sindhi
    const sindhiResult = await urduToSindhiPrompt({ text: urduTranslation });
    const sindhiTranslation = sindhiResult.output?.sindhiTranslation || '';

    if (!sindhiTranslation) {
        throw new Error("Failed to translate from Urdu to Sindhi.");
    }

    // Return both translations, mapping Sindhi to translation1 and Urdu to translation2
    return {
      translation1: sindhiTranslation,
      translation2: urduTranslation,
    };
  }
);
