
import type { Metadata } from "next";
import { Inter, Literata } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const literata = Literata({ 
  subsets: ["latin"], 
  variable: "--font-literata",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PageEdge: OCR & Translation",
  description: "Scan and process book or magazine pages with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${literata.variable}`}>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
