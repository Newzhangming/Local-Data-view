'use client';

import {
  ContactsOutlined,
  UsergroupAddOutlined,
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const menuItems = useMemo(() => {
    const items = [
      { href: '/customer', icon: <UsergroupAddOutlined />, label: '客户信息' },
      { href: '/customer/level', icon: <ContactsOutlined />, label: '客户信息树状图' },
    ];
    // 管理员专属菜单
    if (isAdmin) {
      items.push(
        { href: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表板' },
        { href: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
        { href: '/admin/logs', icon: <FileTextOutlined />, label: '操作日志' }
      );
    }
    return items;
  }, [isAdmin]);

  return (
    <div className="flex flex-col h-full bg-white border-r px-4 py-6 gap-2 shadow-sm">
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
              ${isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 hover:text-blue-600'}
            `}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}