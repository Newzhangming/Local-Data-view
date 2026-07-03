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
import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = useMemo(() => {
    const items = [
      { href: '/customer', icon: <UsergroupAddOutlined />, label: '客户信息' },
      { href: '/customer/level', icon: <ContactsOutlined />, label: '客户信息思维导图' },
    ];
    if (isAdmin) {
      items.push(
        { href: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表板' },
        { href: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
        { href: '/admin/logs', icon: <FileTextOutlined />, label: '操作日志' }
      );
    }
    return items;
  }, [isAdmin]);

  // 关键：客户端未挂载时，渲染与服务端一致的占位（或返回 null）
  // 如果返回 null，需确保父组件能接受空内容，且不会导致布局闪烁。
  // 更稳妥：渲染一个固定占位菜单，但保持结构一致。
  if (!mounted) {
    // 返回与服务端相同的菜单（即 isAdmin 为 false 时的菜单）
    // 注意：这里不能使用 isAdmin，因为服务端 isAdmin 为 false，保持一致。
    return (
      <div className="flex flex-col h-full bg-white border-r px-4 py-6 gap-2 shadow-sm">
        <Link
          href="/customer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:text-blue-600"
        >
          <UsergroupAddOutlined />
          客户信息
        </Link>
        <Link
          href="/customer/level"
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:text-blue-600"
        >
          <ContactsOutlined />
          客户信息树状图
        </Link>
      </div>
    );
  }

  // 客户端挂载后，正常渲染带有 isAdmin 动态菜单
  return (
    <div className="flex flex-col h-full bg-white border-r px-4 py-6 gap-2 shadow-sm">
      {menuItems.map((item) => {
        const isActive = pathname === item.href; // 顺便修复精确匹配
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