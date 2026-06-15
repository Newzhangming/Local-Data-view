'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomerService } from '@/services/customer';
import { CustomerCreateReq, CustomerDto } from '@/constants/customer';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

const customerService = new CustomerService();

export default function CustomerEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isNew = id === 'new';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CustomerCreateReq>({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    level: 'D',
    status: 'active',
    source: '',
    remark: '',
    language: 'en',
    timezone: 'UTC',
  });

  useEffect(() => {
    if (!isNew && id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await customerService.queryCustomer({ id });
          if (res.code === 0) setForm(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      alert('请填写客户名称');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await customerService.createCustomer(form);
      } else {
        await customerService.updateCustomer({ id, ...form });
      }
      router.push('/customer');
    } catch (error) {
      console.error(error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* 头部 */}
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
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm disabled:opacity-50"
          >
            <CheckIcon className="w-5 h-5" />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>

        {/* 表单卡片 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-800">{isNew ? '新增客户' : '编辑客户'}</h1>
            <p className="text-sm text-gray-500 mt-1">填写客户信息，带 <span className="text-red-500">*</span> 为必填</p>
          </div>
          <div className="p-6 space-y-5">
            <FormField label="客户名称" required>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="请输入客户名称"
              />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="联系人">
                <input name="contact_person" value={form.contact_person} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </FormField>
              <FormField label="电话">
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </FormField>
            </div>
            <FormField label="邮箱">
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </FormField>
            <FormField label="地址第一行">
              <input name="address_line1" value={form.address_line1} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </FormField>
            <FormField label="地址第二行">
              <input name="address_line2" value={form.address_line2 || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="城市">
                <input name="city" value={form.city} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </FormField>
              <FormField label="州/省">
                <input name="state_province" value={form.state_province} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="邮政编码">
                <input name="postal_code" value={form.postal_code} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </FormField>
              <FormField label="国家">
                <input name="country" value={form.country} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="客户等级">
                <select name="level" value={form.level} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="A">A级</option>
                  <option value="B">B级</option>
                  <option value="C">C级</option>
                  <option value="D">D级</option>
                </select>
              </FormField>
              <FormField label="状态">
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </select>
              </FormField>
            </div>
            <FormField label="客户来源">
              <input name="source" value={form.source} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </FormField>
            <FormField label="备注">
              <textarea name="remark" rows={3} value={form.remark || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="语言偏好">
                <input name="language" value={form.language} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </FormField>
              <FormField label="时区">
                <input name="timezone" value={form.timezone} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </FormField>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}