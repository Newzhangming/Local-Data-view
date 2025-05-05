'use client';

import { BgColorsOutlined, BuildOutlined, ContactsOutlined, SyncOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';

// 阿里 icons
// https://ant.design/components/icon

export default function Sidebar() {
  const pathname = usePathname();
  const menuItems = useMemo(() => {
    return [
      { href: '/task', icon: <SyncOutlined />, label: '采集任务' },
      { href: '/manager', icon: <UsergroupAddOutlined />, label: '项目经理' },
      { href: '/company', icon: <BgColorsOutlined />, label: '施工单位' },
      { href: '/project', icon: <BuildOutlined />, label: '工程项目' },
      // { href: '/condition', icon: <ContactsOutlined />, label: '用人要求' },
      { href: '/performance', icon: <ContactsOutlined />, label: '项目业绩' },
    ];
  }, []);

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
