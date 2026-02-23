import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DreamBlaster — Sleep Science Arcade",
  description:
    "Blast the correct answer clouds in this kinetic sleep science quiz game!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
