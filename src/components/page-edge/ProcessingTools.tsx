'use client';

import { useState, useEffect } from 'react';
import { Wand2, Download, Loader2, Check, AlignHorizontalJustifyStart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { EnhancementResult, CropBox } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ProcessingToolsProps {
  onEnhance: () => void;
  enhancementResult: EnhancementResult | null;
  isEnhancing: boolean;
  cropBox: CropBox;
  onCropBoxChange: (cropBox: CropBox) => void;
  onCropBoxApply: () => void;
  onStraighten: () => void;
  isStraightening: boolean;
}

export function ProcessingTools({ onEnhance, enhancementResult, isEnhancing, cropBox, onCropBoxChange, onCropBoxApply, onStraighten, isStraightening }: ProcessingToolsProps) {
  const { toast } = useToast();
  
  const handleSliderChange = (id: keyof CropBox) => (value: number[]) => {
    onCropBoxChange({ ...cropBox, [id]: value[0] });
  };
  
  const handleExport = () => {
    toast({
        title: `Exporting JPG`,
        description: `This feature is not yet implemented.`,
    });
  }

  const handleApply = () => {
    onCropBoxApply();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium mb-2">AI Processing</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use AI to automatically improve your scan.
        </p>
        <div className="grid grid-cols-2 gap-2">
            <Button onClick={onEnhance} disabled={isEnhancing} variant="outline">
              {isEnhancing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Estimate Borders
            </Button>
            <Button onClick={onStraighten} disabled={isStraightening}>
                {isStraightening ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <AlignHorizontalJustifyStart className="mr-2 h-4 w-4" />
                )}
                Straighten & Clean
            </Button>
        </div>
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
            <Label htmlFor="crop-top">Crop Top</Label>
            <Slider id="crop-top" value={[cropBox.top]} onValueChange={handleSliderChange('top')} max={200} step={1} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="crop-right">Crop Right</Label>
            <Slider id="crop-right" value={[cropBox.right]} onValueChange={handleSliderChange('right')} max={200} step={1} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="crop-bottom">Crop Bottom</Label>
            <Slider id="crop-bottom" value={[cropBox.bottom]} onValueChange={handleSliderChange('bottom')} max={200} step={1} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="crop-left">Crop Left</Label>
            <Slider id="crop-left" value={[cropBox.left]} onValueChange={handleSliderChange('left')} max={200} step={1} />
          </div>
        </div>
        <Button onClick={handleApply} className="w-full">
            <Check className="mr-2 h-4 w-4" />
            Apply Adjustments
        </Button>
      </div>
      
      <Separator />

      <div>
        <h3 className="text-md font-medium mb-4">Export Options</h3>
        <div className="grid grid-cols-1 gap-4">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export as JPG
          </Button>
        </div>
      </div>
    </div>
  );
}
