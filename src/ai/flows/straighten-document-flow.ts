'use server';

/**
 * @fileOverview Straightens a document image using an AI model.
 *
 * - straightenDocument - A function that corrects perspective and straightens a document image.
 * - StraightenDocumentInput - The input type for the straightenDocument function.
 * - StraightenDocumentOutput - The return type for the straightenDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const StraightenDocumentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type StraightenDocumentInput = z.infer<typeof StraightenDocumentInputSchema>;

const StraightenDocumentOutputSchema = z.object({
  straightenedImageUri: z.string().describe('The straightened document image as a data URI.'),
});
export type StraightenDocumentOutput = z.infer<typeof StraightenDocumentOutputSchema>;

export async function straightenDocument(
  input: StraightenDocumentInput
): Promise<StraightenDocumentOutput> {
  return straightenDocumentFlow(input);
}

const straightenDocumentFlow = ai.defineFlow(
  {
    name: 'straightenDocumentFlow',
    inputSchema: StraightenDocumentInputSchema,
    outputSchema: StraightenDocumentOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image-preview'),
      prompt: [
        {media: {url: input.photoDataUri}},
        {
          text: 'Straighten the document in this image. Correct any perspective distortion and rotation to make the text appear flat and perfectly horizontal, as if it were scanned perfectly. The background should be clean and white. Output only the transformed image.',
        },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate straightened image.');
    }

    return {
      straightenedImageUri: media.url,
    };
  }
);
