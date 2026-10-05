import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlickIDE | Mobile-First Browser IDE",
  description: "Touch-optimized smartphone IDE with IndexedDB file system and AI assistant",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlickIDE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#090d13",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-background text-neutral-100 overflow-x-hidden antialiased select-none">
        {children}
      </body>
    </html>
  );
}
