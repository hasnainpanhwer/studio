'use client';

import { useState } from 'react';
import { Loader2, BookOpen, Settings, FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/page-edge/Header';
import { UploadPanel } from '@/components/page-edge/UploadPanel';
import { ImagePreview } from '@/components/page-edge/ImagePreview';
import { ProcessingTools } from '@/components/page-edge/ProcessingTools';
import { OcrResults } from '@/components/page-edge/OcrResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { enhanceScan, extractTextFromImage, straightenImage, getTranslations } from '@/app/actions';
import type { EnhancementResult, OcrResult, CropBox, TranslationResult, Page } from '@/lib/types';
import { PageList } from '@/components/page-edge/PageList';

export default function PageEdgeHome() {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState({ ocr: false, enhance: false, straighten: false, translate: false });
  const { toast } = useToast();

  const activePage = activePageIndex !== null ? pages[activePageIndex] : null;

  const updatePage = (index: number, pageData: Partial<Page>) => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[index] = { ...newPages[index], ...pageData };
      return newPages;
    });
  };

  const updateActivePage = (pageData: Partial<Page>) => {
    if (activePageIndex === null) return;
    updatePage(activePageIndex, pageData);
  };

  const handleImageUpload = (files: File[]) => {
    if (files.length === 0) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<Page>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUri = e.target?.result as string;
          resolve({
            id: Date.now().toString() + Math.random(),
            imageDataUri: dataUri,
            originalImageDataUri: dataUri,
            ocrResult: null,
            enhancementResult: null,
            translationResult: null,
            cropBox: { top: 10, right: 10, bottom: 10, left: 10 },
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(newPages => {
      setPages(prevPages => {
        const updatedPages = [...prevPages, ...newPages];
        // Set the active page to the first of the newly added pages
        setActivePageIndex(prevPages.length);
        return updatedPages;
      });
      toast({
        title: `${newPages.length} page(s) added`,
        description: 'Your new pages have been added to the list.',
      });
    }).catch(error => {
        console.error("Error reading files:", error);
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "There was an error processing the uploaded files."
        });
    });
  };
  
  const handleAddNewPage = () => {
    setActivePageIndex(null);
  }

  const handleEnhance = async () => {
    if (!activePage?.originalImageDataUri) return;
    setIsLoading(prev => ({ ...prev, enhance: true }));
    updateActivePage({ enhancementResult: null });

    const result = await enhanceScan(activePage.originalImageDataUri);
    if (result.success) {
      const newCropBox = {
        top: result.data.estimatedBorderThickness,
        right: result.data.estimatedBorderThickness,
        bottom: result.data.estimatedBorderThickness,
        left: result.data.estimatedBorderThickness,
      };
      updateActivePage({ enhancementResult: result.data, cropBox: newCropBox });
      handleCropBoxApply(newCropBox, true);
       toast({
        title: 'AI Enhancement Applied',
        description: 'The AI-suggested crop has been applied to the preview.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Enhancement Failed',
        description: result.error,
      });
    }
    setIsLoading(prev => ({ ...prev, enhance: false }));
  };

  const handleSingleOcr = async () => {
    if (!activePage?.imageDataUri) return;
    setIsLoading(prev => ({ ...prev, ocr: true }));
    updateActivePage({ ocrResult: null, translationResult: null });
    
    const result = await extractTextFromImage(activePage.imageDataUri);
    if (result.success) {
      updateActivePage({ ocrResult: result.data });
    } else {
      toast({
        variant: 'destructive',
        title: 'OCR Failed',
        description: result.error,
      });
    }
    setIsLoading(prev => ({ ...prev, ocr: false }));
  };

  const handleBulkOcr = async (pagesToProcess: Page[]) => {
    if (pagesToProcess.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Pages to Process',
        description: 'No pages were selected for OCR.',
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, ocr: true }));
    toast({
      title: 'Bulk OCR Started',
      description: `Extracting text from ${pagesToProcess.length} pages. This may take a moment.`,
    });

    let successCount = 0;
    let errorCount = 0;

    for (const page of pagesToProcess) {
        const pageIndex = pages.findIndex(p => p.id === page.id);
        if (pageIndex === -1 || !page.imageDataUri) {
            errorCount++;
            continue;
        }

        updatePage(pageIndex, { ocrResult: null, translationResult: null });
        
        try {
            const result = await extractTextFromImage(page.imageDataUri);
            if (result.success) {
                updatePage(pageIndex, { ocrResult: result.data });
                successCount++;
            } else {
                errorCount++;
            }
        } catch (error) {
            errorCount++;
        }
    }

    setIsLoading(prev => ({ ...prev, ocr: false }));
    toast({
      title: 'Bulk OCR Complete',
      description: `${successCount} pages processed successfully. ${errorCount} pages failed.`,
    });
  };

  const handleTranslate = async () => {
    if (!activePage?.ocrResult?.summary) return;
    setIsLoading(prev => ({ ...prev, translate: true }));
    updateActivePage({ translationResult: null });

    const result = await getTranslations(activePage.ocrResult.summary);
    if (result.success) {
      updateActivePage({ translationResult: result.data });
    } else {
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: result.error,
      });
    }
    setIsLoading(prev => ({ ...prev, translate: false }));
  };
  
  const handleStraighten = async () => {
    if (!activePage?.imageDataUri) return;
    setIsLoading(prev => ({...prev, straighten: true}));
    const result = await straightenImage(activePage.imageDataUri);
    if (result.success && result.data.straightenedImageUri) {
      updateActivePage({ imageDataUri: result.data.straightenedImageUri });
      toast({
        title: 'Image Straightened',
        description: 'The document has been straightened and cleaned.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Straighten Failed',
        description: result.error,
      });
    }
    setIsLoading(prev => ({...prev, straighten: false}));
  };

  const handleCropBoxChange = (newCropBox: CropBox) => {
    updateActivePage({ cropBox: newCropBox });
  };

  const handleCropBoxApply = (boxToApply?: CropBox, quiet: boolean = false) => {
    if (!activePage) return;
    const theCropBox = boxToApply || activePage.cropBox;
    if (!activePage.imageDataUri) return;

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const sx = theCropBox.left;
        const sy = theCropBox.top;
        const sWidth = img.width - theCropBox.left - theCropBox.right;
        const sHeight = img.height - theCropBox.top - theCropBox.bottom;

        canvas.width = sWidth > 0 ? sWidth : 1;
        canvas.height = sHeight > 0 ? sHeight : 1;

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        
        const newDataUri = canvas.toDataURL('image/jpeg');
        updateActivePage({ 
          imageDataUri: newDataUri,
          cropBox: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        if (!quiet) {
          toast({
            title: 'Adjustments Applied',
            description: 'The manual crop adjustments have been applied to the preview.',
          });
        }
    };
    img.src = activePage.imageDataUri; // Use current image data, not original
  };
  
  const handleReset = () => {
    if (!activePage) return;
    updateActivePage({
      imageDataUri: activePage.originalImageDataUri,
      cropBox: { top: 10, right: 10, bottom: 10, left: 10 },
      enhancementResult: null,
      ocrResult: null,
      translationResult: null,
    });
     toast({
      title: 'Image Reset',
      description: 'The image has been reset to its original state.',
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full max-w-full mx-auto flex">
        <PageList 
          pages={pages}
          activePageIndex={activePageIndex}
          onSelectPage={setActivePageIndex}
          onAddNewPage={handleAddNewPage}
        />
        <div className="flex-1 p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-3 flex flex-col gap-8">
              {activePage ? (
                <ImagePreview 
                  imageDataUri={activePage.imageDataUri} 
                  cropBox={activePage.cropBox} 
                  onReset={handleReset}
                  originalImageAvailable={!!activePage.originalImageDataUri && activePage.imageDataUri !== activePage.originalImageDataUri}
                />
              ) : (
                <UploadPanel onImageUpload={handleImageUpload} />
              )}
            </div>

            <div className="lg:col-span-2">
              {activePage && (
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-primary" />
                      Page Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="tools" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="tools"><Settings className="w-4 h-4 mr-2" /> Tools</TabsTrigger>
                        <TabsTrigger value="ocr"><FileText className="w-4 h-4 mr-2" />Extracted Text</TabsTrigger>
                      </TabsList>
                      <TabsContent value="tools" className="mt-6">
                        <ProcessingTools
                          onEnhance={handleEnhance}
                          enhancementResult={activePage.enhancementResult}
                          isEnhancing={isLoading.enhance}
                          cropBox={activePage.cropBox}
                          onCropBoxChange={handleCropBoxChange}
                          onCropBoxApply={() => handleCropBoxApply()}
                          onStraighten={handleStraighten}
                          isStraightening={isLoading.straighten}
                        />
                      </TabsContent>
                      <TabsContent value="ocr" className="mt-6">
                        <OcrResults
                          onOcr={handleSingleOcr}
                          ocrResult={activePage.ocrResult}
                          isOcring={isLoading.ocr}
                          onTranslate={handleTranslate}
                          isTranslating={isLoading.translate}
                          translationResult={activePage.translationResult}
                          onBulkOcr={handleBulkOcr}
                          pages={pages}
                          isBulkOcring={isLoading.ocr}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
