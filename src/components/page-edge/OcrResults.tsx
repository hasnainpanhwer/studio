'use client';

import { ScanText, Loader2, Languages, Download, BookCopy, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { OcrResult, TranslationResult, Page } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Packer as PackerType } from 'docx';
import type { saveAs as saveAsType } from 'file-saver';


interface OcrResultsProps {
  onOcr: () => void;
  ocrResult: OcrResult | null;
  isOcring: boolean;
  onTranslate: () => void;
  isTranslating: boolean;
  translationResult: TranslationResult | null;
  onBulkOcr: (pagesToProcess: Page[]) => void;
  pages: Page[];
  isBulkOcring: boolean;
}

export function OcrResults({ onOcr, ocrResult, isOcring, onTranslate, isTranslating, translationResult, onBulkOcr, pages, isBulkOcring }: OcrResultsProps) {
  const { toast } = useToast();
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const [docxPacker, setDocxPacker] = useState<typeof PackerType | null>(null);
  const [fileSaver, setFileSaver] = useState<{ saveAs: typeof saveAsType } | null>(null);

  useEffect(() => {
    // Dynamically import client-side libraries only on the client
    import('docx').then(module => setDocxPacker(() => module.Packer));
    import('file-saver').then(module => setFileSaver({ saveAs: module.saveAs }));
  }, []);

  const handleExportWord = async () => {
    if (!ocrResult || !docxPacker || !fileSaver) return;

    // We need to dynamically import these as well to use their types.
    const { Document, Paragraph, TextRun, HeadingLevel } = await import('docx');

    const { saveAs } = fileSaver;

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: "PageEdge Export",
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            text: "Extracted Text",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: ocrResult.extractedText,
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph({
            text: "Summary",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: ocrResult.summary,
          }),
          ...(translationResult ? [
            new Paragraph({
              text: "Sindhi Translation",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              rightToLeft: true,
              children: [
                new TextRun({
                  text: translationResult.translation1,
                  font: "MB Lateefi",
                  size: 28, // 14pt
                  rightToLeft: true,
                }),
              ],
            }),
            new Paragraph({
              text: "Urdu Translation",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 100 },
            }),
             new Paragraph({
              rightToLeft: true,
              children: [
                new TextRun({
                  text: translationResult.translation2,
                  size: 24, // 12pt
                  rightToLeft: true,
                }),
              ],
            }),
          ] : []),
        ],
      }],
    });

    docxPacker.toBlob(doc).then(blob => {
      saveAs(blob, 'PageEdge-Export.docx');
    });
  };

  const handleRangeOcr = () => {
    const start = parseInt(rangeStart, 10);
    const end = parseInt(rangeEnd, 10);
    if (isNaN(start) || isNaN(end) || start < 1 || end > pages.length || start > end) {
      toast({
        variant: 'destructive',
        title: 'Invalid Page Range',
        description: `Please enter a valid range between 1 and ${pages.length}.`,
      });
      return;
    }
    const pagesToProcess = pages.slice(start - 1, end);
    onBulkOcr(pagesToProcess);
  };

  const canExport = !!docxPacker && !!fileSaver && !!ocrResult;


  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Run Optical Character Recognition (OCR) to extract editable text from the current page.
        </p>
        <Button onClick={onOcr} disabled={isOcring} className="w-full">
          {isOcring && !isBulkOcring ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ScanText className="mr-2 h-4 w-4" />
          )}
          Extract Text from Current Page
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className="text-md font-medium mb-2">Bulk OCR Processing</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Extract text from all pages or a specific range of pages.
        </p>
        <div className="space-y-4">
           <Button onClick={() => onBulkOcr(pages)} disabled={isBulkOcring} className="w-full">
             {isBulkOcring ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
               <BookCopy className="mr-2 h-4 w-4" />
             )}
             Extract from All Pages ({pages.length})
           </Button>
           <div className="flex items-center gap-2">
             <Input 
               type="number" 
               placeholder="From" 
               className="w-1/2" 
               value={rangeStart}
               onChange={e => setRangeStart(e.target.value)}
               disabled={isBulkOcring}
             />
             <Input 
               type="number" 
               placeholder="To" 
               className="w-1/2"
               value={rangeEnd}
               onChange={e => setRangeEnd(e.target.value)}
               disabled={isBulkOcring}
            />
           </div>
           <Button onClick={handleRangeOcr} disabled={isBulkOcring} variant="secondary" className="w-full">
             {isBulkOcring ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
              <FileUp className="mr-2 h-4 w-4" />
             )}
             Extract from Range
           </Button>
        </div>
      </div>

      {(isOcring || ocrResult) && <Separator />}

      {isOcring && !ocrResult && (
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
                <div className="p-4 font-serif text-sm">{ocrResult.extractedText || "No text extracted."}</div>
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

          <div className="grid grid-cols-2 gap-2">
             <Button onClick={onTranslate} disabled={isTranslating || !ocrResult.summary} className="w-full">
              {isTranslating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Languages className="mr-2 h-4 w-4" />
              )}
              Translate Summary
            </Button>
            <Button onClick={handleExportWord} disabled={!canExport} variant="secondary" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export as Word
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
