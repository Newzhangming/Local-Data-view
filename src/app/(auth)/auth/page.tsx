'use client';

import { Suspense } from 'react';
import AuthContent from './AuthContent';

export default function AuthPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <AuthContent />
    </Suspense>
  );
}