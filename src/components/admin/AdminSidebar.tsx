'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  DashboardOutlined, 
  UserOutlined, 
  FileTextOutlined,
  LogoutOutlined 
} from '@ant-design/icons';

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表板' },
    { href: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
    { href: '/admin/logs', icon: <FileTextOutlined />, label: '操作日志' },
  ];

  return (
    <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">管理后台</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 w-full"
        >
          <LogoutOutlined /> 退出登录
        </button>
      </div>
    </aside>
  );
}