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
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const customerService = new CustomerService();

// 等级显示映射
const levelDisplayMap: Record<string, { label: string; className: string }> = {
  ONE:   { label: '⭐',   className: 'bg-gray-100 text-gray-600' },   
  TWO:   { label: '⭐⭐',  className: 'bg-cyan-100 text-cyan-700' },
  THREE: { label: '⭐⭐⭐', className: 'bg-yellow-100 text-yellow-800' },
  FOUR: { label: '⭐⭐⭐⭐', className: 'bg-blue-100 text-blue-800' },
  FIVE: { label: '⭐⭐⭐⭐⭐', className: 'bg-green-100 text-green-800' },
};

// 客户阶段显示映射
const stageDisplayMap: Record<string, { label: string; className: string }> = {
  '潜在客户': { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
  '已联系': { label: '已联系', className: 'bg-blue-100 text-blue-700' },
  '合格意向': { label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
  '已报价': { label: '已报价', className: 'bg-orange-100 text-orange-700' },
  '谈判中': { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
  '成交': { label: '成交', className: 'bg-green-100 text-green-700' },
  '丢失': { label: '丢失', className: 'bg-red-100 text-red-700' },
   // ---------- 新增 ----------
  '开发': { label: '开发', className: 'bg-indigo-100 text-indigo-700' },
  '询盘': { label: '询盘', className: 'bg-pink-100 text-pink-700' },
  '深度联系': { label: '深度联系', className: 'bg-amber-100 text-amber-700' },
  '成单': { label: '成单', className: 'bg-green-100 text-green-700' },
  LEAD: { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
  CONTACTED: { label: '已联系', className: 'bg-blue-100 text-blue-700' },
  QUALIFIED: { label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
  QUOTED: { label: '已报价', className: 'bg-orange-100 text-orange-700' },
  NEGOTIATING: { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
  WON: { label: '成交', className: 'bg-green-100 text-green-700' },
  LOST: { label: '丢失', className: 'bg-red-100 text-red-700' },
};

// 回复状态显示映射
const replyStatusMap: Record<string, { label: string; className: string }> = {
  REPLIED: { label: '有回复', className: 'bg-green-100 text-green-800' },
  NO_REPLY: { label: '无回复', className: 'bg-gray-100 text-gray-600' },
};

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

export default function CustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [parents, setParents] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (idParam) {
      const fetchData = async () => {
        try {
          const [customerRes, parentsRes, childrenRes, contactsRes] = await Promise.all([
            customerService.queryCustomer({ id: idParam }),
            customerService.getParents(idParam),
            customerService.getChildren(idParam),
            customerService.getContacts(idParam),
          ]);

          if (customerRes.msg === 'success' && customerRes.data) {
            setCustomer(customerRes.data);
          } else {
            alert('未找到该客户');
            router.back();
            return;
          }

          if (parentsRes.msg === 'success') {
            setParents(parentsRes.data || []);
          }
          if (childrenRes.msg === 'success') {
            setChildren(childrenRes.data || []);
          }
          if (contactsRes.msg === 'success') {
            setContacts(contactsRes.data || []);
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

  const openContactModal = (contact: any) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedContact(null);
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

  const levelInfo = levelDisplayMap[customer.level] || {
    label: customer.level || '未设置',
    className: 'bg-gray-100 text-gray-600',
  };

  const stageInfo = customer.stage
    ? stageDisplayMap[customer.stage] || { label: customer.stage, className: 'bg-gray-100 text-gray-600' }
    : null;

  const replyStatusInfo = replyStatusMap[customer.reply_status] || {
    label: '无回复',
    className: 'bg-gray-100 text-gray-600',
  };

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

        {/* 主卡片：基本信息 */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-6">
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelInfo.className}`}>
                    {levelInfo.label}
                  </span>
                )}
                {stageInfo && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageInfo.className}`}>
                    {stageInfo.label}
                  </span>
                )}
                {customer.reply_status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${replyStatusInfo.className}`}>
                    {replyStatusInfo.label}
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

          <div className="px-8 py-6 space-y-8">
            {/* 联系方式 */}
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
                <InfoItem icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="Instagram" value={customer.instagram} isLink />
                <InfoItem icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="TikTok" value={customer.tiktok} isLink />
                <InfoItem icon={<GlobeAltIcon className="w-5 h-5 text-slate-400" />} label="YouTube" value={customer.youtube} isLink />
                <InfoItem icon={<LinkIcon className="w-5 h-5 text-slate-400" />} label="Linkedin" value={customer.linkedin} isLink />
              </div>
            </section>

            {/* 主营产品 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                主营产品
              </h2>
              <InfoItem label="主营产品" value={customer.main_products} multiline />
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
              {/* 跟进时间 */}
              <div className="mt-4">
                <InfoItem label="跟进时间" value={customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '-'} />
              </div>
              {customer.remark && (
                <div className="mt-4">
                  <InfoItem label="备注" value={customer.remark} multiline />
                </div>
              )}
            </section>
          </div>
        </div>

        {/* 上下级关系卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* 上级客户 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-purple-500" />
                上级客户 ({parents.length})
              </h2>
            </div>
            <div className="px-6 py-4">
              {parents.length === 0 ? (
                <p className="text-sm text-slate-400">暂无上级客户</p>
              ) : (
                <ul className="space-y-2">
                  {parents.map((parent: any) => (
                    <li key={parent.id}>
                      <button
                        onClick={() => router.push(`/customer/view/${parent.id}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition group"
                      >
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                          <span className="text-sm text-slate-700 group-hover:text-blue-600 truncate max-w-[150px]">
                            {parent.name}
                          </span>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 下级客户 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-green-500" />
                下级客户 ({children.length})
              </h2>
            </div>
            <div className="px-6 py-4">
              {children.length === 0 ? (
                <p className="text-sm text-slate-400">暂无下级客户</p>
              ) : (
                <ul className="space-y-2">
                  {children.map((child: any) => (
                    <li key={child.id}>
                      <button
                        onClick={() => router.push(`/customer/view/${child.id}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition group"
                      >
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                          <span className="text-sm text-slate-700 group-hover:text-blue-600 truncate max-w-[150px]">
                            {child.name}
                          </span>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 联系人 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-blue-500" />
                联系人 ({contacts.length})
              </h2>
            </div>
            <div className="px-6 py-4">
              {contacts.length === 0 ? (
                <p className="text-sm text-slate-400">暂无联系人</p>
              ) : (
                <div className="max-h-64 overflow-y-auto pr-2">
                  <ul className="space-y-2">
                    {contacts.map((contact: any) => (
                      <li key={contact.id}>
                        <button
                          onClick={() => openContactModal(contact)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <UserIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-slate-700 group-hover:text-blue-600 truncate max-w-[100px]">
                              {contact.name}
                            </span>
                            {contact.title && (
                              <span className="text-xs text-slate-400 truncate max-w-[80px]">
                                ({contact.title})
                              </span>
                            )}
                          </div>
                          <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 联系人详情弹窗 - 优化后布局 */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">联系人详情</h3>
              <button
                onClick={closeContactModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* 姓名 */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">姓名</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedContact.name}</p>
                </div>
                {/* 职位 */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">职位</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedContact.title || '-'}</p>
                </div>
                {/* 电话 */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">电话</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedContact.phone || '-'}</p>
                </div>
                {/* 邮箱 */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">邮箱</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedContact.email || '-'}</p>
                </div>
                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">WhatsApp</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedContact.whatsapp || '-'}</p>
                </div>
                {/* 部门 */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">部门</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedContact.department || '-'}</p>
                </div>
                {/* Facebook - 链接 */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Facebook</label>
                  {selectedContact.facebook ? (
                    <a
                      href={selectedContact.facebook.startsWith('http') ? selectedContact.facebook : `https://${selectedContact.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:underline block truncate"
                    >
                      {selectedContact.facebook}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-slate-700">-</p>
                  )}
                </div>
                {/* LinkedIn - 链接 */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">LinkedIn</label>
                  {selectedContact.linkedin ? (
                    <a
                      href={selectedContact.linkedin.startsWith('http') ? selectedContact.linkedin : `https://${selectedContact.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:underline block truncate"
                    >
                      {selectedContact.linkedin}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-slate-700">-</p>
                  )}
                </div>
                {/* 主要联系人 */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">主要联系人</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedContact.is_primary ? '是' : '否'}</p>
                </div>
                {/* 备注（占两列） */}
                {selectedContact.notes && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">备注</label>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{selectedContact.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={closeContactModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// InfoItem 组件
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