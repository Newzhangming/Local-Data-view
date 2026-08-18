'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
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
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

const customerService = new CustomerService();

const LEVEL_OPTIONS = [
  { value: 'ONE', label: '⭐' },
  { value: 'TWO',  label: '⭐⭐' },
  { value: 'THREE', label: '⭐⭐⭐' },
  { value: 'FOUR',  label: '⭐⭐⭐⭐' },
  { value: 'FIVE',  label: '⭐⭐⭐⭐⭐' },
];

const STAGE_SUGGESTIONS = [
  '开发',
  '询盘',
  '深度联系',
  '成单',
];

const REPLY_STATUS_OPTIONS = [
  { value: 'REPLIED', label: '有回复' },
  { value: 'NO_REPLY', label: '无回复' },
];

const tierMap: Record<number, string> = {
  1: '一级',
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

// 联系人表单类型
interface ContactFormData {
  id?: string;
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
    tier: 1,
  });

  // ---------- 联系人管理 ----------
  const [contacts, setContacts] = useState<ContactFormData[]>([]);
  const [originalContactsMap, setOriginalContactsMap] = useState<Map<string, ContactFormData>>(new Map());

  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormData>({ ...defaultContact });

  // ---------- 主上级 ----------
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // ---------- 额外上级 ----------
  const [extraParents, setExtraParents] = useState<{ id: string; name: string; relationId: string | null }[]>([]);
  const [extraQuery, setExtraQuery] = useState('');
  const [extraSearchResults, setExtraSearchResults] = useState<any[]>([]);
  const [extraSearching, setExtraSearching] = useState(false);
  const extraDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 控制主上级 Combobox 下拉展开
  const [isMainOpen, setIsMainOpen] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (extraDebounceTimer.current) clearTimeout(extraDebounceTimer.current);
      setIsMainOpen(false);
    };
  }, []);

  const searchCustomers = useCallback((keyword: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await customerService.queryCustomers({ search: keyword.trim(), current: 1, pageSize: 10 });
        if (isMountedRef.current) setSearchResults(res.data || []);
      } catch (error) {
        if (isMountedRef.current) console.error(error);
      } finally {
        if (isMountedRef.current) setIsSearching(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (extraDebounceTimer.current) clearTimeout(extraDebounceTimer.current);
    if (!extraQuery.trim()) {
      setExtraSearchResults([]);
      return;
    }
    setExtraSearching(true);
    extraDebounceTimer.current = setTimeout(async () => {
      try {
        const res = await customerService.queryCustomers({ search: extraQuery.trim(), current: 1, pageSize: 10 });
        if (isMountedRef.current) setExtraSearchResults(res.data || []);
      } catch (error) {
        if (isMountedRef.current) console.error(error);
      } finally {
        if (isMountedRef.current) setExtraSearching(false);
      }
    }, 300);
    return () => { if (extraDebounceTimer.current) clearTimeout(extraDebounceTimer.current); };
  }, [extraQuery]);

  // ---------- 加载客户数据 ----------
  useEffect(() => {
    if (!id) { alert('缺少客户ID'); router.back(); return; }
    const fetchData = async () => {
      try {
        const res = await customerService.queryCustomer({ id });
        if (res.msg === 'success' && res.data) {
          const data = { ...res.data };
          if (data.follow_up_date) {
            data.follow_up_date = new Date(data.follow_up_date).toISOString().split('T')[0];
          }
          setFormData(data);
          if (data.parent_id) {
            try {
              const parentRes = await customerService.queryCustomer({ id: data.parent_id });
              if (parentRes.msg === 'success' && parentRes.data) {
                setSelectedCustomer({ id: parentRes.data.id, name: parentRes.data.name });
              }
            } catch (e) { /* ignore */ }
          }
          try {
            const parentsRes = await customerService.getParents(id);
            if (parentsRes.msg === 'success') {
              const allParents = parentsRes.data || [];
              const mainParentId = data.parent_id;
              const extras = allParents
                .filter((p: any) => p.id !== mainParentId)
                .map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  relationId: p.relationId,
                }));
              setExtraParents(extras);
            }
          } catch (e) { /* ignore */ }

          try {
            const contactsRes = await customerService.getContacts(id);
            if (contactsRes.msg === 'success') {
              const contactList = (contactsRes.data || []).map((c: any) => ({
                id: c.id,
                name: c.name,
                title: c.title,
                phone: c.phone,
                email: c.email,
                whatsapp: c.whatsapp,
                facebook: c.facebook,
                linkedin: c.linkedin,
                department: c.department,
                is_primary: c.is_primary,
                notes: c.notes || '',
              }));
              setContacts(contactList);
              const map = new Map();
              contactList.forEach((c: any) => map.set(c.id, { ...c }));
              setOriginalContactsMap(map);
            }
          } catch (e) { console.error('加载联系人失败', e); }
        } else {
          alert('未找到该客户');
          router.back();
        }
      } catch (error) {
        console.error(error);
        alert('加载客户数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // ---------- 额外上级操作 ----------
  const addExtraParent = (customer: any) => {
    if (!extraParents.some(p => p.id === customer.id)) {
      setExtraParents(prev => [...prev, { id: customer.id, name: customer.name, relationId: null }]);
    }
    setExtraQuery('');
    setExtraSearchResults([]);
  };

  const removeExtraParent = async (parentId: string) => {
    const target = extraParents.find(p => p.id === parentId);
    if (!target) return;
    if (target.relationId) {
      try {
        await customerService.removeRelation(target.relationId);
        setExtraParents(prev => prev.filter(p => p.id !== parentId));
      } catch (e) {
        console.error('删除额外上级失败', e);
        alert('删除额外上级失败');
      }
    } else {
      setExtraParents(prev => prev.filter(p => p.id !== parentId));
    }
  };

  // ---------- 联系人操作 ----------
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
      setContacts(prev => [...prev, { ...contactForm }]);
    }
    closeContactModal();
  };

  const deleteContact = (index: number) => {
    if (confirm('确定删除该联系人吗？')) {
      setContacts(prev => prev.filter((_, i) => i !== index));
    }
  };

  // ---------- 提交更新 ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return alert('缺少客户ID');
    if (!formData.name?.trim()) return alert('客户名称不能为空');

    const patchData: any = {};
    const fields = [
      'name', 'contact_person', 'contact_title', 'phone', 'whatsapp', 'facebook', 'linkedin',
      'instagram', 'tiktok', 'youtube', 'follow_up_date',
      'email', 'website', 'salesperson_name', 'main_products',
      'address_line1', 'city', 'postal_code', 'country',
      'level', 'stage', 'reply_status', 'source', 'remark', 'language', 'parent_id', 'parent_name'
    ];
    for (const key of fields) {
      if (formData[key] !== undefined) patchData[key] = formData[key];
    }
    if (patchData.parent_id === '' || patchData.parent_id === null || patchData.parent_id === undefined) {
      patchData.parent_id = null;
    }
    if (!patchData.parent_name) {
      patchData.parent_name = '';
    }

    // ========== 关键修复：仅日期字段需要特殊处理，其他字段清空即为空字符串 ==========
    // 文本字段（source、remark、stage 等）保持原样（空字符串即可，符合 Zod 定义）
    // 日期字段必须转为 ISO 字符串或 null
    if (patchData.follow_up_date) {
      patchData.follow_up_date = new Date(patchData.follow_up_date + 'T00:00:00.000Z').toISOString();
    } else {
      patchData.follow_up_date = null;   // 清空日期
    }
    // =====================================================================

    setSubmitting(true);
    try {
      const res = await customerService.patchCustomer({ id, ...patchData });
      if (res.msg !== 'success') {
        alert(res.msg || '更新失败');
        setSubmitting(false);
        return;
      }

      // 同步额外上级（新增）
      const newExtraParents = extraParents.filter(p => !p.relationId);
      for (const parent of newExtraParents) {
        await customerService.addRelation(parent.id, id!);
      }

      // 同步联系人变更
      const currentIds = new Set(contacts.map(c => c.id).filter(Boolean));
      const originalIds = new Set(originalContactsMap.keys());

      for (const origId of originalIds) {
        if (!currentIds.has(origId)) {
          await customerService.deleteContact(origId);
        }
      }

      for (const contact of contacts) {
        if (contact.id) {
          const updateData: any = { ...contact };
          delete updateData.id;
          await customerService.updateContact(contact.id, updateData);
        } else {
          const createData = {
            customer_id: id!,
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
          };
          await customerService.createContact(createData);
        }
      }

      alert('更新成功！');
      setIsMainOpen(false);
      router.push(`/customer/view/${id}`);
    } catch (error: any) {
      console.error(error);
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
            {/* 头部：客户名称 + 等级 + 阶段 + 回复状态 + 层级 */}
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
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">等级</label>
                    <select
                      value={formData.level || 'THREE'}
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
                      value={formData.stage || ''}
                      onChange={(e) => handleChange('stage', e.target.value)}
                      placeholder="如：潜在客户"
                      className="px-3 py-1.5 border border-slate-300 rounded-full text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 w-36"
                      list="stage-suggestions-edit"
                    />
                    <datalist id="stage-suggestions-edit">
                      {STAGE_SUGGESTIONS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">回复状态</label>
                    <select
                      value={formData.reply_status || 'NO_REPLY'}
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
                  <FormField icon={<PhoneIcon className="w-5 h-5 text-slate-400" />} label="电话" value={formData.phone || ''} onChange={(val) => handleChange('phone', val)} />
                  <FormField icon={<EnvelopeIcon className="w-5 h-5 text-slate-400" />} label="邮箱" value={formData.email || ''} onChange={(val) => handleChange('email', val)} type="email" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<BriefcaseIcon className="w-5 h-5 text-slate-400" />} label="联系人" value={formData.contact_person || ''} onChange={(val) => handleChange('contact_person', val)} />
                  <FormField icon={<BuildingOfficeIcon className="w-5 h-5 text-slate-400" />} label="联系人职位" value={formData.contact_title || ''} onChange={(val) => handleChange('contact_title', val)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<PhoneIcon className="w-5 h-5 text-slate-400" />} label="WhatsApp" value={formData.whatsapp || ''} onChange={(val) => handleChange('whatsapp', val)} />
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="Facebook" value={formData.facebook || ''} onChange={(val) => handleChange('facebook', val)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="Instagram" value={formData.instagram || ''} onChange={(val) => handleChange('instagram', val)} />
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="TikTok" value={formData.tiktok || ''} onChange={(val) => handleChange('tiktok', val)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="YouTube" value={formData.youtube || ''} onChange={(val) => handleChange('youtube', val)} />
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="LinkedIn" value={formData.linkedin || ''} onChange={(val) => handleChange('linkedin', val)} />
                </div>
              </section>

              {/* 业务信息 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  业务信息
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="网站" value={formData.website || ''} onChange={(val) => handleChange('website', val)} />
                  <FormField
                    icon={<ShoppingBagIcon className="w-5 h-5 text-slate-400" />}
                    label="主营产品"
                    value={formData.main_products || ''}
                    onChange={(val) => handleChange('main_products', val)}
                    multiline
                    rows={3}
                    placeholder="请输入主营产品"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField icon={<UsersIcon className="w-5 h-5 text-slate-400" />} label="业务员" value={formData.salesperson_name || ''} onChange={(val) => handleChange('salesperson_name', val)} />
                </div>
              </section>

              {/* 地址 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  地址
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <FormField icon={<MapPinIcon className="w-5 h-5 text-slate-400" />} label="地址" value={formData.address_line1 || ''} onChange={(val) => handleChange('address_line1', val)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField label="城市" value={formData.city || ''} onChange={(val) => handleChange('city', val)} />
                  <FormField label="邮政编码" value={formData.postal_code || ''} onChange={(val) => handleChange('postal_code', val)} />
                </div>
                <div className="mt-4">
                  <FormField label="国家" value={formData.country || ''} onChange={(val) => handleChange('country', val)} />
                </div>
              </section>

              {/* 客户层级 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  客户层级
                </h2>

                {/* 主上级 */}
                <div className="flex items-center gap-3 mb-6">
                  <LinkIcon className="w-5 h-5 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      主上级客户
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
                      open={isMainOpen}
                      onOpenChange={setIsMainOpen}
                    >
                      <div className="relative">
                        <ComboboxInput
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                          placeholder="输入客户名称搜索（可清空）"
                          onChange={(e) => {
                            const value = e.target.value;
                            setQuery(value);
                            searchCustomers(value);
                            if (!value.trim()) {
                              setSelectedCustomer(null);
                              handleChange('parent_id', null);
                              handleChange('parent_name', '');
                            }
                          }}
                          displayValue={(customer: any) => customer?.name || ''}
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
                        </ComboboxButton>
                        {selectedCustomer && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(null);
                              handleChange('parent_id', null);
                              handleChange('parent_name', '');
                              setQuery('');
                            }}
                            className="absolute inset-y-0 right-8 flex items-center pr-2 text-slate-400 hover:text-slate-600"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
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

                {/* 额外上级 */}
                <div className="flex items-start gap-3">
                  <UsersIcon className="w-5 h-5 text-slate-400 mt-2" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      额外上级（可多选，点击 × 删除）
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

                <div className="mt-2 text-sm text-slate-500">
                  当前层级：<span className="font-medium">{tierMap[formData.tier] || `第${formData.tier}级`}</span>
                  <span className="ml-2 text-xs text-slate-400">（由上级自动计算，不可手动修改）</span>
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
                          <tr key={contact.id || `new-${index}`} className="hover:bg-slate-50 transition-colors duration-150">
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

              {/* 其他信息 */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  其他信息
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField icon={<TagIcon className="w-5 h-5 text-slate-400" />} label="客户来源" value={formData.source || ''} onChange={(val) => handleChange('source', val)} />
                  <FormField icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="语言偏好" value={formData.language || ''} onChange={(val) => handleChange('language', val)} />
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">跟进时间</label>
                  <input
                    type="date"
                    value={formData.follow_up_date || ''}
                    onChange={(e) => handleChange('follow_up_date', e.target.value)}
                    onKeyDown={(e) => e.preventDefault()}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                  />
                </div>
                <div className="mt-4">
                  <FormField label="备注" value={formData.remark || ''} onChange={(val) => handleChange('remark', val)} multiline />
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
                    修改中...
                  </>
                ) : (
                  '修改'
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
                  onChange={(val) => setContactForm(prev => ({ ...prev, name: val }))}
                  required
                />
                <FormField
                  label="职位"
                  value={contactForm.title}
                  onChange={(val) => setContactForm(prev => ({ ...prev, title: val }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="电话"
                  value={contactForm.phone}
                  onChange={(val) => setContactForm(prev => ({ ...prev, phone: val }))}
                />
                <FormField
                  label="邮箱"
                  value={contactForm.email}
                  onChange={(val) => setContactForm(prev => ({ ...prev, email: val }))}
                  type="email"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="WhatsApp"
                  value={contactForm.whatsapp}
                  onChange={(val) => setContactForm(prev => ({ ...prev, whatsapp: val }))}
                />
                <FormField
                  label="部门"
                  value={contactForm.department}
                  onChange={(val) => setContactForm(prev => ({ ...prev, department: val }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Facebook"
                  value={contactForm.facebook}
                  onChange={(val) => setContactForm(prev => ({ ...prev, facebook: val }))}
                />
                <FormField
                  label="LinkedIn"
                  value={contactForm.linkedin}
                  onChange={(val) => setContactForm(prev => ({ ...prev, linkedin: val }))}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={contactForm.is_primary}
                    onChange={(e) => setContactForm(prev => ({ ...prev, is_primary: e.target.checked }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  设置为主要联系人
                </label>
              </div>
              <div>
                <FormField
                  label="备注"
                  value={contactForm.notes}
                  onChange={(val) => setContactForm(prev => ({ ...prev, notes: val }))}
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