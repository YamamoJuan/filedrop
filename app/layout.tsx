import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FileDrop — Share files instantly",
  description: "Upload dan bagikan file dengan cepat. Tanpa login, tanpa ribet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen`}>{children}</body>
    </html>
  );
}
