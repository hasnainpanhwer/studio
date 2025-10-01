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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


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
  const [libsLoaded, setLibsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import client-side libraries only on the client
    Promise.all([
      import('docx'),
      import('file-saver'),
    ]).then(([docxModule, fileSaverModule]) => {
      docxRef.current = docxModule;
      fileSaverRef.current = fileSaverModule;
      setLibsLoaded(true);
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
                <div 
                  className="p-4"
                  style={{
                    fontFamily: formatting.fontFamily,
                    fontSize: `${formatting.fontSize}pt`,
                    textAlign: formatting.alignment,
                  }}
                >
                  {ocrResult.extractedText || "No text extracted."}
                </div>
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
                          <Label>Font Size (pt)</Label>
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
                      <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="secondary" disabled>
                                    <FileType className="mr-2 h-4 w-4" />
                                    Export as PDF
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>PDF export is temporarily unavailable.</p>
                            </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </div>
      )}
    </div>
  );
}
