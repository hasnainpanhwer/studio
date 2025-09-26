'use server';

/**
 * @fileOverview Applies a custom crop to an image based on a user's text command.
 *
 * - customCrop - A function that interprets a command and returns crop values.
 * - CustomCropInput - The input type for the customCrop function.
 * - CustomCropOutput - The return type for the customCrop function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomCropInputSchema = z.object({
  command: z.string().describe('A user-provided command for cropping the image, e.g., "crop 20px from top and bottom".'),
});
export type CustomCropInput = z.infer<typeof CustomCropInputSchema>;

const CustomCropOutputSchema = z.object({
  top: z.number().describe('The number of pixels to crop from the top.'),
  right: z.number().describe('The number of pixels to crop from the right.'),
  bottom: z.number().describe('The number of pixels to crop from the bottom.'),
  left: z.number().describe('The number of pixels to crop from the left.'),
});
export type CustomCropOutput = z.infer<typeof CustomCropOutputSchema>;

export async function customCrop(
  input: CustomCropInput
): Promise<CustomCropOutput> {
  return customCropFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customCropPrompt',
  input: {schema: CustomCropInputSchema},
  output: {schema: CustomCropOutputSchema},
  prompt: `You are an expert at interpreting image cropping commands. The user will provide a command to crop an image. Your task is to extract the cropping values in pixels for top, right, bottom, and left.

The command can be in English, Sindhi, Urdu, Roman Sindhi, or Roman Urdu. You must understand the command regardless of the language.

If a side is not mentioned, its crop value should be 0.

User command: "{{command}}"

Based on this command, determine the pixel values for cropping each side.
`,
});

const customCropFlow = ai.defineFlow(
  {
    name: 'customCropFlow',
    inputSchema: CustomCropInputSchema,
    outputSchema: CustomCropOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
