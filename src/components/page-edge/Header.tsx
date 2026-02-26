import { BookOpen } from 'lucide-react';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-7xl items-center">
                <div className="flex items-center gap-3">
                    <BookOpen className="h-7 w-7 text-primary" />
                    <h1 className="text-xl font-bold font-headline tracking-tight sm:text-2xl">
                        PageEdge: OCR & Translation
                    </h1>
                </div>
            </div>
        </header>
    );
}
