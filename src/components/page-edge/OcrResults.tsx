'use client';

import { ScanText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { OcrResult } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface OcrResultsProps {
  onOcr: () => void;
  ocrResult: OcrResult | null;
  isOcring: boolean;
}

export function OcrResults({ onOcr, ocrResult, isOcring }: OcrResultsProps) {
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
        </div>
      )}
    </div>
  );
}
