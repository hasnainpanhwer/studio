'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Loader2, BookOpen, Settings, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/page-edge/Header';
import { UploadPanel } from '@/components/page-edge/UploadPanel';
import { ImagePreview } from '@/components/page-edge/ImagePreview';
import { ProcessingTools } from '@/components/page-edge/ProcessingTools';
import { OcrResults } from '@/components/page-edge/OcrResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { enhanceScan, extractTextFromImage } from '@/app/actions';
import type { EnhancementResult, OcrResult, CropBox } from '@/lib/types';

export default function PageEdgeHome() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [isLoading, setIsLoading] = useState({ ocr: false, enhance: false });
  const [cropBox, setCropBox] = useState<CropBox>({ top: 10, right: 10, bottom: 10, left: 10 });
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageDataUri(e.target?.result as string);
      setOcrResult(null);
      setEnhancementResult(null);
      setCropBox({ top: 10, right: 10, bottom: 10, left: 10 });
    };
    reader.readAsDataURL(file);
  };
  
  const handleEnhance = async () => {
    if (!imageDataUri) return;
    setIsLoading(prev => ({ ...prev, enhance: true }));
    setEnhancementResult(null);
    const result = await enhanceScan(imageDataUri);
    if (result.success) {
      setEnhancementResult(result.data);
      setCropBox(prev => ({
        ...prev,
        left: result.data.estimatedBorderThickness,
        right: result.data.estimatedBorderThickness,
        top: result.data.estimatedBorderThickness,
        bottom: result.data.estimatedBorderThickness,
      }))
    } else {
      toast({
        variant: 'destructive',
        title: 'Enhancement Failed',
        description: result.error,
      });
    }
    setIsLoading(prev => ({ ...prev, enhance: false }));
  };

  const handleOcr = async () => {
    if (!imageDataUri) return;
    setIsLoading(prev => ({ ...prev, ocr: true }));
    setOcrResult(null);
    const result = await extractTextFromImage(imageDataUri);
    if (result.success) {
      setOcrResult(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'OCR Failed',
        description: result.error,
      });
    }
    setIsLoading(prev => ({ ...prev, ocr: false }));
  };

  const handleCropBoxApply = (newCropBox: CropBox) => {
    setCropBox(newCropBox);
    toast({
      title: 'Adjustments Applied',
      description: 'The manual crop adjustments have been applied to the preview.',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 flex flex-col gap-8">
            {imageDataUri ? (
              <ImagePreview imageDataUri={imageDataUri} onNewImage={() => setImageDataUri(null)} cropBox={cropBox} />
            ) : (
              <UploadPanel onImageUpload={handleImageUpload} />
            )}
          </div>

          <div className="lg:col-span-2">
            {imageDataUri && (
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
                        enhancementResult={enhancementResult}
                        isEnhancing={isLoading.enhance}
                        cropBox={cropBox}
                        onCropBoxApply={handleCropBoxApply}
                      />
                    </TabsContent>
                    <TabsContent value="ocr" className="mt-6">
                      <OcrResults
                        onOcr={handleOcr}
                        ocrResult={ocrResult}
                        isOcring={isLoading.ocr}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
