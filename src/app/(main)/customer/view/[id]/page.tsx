'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomerService } from '@/services/customer';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  TagIcon,
  LinkIcon,
  BriefcaseIcon,
  UsersIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const customerService = new CustomerService();

// 等级颜色映射
const levelColorMap: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-gray-100 text-gray-700',
};

// 层级文本映射
const tierMap: Record<number, string> = {
  1: '一级（大客户）',
  2: '二级',
  3: '三级',
};

export default function CustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    if (idParam) {
      const fetchData = async () => {
        try {
          const res = await customerService.queryCustomer({ id: params.id as string });
          if (res.msg === 'success' && res.data) {
            setCustomer(res.data);
          } else {
            alert('未找到该客户');
            router.back();
          }
        } catch (error) {
          console.error(error);
          alert('加载客户数据失败，请刷新重试');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      alert('缺少客户ID');
      router.back();
    }
  }, [idParam, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">加载中...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-400">客户不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 头部：返回 + 标题 + 操作 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回</span>
          </button>
          <div className="flex items-center gap-3">
            {/* 可在此处添加编辑按钮，如需编辑功能取消注释 */}
            {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
              编辑
            </button> */}
          </div>
        </div>

        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* 头部：客户名称 + 状态标签 */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
                  {customer.name || '未命名客户'}
                </h1>
                {customer.contact_person && (
                  <p className="text-slate-500 mt-1 flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    联系人：{customer.contact_person}
                  </p>
                )}
                {customer.contact_title && (
                  <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1">
                    <BriefcaseIcon className="w-4 h-4" />
                    职位：{customer.contact_title}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {customer.level && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelColorMap[customer.level] || 'bg-gray-100 text-gray-600'}`}>
                    {customer.level}级
                  </span>
                )}
                {customer.tier && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    {tierMap[customer.tier] || `第${customer.tier}级`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 内容区 */}
          <div className="px-8 py-6 space-y-8">
            {/* 联系方式 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                联系方式
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={<PhoneIcon className="w-5 h-5 text-slate-400" />} label="电话" value={customer.phone} />
                <InfoItem icon={<EnvelopeIcon className="w-5 h-5 text-slate-400" />} label="邮箱" value={customer.email} />
                <InfoItem icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="网站" value={customer.website} />
                <InfoItem icon={<UserGroupIcon className="w-5 h-5 text-slate-400" />} label="业务员" value={customer.salesperson_name} />
                <InfoItem icon={<LinkIcon className="w-5 h-5 text-slate-400" />} label="Facebook" value={customer.facebook} />
                <InfoItem icon={<LinkIcon className="w-5 h-5 text-slate-400" />} label="Linkedin" value={customer.linkedin} />
              </div>
            </section>

            {/* 主营产品 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                主营产品
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <InfoItem label="主营产品" value={customer.main_products} multiline />
              </div>
            </section>

            {/* 地址信息 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                地址
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={<MapPinIcon className="w-5 h-5 text-slate-400" />} label="地址" value={customer.address_line1} />
                <InfoItem label="城市" value={customer.city} />
                <InfoItem label="邮政编码" value={customer.postal_code} />
                <InfoItem label="国家" value={customer.country} />
              </div>
            </section>

            {/* 其他信息 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                其他信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={<TagIcon className="w-5 h-5 text-slate-400" />} label="客户来源" value={customer.source} />
                <InfoItem icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="语言偏好" value={customer.language} />
              </div>
              {customer.remark && (
                <div className="mt-4">
                  <InfoItem label="备注" value={customer.remark} multiline />
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// 信息条目组件
function InfoItem({
  icon,
  label,
  value,
  multiline = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}) {
  const display = value ?? '—';
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</dt>
        {multiline ? (
          <dd className="mt-1 text-sm text-slate-700 whitespace-pre-wrap break-words bg-slate-50 p-3 rounded-lg border border-slate-100">
            {display}
          </dd>
        ) : (
          <dd className="mt-1 text-sm text-slate-700 truncate">{display}</dd>
        )}
      </div>
    </div>
  );
}