'use client';

import { useState } from 'react';
import { Wand2, Download, Loader2, Check, AlignHorizontalJustifyStart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  px: { to: (val: number) => val, from: (val: number) => val },
  in: { to: (val: number) => val / DPI, from: (val: number) => val * DPI },
  cm: { to: (val: number) => val / PX_PER_CM, from: (val: number) => val * PX_PER_CM },
};

type Unit = keyof typeof CONVERSIONS;

export function ProcessingTools({ onEnhance, enhancementResult, isEnhancing, cropBox, onCropBoxChange, onCropBoxApply, onStraighten, isStraightening }: ProcessingToolsProps) {
  const { toast } = useToast();
  const [unit, setUnit] = useState<Unit>('px');

  const conversion = CONVERSIONS[unit];

  const handleInputChange = (id: keyof CropBox) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueInUnit = parseFloat(e.target.value);
    if (isNaN(valueInUnit)) {
      onCropBoxChange({ ...cropBox, [id]: 0 });
      return;
    };
    const pixelValue = conversion.from(valueInUnit);
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
      const val = conversion.to(pixelValue);
      // return a string with 2 decimal places if it's a float, otherwise return the integer
      return val % 1 !== 0 ? val.toFixed(2) : val.toString();
  }

  return (
    <div className="space-y-6">
       <Accordion type="single" collapsible className="w-full" defaultValue="ai-processing">
        <AccordionItem value="ai-processing" className="border-b-0">
          <AccordionTrigger className="flex w-full items-center justify-between text-md font-medium hover:no-underline py-0">
            AI Processing
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-6">
              <p className="text-sm text-muted-foreground">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="crop-top">Crop Top ({unit})</Label>
                  <Input id="crop-top" type="number" value={getConvertedValue(cropBox.top)} onChange={handleInputChange('top')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="crop-bottom">Crop Bottom ({unit})</Label>
                  <Input id="crop-bottom" type="number" value={getConvertedValue(cropBox.bottom)} onChange={handleInputChange('bottom')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="crop-left">Crop Left ({unit})</Label>
                  <Input id="crop-left" type="number" value={getConvertedValue(cropBox.left)} onChange={handleInputChange('left')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="crop-right">Crop Right ({unit})</Label>
                  <Input id="crop-right" type="number" value={getConvertedValue(cropBox.right)} onChange={handleInputChange('right')} />
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
