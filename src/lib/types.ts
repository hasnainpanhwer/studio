import type { EnhanceScanQualityWithLLMOutput } from '@/ai/flows/enhance-scan-quality-with-llm';
import type { ExtractAndSummarizeTextOutput } from '@/ai/flows/extract-and-summarize-text';

export type EnhancementResult = EnhanceScanQualityWithLLMOutput;
export type OcrResult = ExtractAndSummarizeTextOutput;

export type CropBox = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
