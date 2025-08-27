import type { Metadata } from "next";
import { sfPro, inter } from "./fonts";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Uplane",
  description: "Image Background Removal Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo_icon.png" />
      </head>
      <body className={cn(sfPro.variable, inter)}>
        {children}
      </body>
    </html>
  );
}
