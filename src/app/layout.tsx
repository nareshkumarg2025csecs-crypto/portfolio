import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", style: ['normal', 'italic'] });
const montenegrin = localFont({ 
  src: "../assets/fonts/MontenegrinGothicOne-Regular.ttf",
  variable: "--font-montenegrin"
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${fraunces.variable} ${montenegrin.variable} selection:bg-rust selection:text-cream overflow-x-hidden`}>
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  );
}
