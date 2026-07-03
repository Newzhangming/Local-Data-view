// ========== 客户等级枚举（与后端 StarLevel 一致） ==========
export type DataLevel = 'THREE' | 'FOUR' | 'FIVE';

// ========== 客户阶段（自由文本，不再使用枚举限制） ==========
// 保留建议值常量供前端使用，但类型不再限制
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

// ========== 客户列表查询参数 ==========
export interface CustomerListReq {
  search?: string;           // 搜索关键字（name/contact_person/phone/email）
  country?: string;          // 国家筛选
  level?: DataLevel;         // 数据等级筛选
  stage?: string;            // 客户阶段（自由文本，精确匹配）
  whatsapp?: string;         // 新增：WhatsApp 号精确匹配
  parentId?: string;         // 按上级客户ID筛选（精确匹配）
  tier?: 1 | 2 | 3;          // 按层级筛选（1=大客户，2=二级，3=三级）
  current?: number;          // 当前页码，从1开始（对应后端 pageIndex）
  pageSize?: number;         // 每页数量
}

// ========== 客户数据对象（完整响应） ==========
export interface CustomerDto {
  id: string;
  name: string;
  contact_person: string;
  contact_title: string;
  phone: string;
  whatsapp: string;          // 新增
  email: string;
  website: string;
  salesperson_name: string;
  facebook: string;
  linkedin: string;
  main_products: string;
  address_line1: string;
  city: string;
  postal_code: string;
  country: string;
  level: DataLevel;          // 数据等级
  stage: string;             // 客户阶段（自由文本）
  source: string;
  remark: string | null;
  language: string;
  // ---- 层级字段 ----
  parent_id: string | null;
  tier: number;
  // ---- 可选的关联对象 ----
  parent?: CustomerDto | null;
  children?: CustomerDto[];
  // ---- 系统字段 ----
  sort: number;
  deleted: string;           // 'no' 或 'yes'
  created_at: string;
  updated_at: string;
}

// ========== 创建客户参数 ==========
export interface CustomerCreateReq {
  name: string;
  contact_person?: string;
  contact_title?: string;
  phone?: string;
  whatsapp?: string;         // 新增
  email?: string;
  website?: string;
  salesperson_name?: string;
  facebook?: string;
  linkedin?: string;
  main_products?: string;
  address_line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  level?: DataLevel;
  stage?: string;            // 改为自由文本，默认为空字符串由后端处理
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
  whatsapp?: string;         // 新增
  email?: string;
  website?: string;
  salesperson_name?: string;
  facebook?: string;
  linkedin?: string;
  main_products?: string;
  address_line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  level?: DataLevel;
  stage?: string;            // 改为自由文本
  source?: string;
  remark?: string | null;
  language?: string;
  parent_id?: string | null;
}

// ========== 部分更新参数（同 CustomerUpdateReq，但至少一个字段） ==========
export type CustomerPatchReq = CustomerUpdateReq;

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