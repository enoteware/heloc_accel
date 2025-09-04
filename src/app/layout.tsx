import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${inter.className} bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="system" storageKey="heloc-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
