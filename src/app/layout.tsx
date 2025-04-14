import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "しゃべる葦原",
  description: "nakamuraitsukiの個人ブログです",
  openGraph: {
    title:"しゃべる葦原",
    description: "nakamuraitsukiの個人ブログです",
    url: "https://next-blog-project-one.vercel.app/",
    images: [
      {
        url: "https://next-blog-project-one.vercel.app/icon/favicon.png",
        width: 800,
        height: 600,
        alt: "ブログのイメージ",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Analytics/>
      </body>
    </html>
  );
}
