'use client';

import { ScanText, Loader2, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { OcrResult, TranslationResult } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

interface OcrResultsProps {
  onOcr: () => void;
  ocrResult: OcrResult | null;
  isOcring: boolean;
  onTranslate: () => void;
  isTranslating: boolean;
  translationResult: TranslationResult | null;
}

export function OcrResults({ onOcr, ocrResult, isOcring, onTranslate, isTranslating, translationResult }: OcrResultsProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Run Optical Character Recognition (OCR) to extract editable text from the cleaned image.
        </p>
        <Button onClick={onOcr} disabled={isOcring} className="w-full">
          {isOcring ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ScanText className="mr-2 h-4 w-4" />
          )}
          Extract Text
        </Button>
      </div>

      {(isOcring || ocrResult) && <Separator />}

      {isOcring && (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Extracted Text</Label>
                <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-2">
                <Label>Summary</Label>
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
      )}

      {ocrResult && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="extracted-text" className="mb-2 block">Extracted Text</Label>
            <ScrollArea className="h-60 w-full rounded-md border">
                <div className="p-4 font-mono text-sm">{ocrResult.extractedText || "No text extracted."}</div>
            </ScrollArea>
          </div>
          <div>
            <Label htmlFor="summary" className="mb-2 block">Summary</Label>
            <Textarea
              id="summary"
              readOnly
              value={ocrResult.summary || "No summary generated."}
              className="h-32"
            />
          </div>

          <Separator />

          <div>
             <Button onClick={onTranslate} disabled={isTranslating || !ocrResult.summary} className="w-full">
              {isTranslating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Languages className="mr-2 h-4 w-4" />
              )}
              Translate Summary
            </Button>
          </div>

          {(isTranslating || translationResult) && (
            <div className="space-y-4 mt-4">
              {isTranslating && (
                <>
                  <div className='space-y-2'>
                    <Label>Sindhi Translate</Label>
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <div className='space-y-2'>
                    <Label>Urdu</Label>
                    <Skeleton className="h-24 w-full" />
                  </div>
                </>
              )}
              {translationResult && (
                <>
                  <div>
                    <Label htmlFor="sindhi-translation" className="mb-2 block">Sindhi Translate</Label>
                    <Textarea
                      id="sindhi-translation"
                      readOnly
                      value={translationResult.translation1 || "No Sindhi translation."}
                      className="h-24 font-sindhi text-lg"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="urdu-translation" className="mb-2 block">Urdu</Label>
                    <Textarea
                      id="urdu-translation"
                      readOnly
                      value={translationResult.translation2 || "No Urdu translation."}
                      className="h-24"
                      dir="rtl"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
