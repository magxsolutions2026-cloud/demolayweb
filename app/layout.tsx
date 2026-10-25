import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "T. De Leon Chapter No. 47 - Order of DeMolay",
  description: "Brotherhood. Leadership. Legacy. Join the T. De Leon Chapter No. 47 of the Order of DeMolay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("🚀 RootLayout loading... check this in Browser Console!");
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

