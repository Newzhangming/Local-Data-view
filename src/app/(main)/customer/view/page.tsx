'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomerService } from '@/services/customer';
import { CustomerDto } from '@/constants/customer';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

const customerService = new CustomerService();

export default function CustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerDto | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await customerService.queryCustomer({ id });
        if (res.code === 0) setCustomer(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">客户不存在或已被删除</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 头部操作栏 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回</span>
          </button>
          <div className="flex-1" />
          <button
            onClick={() => router.push(`/customer/edit/${id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
          >
            <PencilIcon className="w-5 h-5" />
            编辑客户
          </button>
        </div>

        {/* 信息卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-800">客户详情</h1>
            <p className="text-sm text-gray-500 mt-1">基本信息与联系方式</p>
          </div>
          <div className="divide-y divide-gray-50">
            <InfoRow label="客户名称" value={customer.name} />
            <InfoRow label="联系人" value={customer.contact_person || '-'} />
            <InfoRow label="电话" value={customer.phone || '-'} />
            <InfoRow label="邮箱" value={customer.email || '-'} />
            <InfoRow label="地址" value={`${customer.address_line1} ${customer.address_line2 || ''}`.trim() || '-'} />
            <InfoRow label="城市" value={customer.city || '-'} />
            <InfoRow label="州/省" value={customer.state_province || '-'} />
            <InfoRow label="邮政编码" value={customer.postal_code || '-'} />
            <InfoRow label="国家" value={customer.country || '-'} />
            <InfoRow label="客户等级" value={customer.level} />
            <InfoRow label="状态" value={customer.status === 'active' ? '启用' : '停用'} />
            <InfoRow label="客户来源" value={customer.source || '-'} />
            <InfoRow label="备注" value={customer.remark || '-'} />
            <InfoRow label="语言偏好" value={customer.language || '-'} />
            <InfoRow label="时区" value={customer.timezone || '-'} />
            <InfoRow label="创建时间" value={new Date(customer.created_at).toLocaleString()} />
            <InfoRow label="更新时间" value={new Date(customer.updated_at).toLocaleString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-6 py-3 sm:flex sm:items-start">
      <dt className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">{label}</dt>
      <dd className="mt-1 text-sm text-gray-800 sm:mt-0">{value}</dd>
    </div>
  );
}