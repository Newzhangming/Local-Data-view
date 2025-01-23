import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { PropsWithChildren } from 'react';

import './globals.css';

export const metadata: Metadata = { title: process.env.NEXT_PUBLIC_APP_NAME };

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
