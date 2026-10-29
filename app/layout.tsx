import type { Metadata } from "next";
import { studio } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = { title: studio.name };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
