// app/(main)/customer/top-level/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerService } from '@/services/customer';
import { CustomerDto } from '@/constants/customer';
import { BuildingOfficeIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const customerService = new CustomerService();

export default function TopLevelCustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);

  useEffect(() => {
    const fetchTopLevel = async () => {
      try {
        // top-level/page.tsx
        const res = await customerService.queryCustomers({ parentId: 'null' , pageSize: 100 });
        if (res.msg === 'success') {
          setCustomers(res.data);
        } else {
          console.error('获取大客户失败', res.msg);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopLevel();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">大客户</h1>
        {customers.length === 0 ? (
          <div className="text-gray-400 text-center py-12">暂无大客户</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => router.push(`/customer/tree/${customer.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
                      {customer.name}
                    </h3>
                    {customer.contact_person && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <UserIcon className="w-4 h-4" />
                        {customer.contact_person}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">一级</span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  {customer.phone && (
                    <p className="flex items-center gap-1">
                      <PhoneIcon className="w-4 h-4" /> {customer.phone}
                    </p>
                  )}
                  {customer.email && (
                    <p className="flex items-center gap-1">
                      <EnvelopeIcon className="w-4 h-4" /> {customer.email}
                    </p>
                  )}
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  查看下级 →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}