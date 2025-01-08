import type { Metadata } from "next";
import localFont from 'next/font/local';
import { ReactNode } from "react";

import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import StyledComponentsRegistry from "@/lib/antd-registry";

export const metadata: Metadata = {
  title: "标旗建筑人才AI分析统计管理系统",
  description: " 标旗建筑人才AI分析统计管理系统，联系微信：kenny_tian",
};

const archivo = localFont({ src: '../assets/fonts/Archivo.woff2', display: 'swap' });

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={archivo.className}>
        <StyledComponentsRegistry>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey={"dashboard-theme"}
          >
            {children}
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
