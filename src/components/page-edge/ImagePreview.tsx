'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import type { CropBox } from '@/lib/types';

interface ImagePreviewProps {
  imageDataUri: string | null;
  cropBox: CropBox;
  onReset: () => void;
  originalImageAvailable: boolean;
}

export function ImagePreview({ imageDataUri, cropBox, onReset, originalImageAvailable }: ImagePreviewProps) {
  if (!imageDataUri) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center gap-4">
            <div>
                <CardTitle className="font-headline">Image Preview</CardTitle>
                <CardDescription>This is the currently selected page.</CardDescription>
            </div>
            <div className='flex gap-2'>
              {originalImageAvailable && (
                <Button variant="outline" size="sm" onClick={onReset}>
                  <Undo2 className="mr-2 h-4 w-4" />
                  Reset Page
                </Button>
              )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden border bg-gray-900/10">
          <Image
            src={imageDataUri}
            alt="Uploaded page preview"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 60vw"
            key={imageDataUri} // Force re-render on image change
          />
          <div
            className="absolute border-2 border-dashed border-destructive pointer-events-none"
            style={{
              top: `${cropBox.top}px`,
              right: `${cropBox.right}px`,
              bottom: `${cropBox.bottom}px`,
              left: `${cropBox.left}px`,
            }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}
