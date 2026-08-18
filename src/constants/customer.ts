// ========== 客户等级枚举（与后端 StarLevel 一致） ==========
export type DataLevel = 'ONE'|'TWO'|'THREE' | 'FOUR' | 'FIVE';

// ========== 客户阶段（自由文本，不再使用枚举限制） ==========
export const STAGE_SUGGESTIONS = [
  '潜在客户',
  '已联系',
  '合格意向',
  '已报价',
  '谈判中',
  '成交',
  '丢失'
] as const;
export type CustomerStage = string; // 自由文本

// ========== 回复状态 ==========
export type ReplyStatus = 'REPLIED' | 'NO_REPLY';

// ========== 客户列表查询参数 ==========
export interface CustomerListReq {
  search?: string;           // 搜索关键字
  country?: string;          // 国家筛选
  level?: DataLevel;         // 数据等级筛选
  stage?: string;            // 客户阶段（自由文本，精确匹配）
  whatsapp?: string;         // WhatsApp 号精确匹配
  reply_status?: ReplyStatus; // 回复状态筛选
  parentId?: string;         // 按上级客户ID筛选（精确匹配）
  tier?: number;             // 按层级筛选（1~10）
  current?: number;          // 当前页码
  pageSize?: number;         // 每页数量
  createdAtFrom?: string;    // 创建时间起
  createdAtTo?: string;      // 创建时间止
  updatedAtFrom?: string;    // 更新时间起
  updatedAtTo?: string;      // 更新时间止
  salesperson?: string;      // 业务员姓名
  // ---------- 新增社交媒体及跟进时间筛选 ----------
  instagram?: string;        // Instagram 精确匹配
  tiktok?: string;           // TikTok 精确匹配
  youtube?: string;          // YouTube 精确匹配
  follow_up_date_from?: string; // 跟进时间起
  follow_up_date_to?: string;   // 跟进时间止
}

// ========== 客户数据对象（完整响应） ==========
export interface CustomerDto {
  id: string;
  name: string;
  contact_person: string;
  contact_title: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  salesperson_name: string;
  facebook: string;
  linkedin: string;
  instagram: string;          // 新增
  tiktok: string;             // 新增
  youtube: string;            // 新增
  follow_up_date: string | null; // 新增，ISO 日期字符串或 null
  main_products: string;
  address_line1: string;
  city: string;
  postal_code: string;
  country: string;
  level: DataLevel;
  stage: string;
  reply_status: ReplyStatus;
  source: string;
  remark: string | null;
  language: string;
  // ---- 层级字段 ----
  parent_id: string | null;
  tier: number;
  // ---- 可选的关联对象 ----
  parent?: CustomerDto | null;
  children?: CustomerDto[];
  // ---- 可选的关联联系人 ----
  contacts?: CustomerContact[];
  // ---- 系统字段 ----
  sort: number;
  deleted: string;
  created_at: string;
  updated_at: string;
}

// ========== 创建客户参数 ==========
export interface CustomerCreateReq {
  name: string;
  contact_person?: string;
  contact_title?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  salesperson_name?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;        // 新增
  tiktok?: string;           // 新增
  youtube?: string;          // 新增
  follow_up_date?: string | null; // 新增，ISO 日期字符串或 null
  main_products?: string;
  address_line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  level?: DataLevel;
  stage?: string;
  reply_status?: ReplyStatus;
  source?: string;
  remark?: string | null;
  language?: string;
  parent_id?: string | null;
}

// ========== 更新客户参数（所有字段可选） ==========
export interface CustomerUpdateReq {
  name?: string;
  contact_person?: string;
  contact_title?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  salesperson_name?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;        // 新增
  tiktok?: string;           // 新增
  youtube?: string;          // 新增
  follow_up_date?: string | null; // 新增
  main_products?: string;
  address_line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  level?: DataLevel;
  stage?: string;
  reply_status?: ReplyStatus;
  source?: string;
  remark?: string | null;
  language?: string;
  parent_id?: string | null;
}

// ========== 部分更新参数 ==========
export type CustomerPatchReq = CustomerUpdateReq;

// ========== 联系人相关类型 ==========
export interface CustomerContact {
  id: string;
  customer_id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  whatsapp: string;
  facebook: string;
  linkedin: string;
  department: string;
  is_primary: boolean;
  notes: string | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

export type CustomerContactCreateReq = Omit<CustomerContact, 'id' | 'created_at' | 'updated_at'>;
export type CustomerContactUpdateReq = Partial<CustomerContactCreateReq>;

// ========== 通用响应结构 ==========
export interface BaseResp<T> {
  msg: string;
  data: T;
  total?: number;
}

// ========== 通用ID请求 ==========
export interface IdReq {
  id: string;
}

// ========== 前端展示用的常量（可选） ==========
export const LEVEL_OPTIONS: { value: DataLevel; label: string }[] = [
  { value: 'THREE', label: '⭐⭐⭐ (3星)' },
  { value: 'FOUR',  label: '⭐⭐⭐⭐ (4星)' },
  { value: 'FIVE',  label: '⭐⭐⭐⭐⭐ (5星)' },
];

export const LEVEL_DISPLAY: Record<DataLevel, { label: string; className: string }> = {
  THREE: { label: '⭐⭐⭐', className: 'bg-yellow-100 text-yellow-800' },
  FOUR:  { label: '⭐⭐⭐⭐', className: 'bg-blue-100 text-blue-800' },
  FIVE:  { label: '⭐⭐⭐⭐⭐', className: 'bg-green-100 text-green-800' },
};

// 阶段显示映射
export const STAGE_DISPLAY: Record<string, { label: string; className: string }> = {
  '潜在客户': { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
  '已联系':   { label: '已联系', className: 'bg-blue-100 text-blue-700' },
  '合格意向': { label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
  '已报价':   { label: '已报价', className: 'bg-orange-100 text-orange-700' },
  '谈判中':   { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
  '成交':     { label: '成交', className: 'bg-green-100 text-green-700' },
  '丢失':     { label: '丢失', className: 'bg-red-100 text-red-700' },
  'LEAD':     { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
  'CONTACTED':{ label: '已联系', className: 'bg-blue-100 text-blue-700' },
  'QUALIFIED':{ label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
  'QUOTED':   { label: '已报价', className: 'bg-orange-100 text-orange-700' },
  'NEGOTIATING': { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
  'WON':      { label: '成交', className: 'bg-green-100 text-green-700' },
  'LOST':     { label: '丢失', className: 'bg-red-100 text-red-700' },
};

// 回复状态显示映射
export const REPLY_STATUS_DISPLAY: Record<ReplyStatus, { label: string; className: string }> = {
  REPLIED:  { label: '已回复', className: 'bg-green-100 text-green-800' },
  NO_REPLY: { label: '无回复', className: 'bg-gray-100 text-gray-600' },
};