
'use server';
/**
 * @fileOverview Extracts text from an image, provides a concise summary, and translates the summary into Sindhi.
 *
 * - extractAndSummarizeText - A function that handles the text extraction, summarization, and translation process.
 * - ExtractAndSummarizeTextInput - The input type for the extractAndSummarizeText function.
 * - ExtractAndSummarizeTextOutput - The return type for the extractAndSummarizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const ExtractAndSummarizeTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractAndSummarizeTextInput = z.infer<typeof ExtractAndSummarizeTextInputSchema>;

const ExtractAndSummarizeTextOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the image.'),
  summary: z.string().describe('A concise summary of the extracted text in English.'),
  sindhiTranslation: z.string().describe('The Sindhi translation of the summary.'),
});
export type ExtractAndSummarizeTextOutput = z.infer<typeof ExtractAndSummarizeTextOutputSchema>;

export async function extractAndSummarizeText(
  input: ExtractAndSummarizeTextInput
): Promise<ExtractAndSummarizeTextOutput> {
  return extractAndSummarizeTextFlow(input);
}

const ocrPrompt = ai.definePrompt({
  name: 'ocrPrompt',
  input: {schema: ExtractAndSummarizeTextInputSchema},
  output: {schema: z.object({extractedText: z.string()})},
  prompt: `Extract all text from the following image. The text may be in Roman Sindhi, Roman Urdu, English, Sindhi, or Urdu. Preserve the original language and script.

Image: {{media url=photoDataUri}}`,
  model: googleAI.model('gemini-2.5-flash'),
});

const summaryPrompt = ai.definePrompt({
  name: 'summaryPrompt',
  input: {schema: z.object({extractedText: z.string()})},
  output: {schema: z.object({summary: z.string()})},
  prompt: `You are a professional researcher. Provide a concise and insightful summary of the following text in English, as if you have conducted research on the topic:\n\n{{{extractedText}}}`,
});

const sindhiTranslationPrompt = ai.definePrompt({
  name: 'sindhiTranslationPrompt',
  input: {schema: z.object({textToTranslate: z.string()})},
  output: {schema: z.object({sindhiTranslation: z.string()})},
  prompt: `Translate the following English text into Sindhi (in the Sindhi script):

"{{{textToTranslate}}}"
`,
});

const extractAndSummarizeTextFlow = ai.defineFlow(
  {
    name: 'extractAndSummarizeTextFlow',
    inputSchema: ExtractAndSummarizeTextInputSchema,
    outputSchema: ExtractAndSummarizeTextOutputSchema,
  },
  async input => {
    // Step 1: Extract text from image
    const ocrResult = await ocrPrompt(input);
    const extractedText = ocrResult.output?.extractedText || '';

    if (!extractedText) {
      return {
        extractedText: '',
        summary: '',
        sindhiTranslation: '',
      };
    }

    // Step 2: Generate summary from extracted text
    const summaryResult = await summaryPrompt({extractedText});
    const summary = summaryResult.output?.summary || '';
    
    if (!summary) {
       return {
        extractedText,
        summary: '',
        sindhiTranslation: '',
      };
    }

    // Step 3: Translate summary to Sindhi
    const translationResult = await sindhiTranslationPrompt({ textToTranslate: summary });
    const sindhiTranslation = translationResult.output?.sindhiTranslation || '';

    return {
      extractedText,
      summary,
      sindhiTranslation,
    };
  }
);
