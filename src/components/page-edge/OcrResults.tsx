'use client';

import { ScanText, Loader2, Languages, Download, BookCopy, FileUp, CaseSensitive, Pilcrow, AlignLeft, AlignCenter, AlignRight, AlignJustify, FileText as FileTextIcon, FileImage, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { OcrResult, TranslationResult, Page, FormattingOptions } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Packer as PackerType, PageSize as PageSizeType, AlignmentType } from 'docx';
import type { saveAs as saveAsType } from 'file-saver';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import type { jsPDF as jsPDFType } from 'jspdf';


// Embed Page Sizes to avoid dynamic import issues
const PAGE_SIZES = {
  A4: {
    width: 11906,
    height: 16838,
    orientation: 'portrait',
  },
  LETTER: {
    width: 12240,
    height: 15840,
    orientation: 'portrait',
  },
  LEGAL: {
    width: 12240,
    height: 20160,
    orientation: 'portrait',
  },
};


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
  const [formatting, setFormatting] = useState<FormattingOptions>({
    fontFamily: 'Times New Roman',
    fontSize: 12,
    alignment: 'left',
    sindhiFont: 'MB Lateefi',
    urduFont: 'Jameel Noori Nastaleeq',
  });

  const docxRef = useRef<any>(null);
  const fileSaverRef = useRef<any>(null);
  const jsPDFRef = useRef<any>(null);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [base64LateefiFont, setBase64LateefiFont] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import client-side libraries only on the client
    Promise.all([
      import('docx'),
      import('file-saver'),
      import('jspdf')
    ]).then(([docxModule, fileSaverModule, jspdfModule]) => {
      docxRef.current = docxModule;
      fileSaverRef.current = fileSaverModule;
      jsPDFRef.current = jspdfModule;
      setLibsLoaded(true);

      // Fetch and convert font for PDF
      fetch('/fonts/MB-Lateefi-Regular.ttf')
        .then(res => res.arrayBuffer())
        .then(buf => {
            const base64 = btoa(new Uint8Array(buf).reduce((data, byte) => data + String.fromCharCode(byte), ''));
            setBase64LateefiFont(base64);
        }).catch(error => console.error("Failed to load font for PDF", error));

    }).catch(error => console.error("Failed to load export libraries", error));
  }, []);

  const handleExportWord = async () => {
    if (!ocrResult || !docxRef.current || !fileSaverRef.current) return;
    
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docxRef.current;
    const { saveAs } = fileSaverRef.current;
    
    const getAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
      switch(align) {
        case 'center': return AlignmentType.CENTER;
        case 'right': return AlignmentType.RIGHT;
        case 'justify': return AlignmentType.JUSTIFIED;
        default: return AlignmentType.LEFT;
      }
    }
    
    const selectedPageSize = PAGE_SIZES['A4'];

    if (!selectedPageSize) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Default page size information (A4) could not be loaded.',
      });
      return;
    }

    const doc = new Document({
      sections: [{
        properties: {
            pageSize: {
                width: selectedPageSize.width,
                height: selectedPageSize.height,
                orientation: selectedPageSize.orientation,
            },
        },
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
                font: formatting.fontFamily,
                size: formatting.fontSize * 2, // docx size is in half-points
              }),
            ],
            alignment: getAlignment(formatting.alignment),
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
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: translationResult.translation1,
                  font: formatting.sindhiFont,
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
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: translationResult.translation2,
                  font: formatting.urduFont,
                  size: 24, // 12pt
                  rightToLeft: true,
                }),
              ],
            }),
          ] : []),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'PageEdge-Export.docx');
    });
  };
  
  const handleExportPdf = () => {
    if (!ocrResult || !jsPDFRef.current || !base64LateefiFont) {
        toast({
            variant: 'destructive',
            title: 'Export Failed',
            description: 'The PDF library or required fonts are not loaded yet. Please try again in a moment.',
        });
        return;
    }
    const { jsPDF } = jsPDFRef.current;
    const doc = new jsPDF();
    
    // Add font
    doc.addFileToVFS('MB-Lateefi-Regular.ttf', base64LateefiFont);
    doc.addFont('MB-Lateefi-Regular.ttf', 'MBLateefi', 'normal');

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;

    const checkY = (requiredHeight: number) => {
        if (y + requiredHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };

    doc.setFontSize(22);
    doc.text("PageEdge Export", pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(16);
    doc.text("Extracted Text", margin, y);
    y += 8;
    doc.setFontSize(12);
    const extractedLines = doc.splitTextToSize(ocrResult.extractedText, maxWidth);
    checkY(extractedLines.length * 5);
    doc.text(extractedLines, margin, y);
    y += extractedLines.length * 5 + 10;
    
    checkY(20);
    doc.setFontSize(16);
    doc.text("Summary", margin, y);
    y += 8;
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(ocrResult.summary, maxWidth);
    checkY(summaryLines.length * 5);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 10;
    
    if (translationResult) {
        checkY(20);
        doc.setFont('MBLateefi');
        
        doc.setFontSize(16);
        doc.text("Sindhi Translation", pageWidth - margin, y, { align: 'right' });
        y += 8;

        doc.setFontSize(14);
        const sindhiLines = doc.splitTextToSize(translationResult.translation1, maxWidth);
        checkY(sindhiLines.length * 7);
        doc.text(sindhiLines, pageWidth - margin, y, { align: 'right', lang: 'sd' });
        y += sindhiLines.length * 7 + 10;

        checkY(20);
        doc.setFontSize(16);
        doc.text("Urdu Translation", pageWidth - margin, y, { align: 'right' });
        y += 8;
        
        doc.setFontSize(12);
        const urduLines = doc.splitTextToSize(translationResult.translation2, maxWidth);
        checkY(urduLines.length * 7);
        doc.text(urduLines, pageWidth - margin, y, { align: 'right', lang: 'ur' });
    }

    doc.save('PageEdge-Export.pdf');
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

  const canExport = libsLoaded && !!ocrResult;


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
          
          <Button onClick={onTranslate} disabled={!ocrResult || isTranslating} className="w-full">
            {isTranslating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Languages className="mr-2 h-4 w-4" />
            )}
            Translate Summary
          </Button>

          {isTranslating && (
            <div className="space-y-4 mt-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
          )}

          {translationResult && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="translation-sindhi" className="mb-2 block font-sindhi">سنڌي ترجمو</Label>
                <Textarea
                  id="translation-sindhi"
                  readOnly
                  value={translationResult.translation1}
                  className="h-28 text-right font-sindhi text-lg"
                  dir="rtl"
                />
              </div>
              <div>
                <Label htmlFor="translation-urdu" className="mb-2 block" style={{ fontFamily: 'Jameel Noori Nastaleeq' }}>اردو ترجمہ</Label>
                <Textarea
                  id="translation-urdu"
                  readOnly
                  value={translationResult.translation2}
                  className="h-28 text-right"
                  style={{ fontFamily: 'Jameel Noori Nastaleeq', fontSize: '1.2rem' }}
                  dir="rtl"
                />
              </div>
            </div>
          )}

          <Separator />

           <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="formatting-options">
                <AccordionTrigger>Formatting Options</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <p className="text-sm text-muted-foreground">These settings will be applied to the exported Word document.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select
                            value={formatting.fontFamily}
                            onValueChange={(value) => setFormatting(f => ({ ...f, fontFamily: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select font" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Courier New">Courier New</SelectItem>
                              <SelectItem value="Calibri">Calibri</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input 
                            type="number" 
                            value={formatting.fontSize}
                            onChange={(e) => setFormatting(f => ({ ...f, fontSize: parseInt(e.target.value, 10) || 12 }))}
                          />
                        </div>
                      </div>
                       <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Sindhi Font</Label>
                          <Select
                            value={formatting.sindhiFont}
                            onValueChange={(value) => setFormatting(f => ({ ...f, sindhiFont: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Sindhi font" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MB Lateefi">MB Lateefi</SelectItem>
                              {/* Add other Sindhi fonts here */}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Urdu Font</Label>
                          <Select
                            value={formatting.urduFont}
                            onValueChange={(value) => setFormatting(f => ({ ...f, urduFont: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Urdu font" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Jameel Noori Nastaleeq">Jameel Noori Nastaleeq</SelectItem>
                               <SelectItem value="Alvi Nastaleeq">Alvi Nastaleeq</SelectItem>
                              {/* Add other Urdu fonts here */}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                       <div>
                          <Label>Text Alignment</Label>
                           <ToggleGroup 
                              type="single"
                              variant="outline" 
                              className="justify-start mt-2"
                              value={formatting.alignment}
                              onValueChange={(value: 'left' | 'center' | 'right' | 'justify') => {
                                if (value) setFormatting(f => ({ ...f, alignment: value }))
                              }}
                            >
                              <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                              <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                              <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                              <ToggleGroupItem value="justify" aria-label="Align justify"><AlignJustify className="h-4 w-4" /></ToggleGroupItem>
                            </ToggleGroup>
                       </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>


            <Separator />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="export-options">
                <AccordionTrigger>Export Options</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-4 pt-4">
                     <Button onClick={handleExportWord} disabled={!canExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export as Word (.docx)
                      </Button>
                      <Button variant="secondary" onClick={handleExportPdf} disabled={!canExport || !base64LateefiFont}>
                        <FileType className="mr-2 h-4 w-4" />
                        Export as PDF
                      </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </div>
      )}
    </div>
  );
}
