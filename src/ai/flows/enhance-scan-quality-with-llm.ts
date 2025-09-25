'use server';

/**
 * @fileOverview Enhances scan quality using an LLM to estimate border thickness and darkness.
 *
 * - enhanceScanQualityWithLLM - A function that enhances scan quality for better edge detection.
 * - EnhanceScanQualityWithLLMInput - The input type for the enhanceScanQualityWithLLM function.
 * - EnhanceScanQualityWithLLMOutput - The return type for the enhanceScanQualityWithLLM function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceScanQualityWithLLMInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a scanned document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .optional()
    .describe('Optional description of the scan to provide additional context.'),
});
export type EnhanceScanQualityWithLLMInput = z.infer<typeof EnhanceScanQualityWithLLMInputSchema>;

const EnhanceScanQualityWithLLMOutputSchema = z.object({
  estimatedBorderThickness: z
    .number()
    .describe('Estimated border thickness in pixels.'),
  estimatedBorderDarkness: z
    .number()
    .describe('Estimated border darkness on a scale from 0 to 1, where 0 is light and 1 is dark.'),
  enhancementSuggestions: z
    .string()
    .describe('Suggestions for enhancing the scan quality based on the image analysis.'),
});
export type EnhanceScanQualityWithLLMOutput = z.infer<typeof EnhanceScanQualityWithLLMOutputSchema>;

export async function enhanceScanQualityWithLLM(
  input: EnhanceScanQualityWithLLMInput
): Promise<EnhanceScanQualityWithLLMOutput> {
  return enhanceScanQualityWithLLMFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceScanQualityPrompt',
  input: {schema: EnhanceScanQualityWithLLMInputSchema},
  output: {schema: EnhanceScanQualityWithLLMOutputSchema},
  prompt: `You are an AI expert in document scanning and image processing.

You will analyze the provided scan image and estimate the border thickness in pixels and the border darkness on a scale from 0 to 1.
Also, you will provide suggestions for enhancing the scan quality.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}

Output the estimatedBorderThickness, estimatedBorderDarkness, and enhancementSuggestions fields as JSON.
`,
});

const enhanceScanQualityWithLLMFlow = ai.defineFlow(
  {
    name: 'enhanceScanQualityWithLLMFlow',
    inputSchema: EnhanceScanQualityWithLLMInputSchema,
    outputSchema: EnhanceScanQualityWithLLMOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
