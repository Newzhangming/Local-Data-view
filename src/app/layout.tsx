import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { PropsWithChildren } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: '标旗建筑人才AI分析统计管理系统',
  description: ' 标旗建筑人才AI分析统计管理系统，联系微信：kenny_tian',
};

const archivo = localFont({ src: '../assets/fonts/Archivo.woff2', display: 'swap' });

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={archivo.className}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
