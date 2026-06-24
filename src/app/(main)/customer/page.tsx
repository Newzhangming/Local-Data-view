'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerService } from '@/services/customer';
import { CustomerDto, CustomerListReq } from '@/constants/customer';
import { PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const customerService = new CustomerService();

export default function CustomerListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);

  const fetchCustomers = async (params: CustomerListReq) => {
    setLoading(true);
    try {
      const res = await customerService.queryCustomers(params);
      if (res.msg === 'success') {
        setCustomers(res.data);
        setTotal(res.total || 0);
      } else {
        console.error('获取列表失败', res.msg);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers({ current, pageSize, search: search.trim() || undefined });
  }, [current, search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除客户“${name}”吗？`)) return;
    try {
      const res = await customerService.deleteCustomer({ id });
      if (res.msg === 'success') {
        if (customers.length === 1 && current > 1) setCurrent(current - 1);
        else fetchCustomers({ current, pageSize, search: search.trim() || undefined });
      } else {
        alert(res.msg);
      }
    } catch (error) {
      console.error(error);
      alert('删除失败');
    }
  };

  // 层级文本映射
  const tierMap: Record<number, string> = {
    1: '一级（大客户）',
    2: '二级',
    3: '三级',
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">客户管理</h1>
          <button
            onClick={() => router.push('/customer/edit')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            新增客户
          </button>
        </div>

        {/* 搜索栏 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索客户名称、联系人、电话或邮箱..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrent(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* 表格卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">国家</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">等级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">层级</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">加载中...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{c.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.contact_person || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.country || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.level === 'A' ? 'bg-green-100 text-green-800' :
                          c.level === 'B' ? 'bg-blue-100 text-blue-800' :
                          c.level === 'C' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {c.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tierMap[c.tier] || `第${c.tier}级`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/customer/view/${c.id}`)}
                            className="text-gray-400 hover:text-blue-600 transition"
                            title="查看"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/customer/edit/${c.id}`)}
                            className="text-gray-400 hover:text-amber-600 transition"
                            title="编辑"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="text-gray-400 hover:text-red-600 transition"
                            title="删除"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                共 <span className="font-medium">{total}</span> 条记录
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrent((p) => Math.max(1, p - 1))}
                  disabled={current === 1}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  上一页
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  第 {current} / {totalPages} 页
                </span>
                <button
                  onClick={() => setCurrent((p) => Math.min(totalPages, p + 1))}
                  disabled={current === totalPages}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}