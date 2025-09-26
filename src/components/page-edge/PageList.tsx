'use client';

import Image from 'next/image';
import { Plus, XCircle, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Page } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRef, type ChangeEvent } from 'react';
import { Input } from '../ui/input';

interface PageListProps {
  pages: Page[];
  activePageIndex: number | null;
  onSelectPage: (index: number) => void;
  onAddNewPage: () => void;
  onDeletePage: (index: number) => void;
  onImageUpload: (files: File[]) => void;
}

export function PageList({ pages, activePageIndex, onSelectPage, onAddNewPage, onDeletePage, onImageUpload }: PageListProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Prevent page selection when deleting
    onDeletePage(index);
  }

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      onImageUpload(Array.from(files));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };


  return (
    <aside className="w-32 bg-card border-r flex flex-col">
      <div className="p-2">
        <Button variant="outline" className="w-full h-auto flex-col py-2" onClick={handleClick}>
          <UploadCloud className="h-5 w-5 mb-1" />
          <span className="text-xs">Capture or</span>
          <span className="text-xs font-bold">Upload Pages</span>
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          multiple
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {pages.map((page, index) => (
            <div key={page.id} className="relative group">
              <button
                onClick={() => onSelectPage(index)}
                className={cn(
                  "w-full rounded-md border-2 p-1 transition-colors",
                  activePageIndex === index
                    ? "border-primary"
                    : "border-transparent hover:border-primary/50"
                )}
              >
                <div className="relative w-full aspect-[3/4] bg-muted overflow-hidden rounded-sm">
                  {page.imageDataUri && (
                    <Image
                      src={page.imageDataUri}
                      alt={`Page ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                      {index + 1}
                  </div>
                </div>
              </button>
              <button 
                onClick={(e) => handleDelete(e, index)}
                className="absolute -top-2 -right-2 z-10 hidden group-hover:block p-0 bg-background rounded-full"
                aria-label="Delete page"
              >
                <XCircle className="w-5 h-5 text-destructive hover:text-destructive/80" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
