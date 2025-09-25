'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { CropBox } from '@/lib/types';

interface ImagePreviewProps {
  imageDataUri: string;
  onNewImage: () => void;
  cropBox: CropBox;
}

export function ImagePreview({ imageDataUri, onNewImage, cropBox }: ImagePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">Image Preview</CardTitle>
                <CardDescription>This is the image you've uploaded.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onNewImage}>
                <RefreshCw className="mr-2 h-4 w-4" />
                New Image
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden border">
          <Image
            src={imageDataUri}
            alt="Uploaded page preview"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 60vw"
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
