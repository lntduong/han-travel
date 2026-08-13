import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["vietnamese", "latin"],
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "Học Tiếng Trung Đài Loan",
  description: "Web lưu trữ các bài học tiếng Trung phồn thể của tôi",
};

// @ts-expect-error
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
