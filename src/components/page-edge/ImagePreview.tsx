'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ImagePreviewProps {
  imageDataUri: string;
  onNewImage: () => void;
}

export function ImagePreview({ imageDataUri, onNewImage }: ImagePreviewProps) {
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
        </div>
      </CardContent>
    </Card>
  );
}
