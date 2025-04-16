import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Construction Assistant",
  description: "Get personalized recommendations for your DIY construction projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white">
        <main className="min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
} 