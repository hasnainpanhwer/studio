import { config } from 'dotenv';
config();

import '@/ai/flows/extract-and-summarize-text.ts';
import '@/ai/flows/enhance-scan-quality-with-llm.ts';
import '@/ai/flows/straighten-document-flow.ts';
import '@/ai/flows/translate-text-flow.ts';
import '@/ai/flows/custom-crop-flow.ts';
