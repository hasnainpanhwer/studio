'use server';
/**
 * @fileOverview Extracts text from an image using OCR and provides a concise summary.
 *
 * - extractAndSummarizeText - A function that handles the text extraction and summarization process.
 * - ExtractAndSummarizeTextInput - The input type for the extractAndSummarizeText function.
 * - ExtractAndSummarizeTextOutput - The return type for the extractAndSummarizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import * as fs from 'fs';

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
  summary: z.string().describe('A concise summary of the extracted text.'),
});
export type ExtractAndSummarizeTextOutput = z.infer<typeof ExtractAndSummarizeTextOutputSchema>;

export async function extractAndSummarizeText(input: ExtractAndSummarizeTextInput): Promise<ExtractAndSummarizeTextOutput> {
  return extractAndSummarizeTextFlow(input);
}

const ocrPrompt = ai.definePrompt({
  name: 'ocrPrompt',
  input: {schema: ExtractAndSummarizeTextInputSchema},
  output: {schema: z.object({extractedText: z.string()})},
  prompt: `Extract the text from the following image: {{media url=photoDataUri}}`,
  model: googleAI.model('gemini-2.5-flash'),
});

const summaryPrompt = ai.definePrompt({
  name: 'summaryPrompt',
  input: {schema: z.object({extractedText: z.string()})},
  output: {schema: z.object({summary: z.string()})},
  prompt: `Summarize the following text in a concise manner:\n\n{{{extractedText}}}`,
});

const extractAndSummarizeTextFlow = ai.defineFlow(
  {
    name: 'extractAndSummarizeTextFlow',
    inputSchema: ExtractAndSummarizeTextInputSchema,
    outputSchema: ExtractAndSummarizeTextOutputSchema,
  },
  async input => {
    const ocrResult = await ocrPrompt(input);
    const extractedText = ocrResult.output?.extractedText || '';

    const summaryResult = await summaryPrompt({extractedText});
    const summary = summaryResult.output?.summary || '';

    return {
      extractedText,
      summary,
    };
  }
);
