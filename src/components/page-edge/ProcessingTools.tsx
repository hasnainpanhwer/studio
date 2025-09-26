'use client';

import { useState } from 'react';
import { Wand2, Download, Loader2, Check, AlignHorizontalJustifyStart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { EnhancementResult, CropBox } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const DPI = 96;
const PX_PER_CM = DPI / 2.54;

const CONVERSIONS = {
  px: { to: (val: number) => val, from: (val: number) => val, max: 200, step: 1 },
  in: { to: (val: number) => val / DPI, from: (val: number) => val * DPI, max: 2, step: 0.1 },
  cm: { to: (val: number) => val / PX_PER_CM, from: (val: number) => val * PX_PER_CM, max: 5, step: 0.1 },
};

type Unit = keyof typeof CONVERSIONS;

export function ProcessingTools({ onEnhance, enhancementResult, isEnhancing, cropBox, onCropBoxChange, onCropBoxApply, onStraighten, isStraightening }: ProcessingToolsProps) {
  const { toast } = useToast();
  const [unit, setUnit] = useState<Unit>('px');

  const conversion = CONVERSIONS[unit];

  const handleSliderChange = (id: keyof CropBox) => (value: number[]) => {
    const pixelValue = conversion.from(value[0]);
    onCropBoxChange({ ...cropBox, [id]: pixelValue });
  };
  
  const handleUnitChange = (newUnit: Unit) => {
    setUnit(newUnit);
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
  
  const getConvertedValue = (pixelValue: number) => {
      return Number(conversion.to(pixelValue).toFixed(2));
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

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="manual-adjustments" className="border-b-0">
          <AccordionTrigger className="flex w-full items-center justify-between text-md font-medium hover:no-underline py-0">
            Manual Adjustments
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Units</p>
                <RadioGroup defaultValue="px" onValueChange={(val: Unit) => handleUnitChange(val)} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="px" id="r-px" />
                    <Label htmlFor="r-px">px</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in" id="r-in" />
                    <Label htmlFor="r-in">in</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cm" id="r-cm" />
                    <Label htmlFor="r-cm">cm</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className='flex justify-between'><Label htmlFor="crop-top">Crop Top</Label><span className="text-sm text-muted-foreground">{getConvertedValue(cropBox.top)} {unit}</span></div>
                  <Slider id="crop-top" value={[getConvertedValue(cropBox.top)]} onValueChange={handleSliderChange('top')} max={conversion.max} step={conversion.step} />
                </div>
                <div className="grid gap-2">
                  <div className='flex justify-between'><Label htmlFor="crop-bottom">Crop Bottom</Label><span className="text-sm text-muted-foreground">{getConvertedValue(cropBox.bottom)} {unit}</span></div>
                  <Slider id="crop-bottom" value={[getConvertedValue(cropBox.bottom)]} onValueChange={handleSliderChange('bottom')} max={conversion.max} step={conversion.step} />
                </div>
                <div className="grid gap-2">
                  <div className='flex justify-between'><Label htmlFor="crop-right">Crop Right</Label><span className="text-sm text-muted-foreground">{getConvertedValue(cropBox.right)} {unit}</span></div>
                  <Slider id="crop-right" value={[getConvertedValue(cropBox.right)]} onValueChange={handleSliderChange('right')} max={conversion.max} step={conversion.step} />
                </div>
                <div className="grid gap-2">
                  <div className='flex justify-between'><Label htmlFor="crop-left">Crop Left</Label><span className="text-sm text-muted-foreground">{getConvertedValue(cropBox.left)} {unit}</span></div>
                  <Slider id="crop-left" value={[getConvertedValue(cropBox.left)]} onValueChange={handleSliderChange('left')} max={conversion.max} step={conversion.step} />
                </div>
              </div>
              <Button onClick={handleApply} className="w-full">
                  <Check className="mr-2 h-4 w-4" />
                  Apply Adjustments
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Separator />

       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="export-options" className="border-b-0">
          <AccordionTrigger className="flex w-full items-center justify-between text-md font-medium hover:no-underline py-0">
            Export Options
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-4 pt-6">
              <Button variant="secondary" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export as JPG
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
