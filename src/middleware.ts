import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');
  const isAuthPage = request.nextUrl.pathname === '/auth';

  // 未登录且不在登录页 -> 重定向到 /auth
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 已登录且访问登录页 -> 重定向到首页
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/customer', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};