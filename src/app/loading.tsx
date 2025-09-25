import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-lg font-headline">Loading PageEdge...</p>
    </div>
  );
}
