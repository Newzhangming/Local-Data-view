// 输入 rfc，回车

'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import logo from '../img/logo.png';

import { removeStorage } from '@/utils/storage';

export default function NavBar() {
  const onLogout = () => {
    removeStorage('token');
  };

  return (
    <div className={'bg-primary dark:bg-slate-700 py-2 px-5 text-white flex justify-between items-center'}>
      <Link href={'/'}>
        <Image src={logo} alt={'武汉鱼在水出版社'} width={40} />
      </Link>
      <div className={'text-3xl'}>{process.env.NEXT_PUBLIC_APP_NAME}</div>
    </div>
  );
}
