import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VIBECODING: From Idea to Reality | Risen Club - Ouael Elabdi",
  description:
    "Formulaire d'Inscription & d'Attentes : Vibecoding (Risen Club) animé par Ouael Elabdi le 01 Novembre 2026 à 17h.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020604",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme-step="1" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}