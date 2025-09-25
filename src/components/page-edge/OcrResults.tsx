'use client';

import { ScanText, Loader2, Languages, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { OcrResult, TranslationResult } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OcrResultsProps {
  onOcr: () => void;
  ocrResult: OcrResult | null;
  isOcring: boolean;
  onTranslate: () => void;
  isTranslating: boolean;
  translationResult: TranslationResult | null;
}

export function OcrResults({ onOcr, ocrResult, isOcring, onTranslate, isTranslating, translationResult }: OcrResultsProps) {
  const handleExportPdf = () => {
    const pdfExportContent = document.getElementById('pdf-export-content');
    if (pdfExportContent) {
      html2canvas(pdfExportContent, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#111827' // Same as dark theme background
      }).then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('PageEdge-Export.pdf');
      });
    }
  };

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
      
      {/* Hidden div for PDF export */}
      <div id="pdf-export-content" style={{ position: 'absolute', left: '-9999px', width: '800px', padding: '20px', background: '#111827', color: 'white' }}>
          {ocrResult && (
            <div className="space-y-6 font-body">
              <h1 style={{ fontSize: '24px', fontFamily: 'Literata, serif' }}>PageEdge Export</h1>
              
              <div className="space-y-2">
                <h2 style={{ fontSize: '18px', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '8px' }}>Extracted Text</h2>
                <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap', fontFamily: 'Times New Roman, serif' }}>{ocrResult.extractedText}</p>
              </div>

              <div className="space-y-2">
                <h2 style={{ fontSize: '18px', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '8px' }}>Summary</h2>
                <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{ocrResult.summary}</p>
              </div>
              
              {translationResult && (
                <>
                  <div className="space-y-2">
                    <h2 style={{ fontSize: '18px', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '8px' }}>Sindhi Translation</h2>
                    <p style={{ fontSize: '18px', whiteSpace: 'pre-wrap', fontFamily: '"MB Lateefi", sans-serif' }} dir="rtl">{translationResult.translation1}</p>
                  </div>

                  <div className="space-y-2">
                    <h2 style={{ fontSize: '18px', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '8px' }}>Urdu Translation</h2>
                    <p style={{ fontSize: '16px', whiteSpace: 'pre-wrap' }} dir="rtl">{translationResult.translation2}</p>
                  </div>
                </>
              )}
            </div>
          )}
      </div>


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
            <Button onClick={handleExportPdf} disabled={!ocrResult} variant="secondary" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
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
