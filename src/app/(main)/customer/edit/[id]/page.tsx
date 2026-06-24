'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomerService } from '@/services/customer';
import {
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  TagIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  LinkIcon,
  UsersIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const customerService = new CustomerService();

const LEVEL_OPTIONS = [
  { value: 'A', label: 'A级' },
  { value: 'B', label: 'B级' },
  { value: 'C', label: 'C级' },
  { value: 'D', label: 'D级' },
];

const tierMap: Record<number, string> = {
  1: '一级（大客户）',
  2: '二级',
  3: '三级',
};

export default function CustomerEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    contact_person: '',
    contact_title: '',
    phone: '',
    email: '',
    website: '',
    salesperson_name: '',
    facebook: '',
    linkedin: '',
    main_products: '',
    address_line1: '',
    city: '',
    postal_code: '',
    country: '',
    level: 'D',
    source: '',
    remark: '',
    language: 'en',
    parent_id: null,
    tier: 1,
  });

  useEffect(() => {
    if (!id) {
      alert('缺少客户ID');
      router.back();
      return;
    }

    const fetchData = async () => {
      try {
        const res = await customerService.queryCustomer({ id });
        if (res.msg === 'success' && res.data) {
          setFormData(res.data);
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
  }, [id, router]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      alert('缺少客户ID');
      return;
    }
    if (!formData.name?.trim()) {
      alert('客户名称不能为空');
      return;
    }

    const patchData: any = {};
    const fields = [
      'name', 'contact_person', 'contact_title', 'phone', 'email',
      'website', 'salesperson_name', 'facebook', 'linkedin', 'main_products',
      'address_line1', 'city', 'postal_code', 'country',
      'level', 'source', 'remark', 'language', 'parent_id'
    ];
    for (const key of fields) {
      if (formData[key] !== undefined) {
        patchData[key] = formData[key];
      }
    }
    if (patchData.parent_id === '') {
      patchData.parent_id = null;
    }

    setSubmitting(true);
    try {
      const res = await customerService.patchCustomer({ id, ...patchData });
      if (res.msg === 'success') {
        alert('更新成功！');
        router.push(`/customer/view/${id}`);
      } else {
        alert(res.msg || '更新失败');
      }
    } catch (error: any) {
      console.error('提交失败:', error);
      const msg = error?.response?.data?.msg || error?.message || '网络请求异常';
      alert('保存失败：' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">加载中...</div>
      </div>
    );
  }

  if (!formData.name && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-400">客户不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-xl font-semibold text-slate-700">编辑客户</h1>
          <div className="w-20" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    客户名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                    placeholder="请输入客户名称"
                    required
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={formData.level || 'D'}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-full text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {formData.tier && (
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                      {tierMap[formData.tier] || `第${formData.tier}级`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 space-y-8">
              {/* 联系方式 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  联系方式
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    icon={<PhoneIcon className="w-5 h-5 text-slate-400" />}
                    label="电话"
                    value={formData.phone || ''}
                    onChange={(val) => handleChange('phone', val)}
                  />
                  <FormField
                    icon={<EnvelopeIcon className="w-5 h-5 text-slate-400" />}
                    label="邮箱"
                    value={formData.email || ''}
                    onChange={(val) => handleChange('email', val)}
                    type="email"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField
                    icon={<BriefcaseIcon className="w-5 h-5 text-slate-400" />}
                    label="联系人"
                    value={formData.contact_person || ''}
                    onChange={(val) => handleChange('contact_person', val)}
                  />
                  <FormField
                    icon={<BuildingOfficeIcon className="w-5 h-5 text-slate-400" />}
                    label="联系人职位"
                    value={formData.contact_title || ''}
                    onChange={(val) => handleChange('contact_title', val)}
                  />
                </div>
              </section>

              {/* 业务信息 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  业务信息
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />}
                    label="网站"
                    value={formData.website || ''}
                    onChange={(val) => handleChange('website', val)}
                  />
                  <FormField
                    icon={<ShoppingBagIcon className="w-5 h-5 text-slate-400" />}
                    label="主营产品"
                    value={formData.main_products || ''}
                    onChange={(val) => handleChange('main_products', val)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <FormField
                    icon={<UsersIcon className="w-5 h-5 text-slate-400" />}
                    label="业务员"
                    value={formData.salesperson_name || ''}
                    onChange={(val) => handleChange('salesperson_name', val)}
                  />
                  <FormField
                    label="Facebook"
                    value={formData.facebook || ''}
                    onChange={(val) => handleChange('facebook', val)}
                  />
                  <FormField
                    label="LinkedIn"
                    value={formData.linkedin || ''}
                    onChange={(val) => handleChange('linkedin', val)}
                  />
                </div>
              </section>

              {/* 地址信息 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  地址
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    icon={<MapPinIcon className="w-5 h-5 text-slate-400" />}
                    label="地址"
                    value={formData.address_line1 || ''}
                    onChange={(val) => handleChange('address_line1', val)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField label="城市" value={formData.city || ''} onChange={(val) => handleChange('city', val)} />
                  <FormField label="邮政编码" value={formData.postal_code || ''} onChange={(val) => handleChange('postal_code', val)} />
                </div>
                <div className="mt-4">
                  <FormField label="国家" value={formData.country || ''} onChange={(val) => handleChange('country', val)} />
                </div>
              </section>

              {/* 层级管理 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  客户层级
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    icon={<LinkIcon className="w-5 h-5 text-slate-400" />}
                    label="上级客户ID（留空或填null为顶级）"
                    value={formData.parent_id || ''}
                    onChange={(val) => handleChange('parent_id', val)}
                    placeholder="输入已存在的客户ID"
                  />
                  <div className="text-sm text-slate-500">
                    当前层级：<span className="font-medium">{tierMap[formData.tier] || `第${formData.tier}级`}</span>
                    <span className="ml-2 text-xs text-slate-400">（由上级自动计算，不可手动修改）</span>
                  </div>
                </div>
              </section>

              {/* 其他信息 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  其他信息
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    icon={<TagIcon className="w-5 h-5 text-slate-400" />}
                    label="客户来源"
                    value={formData.source || ''}
                    onChange={(val) => handleChange('source', val)}
                  />
                  <FormField
                    icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />}
                    label="语言偏好"
                    value={formData.language || ''}
                    onChange={(val) => handleChange('language', val)}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    label="备注"
                    value={formData.remark || ''}
                    onChange={(val) => handleChange('remark', val)}
                    multiline
                  />
                </div>
              </section>
            </div>

            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  icon,
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  placeholder,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number | null;
  onChange: (val: string) => void;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const displayValue = value ?? '';
  return (
    <div className="flex items-center gap-3">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</label>
        {multiline ? (
          <textarea
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 resize-y"
            placeholder={placeholder || `请输入${label}`}
          />
        ) : (
          <input
            type={type}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
            placeholder={placeholder || `请输入${label}`}
          />
        )}
      </div>
    </div>
  );
}