import type { EnhanceScanQualityWithLLMOutput } from '@/ai/flows/enhance-scan-quality-with-llm';
import type { ExtractAndSummarizeTextOutput } from '@/ai/flows/extract-and-summarize-text';
import type { TranslateTextOutput } from '@/ai/flows/translate-text-flow';

export type EnhancementResult = EnhanceScanQualityWithLLMOutput;
export type OcrResult = ExtractAndSummarizeTextOutput;
export type TranslationResult = TranslateTextOutput;

export type CropBox = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

export interface FormattingOptions {
  fontFamily: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

export interface Page {
    id: string;
    imageDataUri: string | null;
    originalImageDataUri: string | null;
    ocrResult: OcrResult | null;
    enhancementResult: EnhancementResult | null;
    translationResult: TranslationResult | null;
    cropBox: CropBox;
}
