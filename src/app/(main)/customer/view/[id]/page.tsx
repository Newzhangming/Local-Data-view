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
  PencilIcon,
} from '@heroicons/react/24/outline';

const customerService = new CustomerService();

// 等级显示映射
const levelDisplayMap: Record<string, { label: string; className: string }> = {
  THREE: { label: '⭐⭐⭐', className: 'bg-yellow-100 text-yellow-800' },
  FOUR:  { label: '⭐⭐⭐⭐', className: 'bg-blue-100 text-blue-800' },
  FIVE:  { label: '⭐⭐⭐⭐⭐', className: 'bg-green-100 text-green-800' },
};

// 客户阶段显示映射（支持中文和旧枚举值）
const stageDisplayMap: Record<string, { label: string; className: string }> = {
  // 预设中文阶段
  '潜在客户': { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
  '已联系':   { label: '已联系', className: 'bg-blue-100 text-blue-700' },
  '合格意向': { label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
  '已报价':   { label: '已报价', className: 'bg-orange-100 text-orange-700' },
  '谈判中':   { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
  '成交':     { label: '成交', className: 'bg-green-100 text-green-700' },
  '丢失':     { label: '丢失', className: 'bg-red-100 text-red-700' },
  // 兼容旧枚举值
  'LEAD':     { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
  'CONTACTED':{ label: '已联系', className: 'bg-blue-100 text-blue-700' },
  'QUALIFIED':{ label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
  'QUOTED':   { label: '已报价', className: 'bg-orange-100 text-orange-700' },
  'NEGOTIATING': { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
  'WON':      { label: '成交', className: 'bg-green-100 text-green-700' },
  'LOST':     { label: '丢失', className: 'bg-red-100 text-red-700' },
};

// 层级文本映射
const tierMap: Record<number, string> = {
  1: '一级（大客户）',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
  6: '六级',
  7: '七级',
  8: '八级',
  9: '九级',
  10: '十级',
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

  const handleEdit = () => {
    if (customer?.id) {
      router.push(`/customer/edit/${customer.id}`);
    }
  };

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

  // 获取等级显示信息
  const levelInfo = levelDisplayMap[customer.level] || {
    label: customer.level || '未设置',
    className: 'bg-gray-100 text-gray-600',
  };

  // 获取阶段显示信息：优先使用映射，若无匹配则显示原文+默认样式
  const stageInfo = customer.stage
    ? (stageDisplayMap[customer.stage] || { label: customer.stage, className: 'bg-gray-100 text-gray-600' })
    : null;

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
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
            >
              <PencilIcon className="w-5 h-5" />
              编辑
            </button>
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
                {/* 等级标签 */}
                {customer.level && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelInfo.className}`}>
                    {levelInfo.label}
                  </span>
                )}
                {/* 阶段标签 */}
                {stageInfo && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageInfo.className}`}>
                    {stageInfo.label}
                  </span>
                )}
                {/* 层级标签 */}
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
            {/* 联系方式 —— 新增 WhatsApp 字段 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                联系方式
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={<PhoneIcon className="w-5 h-5 text-slate-400" />} label="电话" value={customer.phone} />
                <InfoItem icon={<PhoneIcon className="w-5 h-5 text-slate-400" />} label="WhatsApp" value={customer.whatsapp} />
                <InfoItem icon={<EnvelopeIcon className="w-5 h-5 text-slate-400" />} label="邮箱" value={customer.email} />
                <InfoItem icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="网站" value={customer.website} isLink />
                <InfoItem icon={<UserGroupIcon className="w-5 h-5 text-slate-400" />} label="业务员" value={customer.salesperson_name} />
                <InfoItem icon={<LinkIcon className="w-5 h-5 text-slate-400" />} label="Facebook" value={customer.facebook} isLink />
                <InfoItem icon={<LinkIcon className="w-5 h-5 text-slate-400" />} label="Linkedin" value={customer.linkedin} isLink />
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

// 信息条目组件（增加 isLink 属性）
function InfoItem({
  icon,
  label,
  value,
  multiline = false,
  isLink = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | number | null;
  multiline?: boolean;
  isLink?: boolean;
}) {
  const display = value ?? '—';

  // 如果是链接且值有效，渲染为超链接
  if (isLink && value && typeof value === 'string' && value.trim() !== '') {
    const href = value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
    return (
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1 flex-shrink-0">{icon}</div>}
        <div className="flex-1 min-w-0">
          <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</dt>
          <dd className="mt-1 text-sm">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate block"
            >
              {display}
            </a>
          </dd>
        </div>
      </div>
    );
  }

  // 否则按普通文本渲染
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