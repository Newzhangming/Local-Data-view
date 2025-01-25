// 输入 rfc，回车

'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Popconfirm, theme } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import logo from '../img/logo.png';

import { removeStorage } from '@/utils/storage';

export default function NavBar() {
  const { token } = theme.useToken();
  const router = useRouter();
  const onLogout = () => {
    removeStorage('token');
    router.replace('/auth', { scroll: false });
  };

  return (
    <div className={'bg-primary dark:bg-slate-700 py-2 px-5 text-white flex justify-between items-center'}>
      <Link href={'/'}>
        <Image src={logo} alt={'武汉鱼在水出版社'} width={40} />
      </Link>
      <div className={'text-3xl'}>{process.env.NEXT_PUBLIC_APP_NAME}</div>
      <Popconfirm placement="bottomRight" title={'确定退出吗？'} okText="确定" cancelText="取消" onConfirm={onLogout}>
        <Avatar style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} />
      </Popconfirm>
    </div>
  );
}
