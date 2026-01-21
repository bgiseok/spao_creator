import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPAO Linktree",
  description: "SPAO Creator Linktree Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
