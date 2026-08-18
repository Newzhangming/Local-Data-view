'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { CustomerService } from '@/services/customer';
import { CustomerCreateReq } from '@/constants/customer';
import {
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  TagIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  UsersIcon,
  ShoppingBagIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

const customerService = new CustomerService();

// 等级选项
const LEVEL_OPTIONS = [
  { value: 'ONE', label: '⭐' },
  { value: 'TWO',  label: '⭐⭐' },
  { value: 'THREE', label: '⭐⭐⭐' },
  { value: 'FOUR',  label: '⭐⭐⭐⭐' },
  { value: 'FIVE',  label: '⭐⭐⭐⭐⭐' },
];

// 阶段建议列表
const STAGE_SUGGESTIONS = [
  '开发',
  '询盘',
  '深度联系',
  '成单',
];

// 回复状态选项
const REPLY_STATUS_OPTIONS = [
  { value: 'REPLIED', label: '有回复' },
  { value: 'NO_REPLY', label: '无回复' },
];

// 联系人表单字段类型
interface ContactFormData {
  name: string;
  title: string;
  phone: string;
  email: string;
  whatsapp: string;
  facebook: string;
  linkedin: string;
  department: string;
  is_primary: boolean;
  notes: string;
}

const defaultContact: ContactFormData = {
  name: '',
  title: '',
  phone: '',
  email: '',
  whatsapp: '',
  facebook: '',
  linkedin: '',
  department: '',
  is_primary: false,
  notes: '',
};

export default function CustomerCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CustomerCreateReq & { parent_name?: string; reply_status?: 'REPLIED' | 'NO_REPLY' }>({
    name: '',
    contact_person: '',
    contact_title: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    follow_up_date: '',
    email: '',
    website: '',
    salesperson_name: '',
    main_products: '',
    address_line1: '',
    city: '',
    postal_code: '',
    country: '',
    level: 'THREE',
    stage: '',
    reply_status: 'NO_REPLY',
    source: '',
    remark: '',
    language: 'en',
    parent_id: null,
    parent_name: '',
  });

  // 联系人列表（暂存）
  const [contacts, setContacts] = useState<ContactFormData[]>([]);

  // 联系人模态框
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormData>({ ...defaultContact });

  // 主上级搜索相关
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // 额外上级相关状态
  const [extraParents, setExtraParents] = useState<any[]>([]);
  const [extraQuery, setExtraQuery] = useState('');
  const [extraSearchResults, setExtraSearchResults] = useState<any[]>([]);
  const [extraSearching, setExtraSearching] = useState(false);
  const extraDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (extraDebounceTimer.current) clearTimeout(extraDebounceTimer.current);
    };
  }, []);

  const searchCustomers = useCallback(
    (keyword: string, setResults: Function, setSearching: Function) => {
      if (!keyword.trim()) {
        setResults([]);
        return;
      }
      setSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await customerService.queryCustomers({
            search: keyword.trim(),
            current: 1,
            pageSize: 10,
          });
          if (isMountedRef.current) {
            setResults(res.data || []);
          }
        } catch (error) {
          if (isMountedRef.current) {
            console.error('搜索客户失败', error);
            setResults([]);
          }
        } finally {
          if (isMountedRef.current) {
            setSearching(false);
          }
        }
      }, 300);
      return timer;
    },
    []
  );

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 额外上级操作
  const addExtraParent = (customer: any) => {
    if (!extraParents.some((p) => p.id === customer.id)) {
      setExtraParents((prev) => [...prev, customer]);
    }
    setExtraQuery('');
    setExtraSearchResults([]);
  };

  const removeExtraParent = (id: string) => {
    setExtraParents((prev) => prev.filter((p) => p.id !== id));
  };

  // 联系人操作
  const openContactModal = (index?: number) => {
    if (index !== undefined) {
      setEditingContactIndex(index);
      setContactForm({ ...contacts[index] });
    } else {
      setEditingContactIndex(null);
      setContactForm({ ...defaultContact });
    }
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setEditingContactIndex(null);
    setContactForm({ ...defaultContact });
  };

  const saveContact = () => {
    if (!contactForm.name.trim()) {
      alert('联系人姓名不能为空');
      return;
    }
    if (editingContactIndex !== null) {
      const newContacts = [...contacts];
      newContacts[editingContactIndex] = { ...contactForm };
      setContacts(newContacts);
    } else {
      setContacts((prev) => [...prev, { ...contactForm }]);
    }
    closeContactModal();
  };

  const deleteContact = (index: number) => {
    if (confirm('确定删除该联系人吗？')) {
      setContacts((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // 提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      alert('请填写客户名称');
      return;
    }

    const submitData = { ...form };
    if (submitData.parent_id === '' || submitData.parent_id === null) {
      delete submitData.parent_id;
    }
    if (!submitData.parent_name) {
      delete submitData.parent_name;
    }
    // 关键修复：将 follow_up_date 转换为 ISO 字符串以满足后端 Zod 校验
    if (submitData.follow_up_date) {
      submitData.follow_up_date = new Date(submitData.follow_up_date + 'T00:00:00.000Z').toISOString();
    } else {
      submitData.follow_up_date = null;
    }

    setSaving(true);
    try {
      // 1. 创建客户
      const res = await customerService.createCustomer(submitData);
      if (res.msg !== 'success' || !res.data?.id) {
        throw new Error(res.msg || '创建失败');
      }
      const newCustomerId = res.data.id;

      // 2. 添加额外上级关系
      for (const parent of extraParents) {
        await customerService.addRelation(parent.id, newCustomerId);
      }

      // 3. 创建联系人
      for (const contact of contacts) {
        await customerService.createContact({
          customer_id: newCustomerId,
          name: contact.name,
          title: contact.title,
          phone: contact.phone,
          email: contact.email,
          whatsapp: contact.whatsapp,
          facebook: contact.facebook,
          linkedin: contact.linkedin,
          department: contact.department,
          is_primary: contact.is_primary,
          notes: contact.notes || null,
          sort: 0,
        });
      }

      alert('客户创建成功！');
      router.push('/customer');
    } catch (error: any) {
      console.error('提交失败:', error);
      const msg =
        error?.response?.data?.msg ||
        error?.message ||
        '创建失败，请稍后重试';
      alert('新建失败：' + msg);
    } finally {
      setSaving(false);
    }
  };

  // 额外上级搜索防抖
  useEffect(() => {
    if (extraDebounceTimer.current) clearTimeout(extraDebounceTimer.current);
    if (!extraQuery.trim()) {
      setExtraSearchResults([]);
      return;
    }
    setExtraSearching(true);
    extraDebounceTimer.current = setTimeout(async () => {
      try {
        const res = await customerService.queryCustomers({
          search: extraQuery.trim(),
          current: 1,
          pageSize: 10,
        });
        if (isMountedRef.current) {
          setExtraSearchResults(res.data || []);
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error('搜索额外上级失败', error);
          setExtraSearchResults([]);
        }
      } finally {
        if (isMountedRef.current) {
          setExtraSearching(false);
        }
      }
    }, 300);
    return () => {
      if (extraDebounceTimer.current) clearTimeout(extraDebounceTimer.current);
    };
  }, [extraQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-xl font-semibold text-slate-700">新增客户</h1>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm disabled:opacity-50"
          >
            <CheckIcon className="w-5 h-5" />
            {saving ? '新建中...' : '新建'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            {/* 头部：客户名称 + 等级 + 阶段 + 回复状态 */}
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    客户名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                    placeholder="请输入客户名称"
                    required
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">等级</label>
                    <select
                      value={form.level || 'THREE'}
                      onChange={(e) => handleChange('level', e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-full text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {LEVEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">客户阶段</label>
                    <input
                      type="text"
                      value={form.stage || ''}
                      onChange={(e) => handleChange('stage', e.target.value)}
                      placeholder="如：潜在客户"
                      className="px-3 py-1.5 border border-slate-300 rounded-full text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 w-36"
                      list="stage-suggestions"
                    />
                    <datalist id="stage-suggestions">
                      {STAGE_SUGGESTIONS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">回复状态</label>
                    <select
                      value={form.reply_status || 'NO_REPLY'}
                      onChange={(e) => handleChange('reply_status', e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-full text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {REPLY_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 space-y-8">
              {/* 联系方式（包含所有社交账号） */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  联系方式
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField icon={<PhoneIcon className="w-5 h-5 text-slate-400" />} label="电话" value={form.phone || ''} onChange={(val) => handleChange('phone', val)} />
                  <FormField icon={<EnvelopeIcon className="w-5 h-5 text-slate-400" />} label="邮箱" value={form.email || ''} onChange={(val) => handleChange('email', val)} type="email" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<BriefcaseIcon className="w-5 h-5 text-slate-400" />} label="联系人" value={form.contact_person || ''} onChange={(val) => handleChange('contact_person', val)} />
                  <FormField icon={<BuildingOfficeIcon className="w-5 h-5 text-slate-400" />} label="联系人职位" value={form.contact_title || ''} onChange={(val) => handleChange('contact_title', val)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<PhoneIcon className="w-5 h-5 text-slate-400" />} label="WhatsApp" value={form.whatsapp || ''} onChange={(val) => handleChange('whatsapp', val)} placeholder="请输入WhatsApp" />
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="Facebook" value={form.facebook || ''} onChange={(val) => handleChange('facebook', val)} placeholder="Facebook 链接或账号" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="Instagram" value={form.instagram || ''} onChange={(val) => handleChange('instagram', val)} placeholder="Instagram 链接或账号" />
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="TikTok" value={form.tiktok || ''} onChange={(val) => handleChange('tiktok', val)} placeholder="TikTok 链接或账号" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="YouTube" value={form.youtube || ''} onChange={(val) => handleChange('youtube', val)} placeholder="YouTube 链接或账号" />
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="LinkedIn" value={form.linkedin || ''} onChange={(val) => handleChange('linkedin', val)} placeholder="LinkedIn 链接或账号" />
                </div>
              </section>

              {/* 业务信息 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  业务信息
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="网站" value={form.website || ''} onChange={(val) => handleChange('website', val)} />
                  {/* 修改点：主营产品改为多行文本 */}
                  <FormField
                    icon={<ShoppingBagIcon className="w-5 h-5 text-slate-400" />}
                    label="主营产品"
                    value={form.main_products || ''}
                    onChange={(val) => handleChange('main_products', val)}
                    multiline
                    rows={3}
                    placeholder="请输入主营产品"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<UsersIcon className="w-5 h-5 text-slate-400" />} label="业务员" value={form.salesperson_name || ''} onChange={(val) => handleChange('salesperson_name', val)} />
                </div>
              </section>

              {/* 地址 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  地址
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <FormField icon={<MapPinIcon className="w-5 h-5 text-slate-400" />} label="地址" value={form.address_line1 || ''} onChange={(val) => handleChange('address_line1', val)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField label="城市" value={form.city || ''} onChange={(val) => handleChange('city', val)} />
                  <FormField label="邮政编码" value={form.postal_code || ''} onChange={(val) => handleChange('postal_code', val)} />
                </div>
                <div className="mt-4">
                  <FormField label="国家" value={form.country || ''} onChange={(val) => handleChange('country', val)} />
                </div>
              </section>

              {/* 客户层级 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  客户层级
                </h2>
                
                {/* 主上级选择 */}
                <div className="flex items-center gap-3 mb-6">
                  <UsersIcon className="w-5 h-5 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      主上级客户（名称搜索）
                    </label>
                    <Combobox
                      value={selectedCustomer}
                      onChange={(customer) => {
                        setSelectedCustomer(customer);
                        if (customer) {
                          handleChange('parent_id', customer.id);
                          handleChange('parent_name', customer.name);
                        } else {
                          handleChange('parent_id', null);
                          handleChange('parent_name', '');
                        }
                      }}
                    >
                      <div className="relative">
                        <ComboboxInput
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                          placeholder="输入客户名称搜索"
                          onChange={(e) => {
                            const value = e.target.value;
                            setQuery(value);
                            if (debounceTimer.current) clearTimeout(debounceTimer.current);
                            debounceTimer.current = searchCustomers(value, setSearchResults, setIsSearching);
                          }}
                          displayValue={(customer: any) => customer?.name || ''}
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
                        </ComboboxButton>
                        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {isSearching && <div className="px-3 py-2 text-sm text-slate-500">搜索中...</div>}
                          {!isSearching && searchResults.length === 0 && query.trim() !== '' && (
                            <div className="px-3 py-2 text-sm text-slate-500">未找到匹配客户</div>
                          )}
                          {searchResults.map((customer) => (
                            <ComboboxOption
                              key={customer.id}
                              value={customer}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                  active ? 'bg-blue-50 text-blue-900' : 'text-slate-700'
                                }`
                              }
                            >
                              {({ active, selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                    {customer.name}
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                                      <CheckIcon className="h-5 w-5" />
                                    </span>
                                  )}
                                </>
                              )}
                            </ComboboxOption>
                          ))}
                        </ComboboxOptions>
                      </div>
                    </Combobox>
                    {selectedCustomer && (
                      <div className="mt-1 text-sm text-slate-500">
                        已选：{selectedCustomer.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* 额外上级选择 */}
                <div className="flex items-start gap-3">
                  <UsersIcon className="w-5 h-5 text-slate-400 mt-2" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      额外上级（可多选）
                    </label>
                    
                    {extraParents.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {extraParents.map((parent) => (
                          <span key={parent.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            {parent.name}
                            <button
                              type="button"
                              onClick={() => removeExtraParent(parent.id)}
                              className="text-blue-400 hover:text-blue-600"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="relative">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={extraQuery}
                          onChange={(e) => setExtraQuery(e.target.value)}
                          placeholder="搜索并添加额外上级"
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setExtraQuery('')}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm"
                        >
                          清空
                        </button>
                      </div>
                      {extraQuery.trim() && (
                        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                          {extraSearching && <div className="px-3 py-2 text-sm text-slate-500">搜索中...</div>}
                          {!extraSearching && extraSearchResults.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500">无匹配结果</div>
                          )}
                          {extraSearchResults.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => addExtraParent(customer)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-slate-700 flex justify-between items-center"
                            >
                              <span>{customer.name}</span>
                              <PlusIcon className="w-4 h-4 text-blue-500" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* 联系人管理 */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    联系人
                  </h2>
                  <button
                    type="button"
                    onClick={() => openContactModal()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition shadow-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    添加联系人
                  </button>
                </div>

                {contacts.length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    暂无联系人，点击上方按钮添加
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider max-w-[120px] truncate">姓名</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider max-w-[100px] truncate">职位</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider max-w-[60px]">主要</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider max-w-[120px] truncate">Facebook</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider max-w-[120px] truncate">LinkedIn</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-24">操作</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {contacts.map((contact, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors duration-150">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800 max-w-[120px] truncate">{contact.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 max-w-[100px] truncate">{contact.title || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {contact.is_primary ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">是</span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 max-w-[120px] truncate">
                              {contact.facebook ? (
                                <a href={contact.facebook.startsWith('http') ? contact.facebook : `https://${contact.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
                                  {contact.facebook}
                                </a>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 max-w-[120px] truncate">
                              {contact.linkedin ? (
                                <a href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
                                  {contact.linkedin}
                                </a>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm w-24">
                              <button
                                type="button"
                                onClick={() => openContactModal(index)}
                                className="text-blue-600 hover:text-blue-800 transition mr-2"
                                title="编辑"
                              >
                                <PencilIcon className="w-4 h-4 inline" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteContact(index)}
                                className="text-red-500 hover:text-red-700 transition"
                                title="删除"
                              >
                                <TrashIcon className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* 其他信息（含跟进时间） */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  其他信息
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField icon={<TagIcon className="w-5 h-5 text-slate-400" />} label="客户来源" value={form.source || ''} onChange={(val) => handleChange('source', val)} />
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="语言偏好" value={form.language || ''} onChange={(val) => handleChange('language', val)} />
                </div>
                {/* 跟进时间 */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">跟进时间</label>
                  <input
                    type="date"
                    value={form.follow_up_date || ''}
                    onChange={(e) => handleChange('follow_up_date', e.target.value)}
                    onKeyDown={(e) => e.preventDefault()}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                  />
                </div>
                <div className="mt-4">
                  <FormField label="备注" value={form.remark || ''} onChange={(val) => handleChange('remark', val)} multiline />
                </div>
              </section>
            </div>

            {/* 底部按钮 */}
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
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    新建中...
                  </>
                ) : (
                  '新建'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 联系人模态框 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingContactIndex !== null ? '编辑联系人' : '新增联系人'}
              </h3>
              <button
                type="button"
                onClick={closeContactModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="姓名 *"
                  value={contactForm.name}
                  onChange={(val) => setContactForm((prev) => ({ ...prev, name: val }))}
                  required
                />
                <FormField
                  label="职位"
                  value={contactForm.title}
                  onChange={(val) => setContactForm((prev) => ({ ...prev, title: val }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="电话"
                  value={contactForm.phone}
                  onChange={(val) => setContactForm((prev) => ({ ...prev, phone: val }))}
                />
                <FormField
                  label="邮箱"
                  value={contactForm.email}
                  onChange={(val) => setContactForm((prev) => ({ ...prev, email: val }))}
                  type="email"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="WhatsApp"
                  value={contactForm.whatsapp}
                  onChange={(val) => setContactForm((prev) => ({ ...prev, whatsapp: val }))}
                />
                <FormField
                  label="部门"
                  value={contactForm.department}
                  onChange={(val) => setContactForm((prev) => ({ ...prev, department: val }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Facebook"
                  value={contactForm.facebook}
                  onChange={(val) => setContactForm((prev) => ({ ...prev, facebook: val }))}
                />
                <FormField
                  label="LinkedIn"
                  value={contactForm.linkedin}
                  onChange={(val) => setContactForm((prev) => ({ ...prev, linkedin: val }))}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={contactForm.is_primary}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, is_primary: e.target.checked }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  设置为主要联系人
                </label>
              </div>
              <div>
                <FormField
                  label="备注"
                  value={contactForm.notes}
                  onChange={(val) => setContactForm((prev) => ({ ...prev, notes: val }))}
                  multiline
                  rows={2}
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeContactModal}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveContact}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingContactIndex !== null ? '更新' : '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// FormField 组件
function FormField({
  icon,
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  placeholder,
  rows = 3,
  required = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number | null;
  onChange: (val: string) => void;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  const displayValue = value ?? '';
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {multiline ? (
          <textarea
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
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
            required={required}
          />
        )}
      </div>
    </div>
  );
}