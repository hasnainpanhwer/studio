'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

interface UploadPanelProps {
  onImageUpload: (files: File[]) => void;
  isInitialState: boolean;
}

export function UploadPanel({ onImageUpload, isInitialState }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const placeholder = PlaceHolderImages.find(p => p.id === 'upload-placeholder');

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      onImageUpload(Array.from(files));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  if (isInitialState) {
    return (
      <div
        className={cn(
          'relative group w-full aspect-[3/4] max-h-[80vh] rounded-lg border-2 border-dashed border-muted-foreground/50 transition-all duration-300 flex flex-col items-center justify-center text-center p-8 cursor-pointer overflow-hidden',
          isDragging ? 'border-primary bg-accent' : 'hover:border-primary hover:bg-accent/50'
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {placeholder && (
          <Image
            src={placeholder.imageUrl}
            alt={placeholder.description}
            fill
            className="object-cover opacity-10 group-hover:opacity-5 transition-opacity duration-300"
            data-ai-hint={placeholder.imageHint}
          />
        )}
        <div className="z-10 flex flex-col items-center gap-4 transition-transform duration-300 group-hover:scale-105">
          <UploadCloud className="w-16 h-16 text-muted-foreground group-hover:text-primary" />
          <h2 className="text-2xl font-bold font-headline text-foreground">
            Capture or Upload Pages
          </h2>
          <p className="text-muted-foreground">
            Drag & drop images here, or click to select files.
          </p>
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          multiple
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative group w-full aspect-[3/4] max-h-[80vh] rounded-lg border-2 border-dashed border-muted-foreground/50 transition-all duration-300 flex flex-col items-center justify-center text-center p-8'
      )}
    >
      <div className="z-10 flex flex-col items-center gap-4">
        <BookOpen className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold font-headline text-foreground">
          Select a Page
        </h2>
        <p className="text-muted-foreground">
          Choose a page from the left sidebar to start editing.
        </p>
      </div>
    </div>
  );
}
