import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "스파오 크리에이터 카탈로그",
  description: "나만의 스파오 카탈로그를 확인해보세요!",
  openGraph: {
    title: "스파오 크리에이터 카탈로그",
    description: "나만의 스파오 카탈로그를 확인해보세요!",
    siteName: "SPAO Creator",
    locale: "ko_KR",
    type: "website",
  },
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
