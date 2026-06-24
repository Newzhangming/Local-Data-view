'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Popconfirm, theme } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import logo from '../img/logo.png';
import { removeStorage } from '@/utils/storage';

export default function NavBar() {
  const { token } = theme.useToken();

  const onLogout = () => {
    // 清除 localStorage
    removeStorage('token');
    
    // 清除 Cookie（与登录时设置保持完全一致）
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    // 若登录时添加了 Secure，请在此处也添加（仅当域名使用 HTTPS 时）
    // document.cookie = 'token=; path=/; max-age=0; SameSite=Lax; Secure';

    // 硬跳转到登录页，确保中间件重新读取 Cookie
    window.location.href = '/auth';
  };

  return (
    <div className={'bg-primary dark:bg-slate-700 py-2 px-5 text-white flex justify-between items-center'}>
      <Link href={'/'}>
        <Image src={logo} alt={'666'} width={40} />
      </Link>
      <div className={'text-3xl'}>{process.env.NEXT_PUBLIC_APP_NAME}</div>
      <Popconfirm placement="bottomRight" title={'确定退出吗？'} okText="确定" cancelText="取消" onConfirm={onLogout}>
        <Avatar style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} />
      </Popconfirm>
    </div>
  );
}