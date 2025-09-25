'use server';

import { enhanceScanQualityWithLLM } from '@/ai/flows/enhance-scan-quality-with-llm';
import { extractAndSummarizeText } from '@/ai/flows/extract-and-summarize-text';
import { straightenDocument } from '@/ai/flows/straighten-document-flow';


type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function enhanceScan(imageDataUri: string): Promise<ActionResult<Awaited<ReturnType<typeof enhanceScanQualityWithLLM>>>> {
    if (!imageDataUri.startsWith('data:image/')) {
        return { success: false, error: 'Invalid image data URI.' };
    }
    try {
        const result = await enhanceScanQualityWithLLM({ photoDataUri: imageDataUri });
        return { success: true, data: result };
    } catch (error) {
        console.error('Error enhancing scan:', error);
        return { success: false, error: 'An unexpected error occurred while enhancing the scan.' };
    }
}

export async function extractTextFromImage(imageDataUri: string): Promise<ActionResult<Awaited<ReturnType<typeof extractAndSummarizeText>>>> {
    if (!imageDataUri.startsWith('data:image/')) {
        return { success: false, error: 'Invalid image data URI.' };
    }
    try {
        const result = await extractAndSummarizeText({ photoDataUri: imageDataUri });
        return { success: true, data: result };
    } catch (error) {
        console.error('Error extracting text:', error);
        return { success: false, error: 'An unexpected error occurred during text extraction.' };
    }
}

export async function straightenImage(imageDataUri: string): Promise<ActionResult<Awaited<ReturnType<typeof straightenDocument>>>> {
    if (!imageDataUri.startsWith('data:image/')) {
        return { success: false, error: 'Invalid image data URI.' };
    }
    try {
        const result = await straightenDocument({ photoDataUri: imageDataUri });
        return { success: true, data: result };
    } catch (error) {
        console.error('Error straightening image:', error);
        return { success: false, error: 'An unexpected error occurred while straightening the image.' };
    }
}
