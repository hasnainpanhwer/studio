'use client';

import { useState } from 'react';
import { Wand2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { EnhancementResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ProcessingToolsProps {
  onEnhance: () => void;
  enhancementResult: EnhancementResult | null;
  isEnhancing: boolean;
}

export function ProcessingTools({ onEnhance, enhancementResult, isEnhancing }: ProcessingToolsProps) {
  const { toast } = useToast();
  const [sliderValues, setSliderValues] = useState({
    perspective: 0,
    shadow: 50,
    contrast: 50,
    margin: 10,
    border: 5,
  });

  const handleSliderChange = (id: keyof typeof sliderValues) => (value: number[]) => {
    setSliderValues(prev => ({ ...prev, [id]: value[0] }));
  };
  
  const handleExport = (format: string) => {
    toast({
        title: `Exporting ${format}`,
        description: `Your document is being prepared for export as a ${format} file.`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium mb-2">Automatic Edge Detection</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use AI to estimate border thickness and darkness to improve cropping.
        </p>
        <Button onClick={onEnhance} disabled={isEnhancing} className="w-full">
          {isEnhancing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Estimate Borders
        </Button>
        {enhancementResult && (
          <Alert className="mt-4">
            <Wand2 className="h-4 w-4" />
            <AlertTitle className="font-headline">AI Suggestions</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>{enhancementResult.enhancementSuggestions}</li>
                <li>Estimated Border Thickness: {enhancementResult.estimatedBorderThickness.toFixed(2)}px</li>
                <li>Estimated Border Darkness: {(enhancementResult.estimatedBorderDarkness * 100).toFixed(0)}%</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      <div className="space-y-6">
        <h3 className="text-md font-medium">Manual Adjustments</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="perspective">Perspective Correction</Label>
            <Slider id="perspective" value={[sliderValues.perspective]} onValueChange={handleSliderChange('perspective')} min={-20} max={20} step={1} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shadow">Shadow Removal</Label>
            <Slider id="shadow" value={[sliderValues.shadow]} onValueChange={handleSliderChange('shadow')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contrast">Contrast Enhancement</Label>
            <Slider id="contrast" value={[sliderValues.contrast]} onValueChange={handleSliderChange('contrast')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="margin">Margin Trim Strength</Label>
            <Slider id="margin" value={[sliderValues.margin]} onValueChange={handleSliderChange('margin')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="border">Custom Border Width</Label>
            <Slider id="border" value={[sliderValues.border]} onValueChange={handleSliderChange('border')} max={50} />
          </div>
        </div>
      </div>
      
      <Separator />

      <div>
        <h3 className="text-md font-medium mb-4">Export Options</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={() => handleExport('JPG')}>
            <Download className="mr-2 h-4 w-4" />
            Export as JPG
          </Button>
          <Button variant="secondary" onClick={() => handleExport('PDF')}>
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
