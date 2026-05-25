import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepPilot",
  description: "Create MCQ question papers, take self-evaluation tests, and review your results.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
