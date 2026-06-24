// ========== 客户等级枚举（与后端 DataLevel 一致） ==========
export type DataLevel = 'A' | 'B' | 'C' | 'D';

// ========== 客户列表查询参数 ==========
export interface CustomerListReq {
  search?: string;           // 搜索关键字（name/contact_person/phone/email）
  country?: string;          // 国家筛选
  level?: DataLevel;         // 数据等级筛选
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
  contact_title: string;       // 联系人职位
  phone: string;
  email: string;
  website: string;             // 网站
  salesperson_name: string;    // 业务员姓名
  facebook: string;            // Facebook 账号
  linkedin: string;            // Linkedin 账号
  main_products: string;       // 主营产品
  address_line1: string;
  city: string;
  postal_code: string;
  country: string;
  level: DataLevel;            // 数据等级（A/B/C/D）
  source: string;
  remark: string | null;
  language: string;
  // ---- 层级字段 ----
  parent_id: string | null;    // 上级客户ID
  tier: number;                // 1/2/3
  // ---- 可选的关联对象（查询时可通过 include 返回） ----
  parent?: CustomerDto | null; // 上级客户信息
  children?: CustomerDto[];    // 下级客户列表（慎用，数据量大）
  // ---- 系统字段 ----
  sort: number;
  deleted: string;             // 'no' 或 'yes'
  created_at: string;
  updated_at: string;
}

// ========== 创建客户参数 ==========
export interface CustomerCreateReq {
  name: string;                // 必填
  contact_person?: string;
  contact_title?: string;
  phone?: string;
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
  source?: string;
  remark?: string | null;
  language?: string;
  parent_id?: string | null;   // 上级客户ID（可选，传null则为顶级）
}

// ========== 更新客户参数（所有字段可选） ==========
// 注意：tier 由后端自动计算，前端无需传递
export interface CustomerUpdateReq {
  name?: string;
  contact_person?: string;
  contact_title?: string;
  phone?: string;
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
  source?: string;
  remark?: string | null;
  language?: string;
  parent_id?: string | null;   // 修改上级（设为null则提升为顶级）
}

// ========== 部分更新参数（同 CustomerUpdateReq，但至少一个字段） ==========
export type CustomerPatchReq = CustomerUpdateReq;

// ========== 通用响应结构 ==========
export interface BaseResp<T> {
  msg: string;
  data: T;
  total?: number;   // 列表接口返回总数
}

// ========== 通用ID请求 ==========
export interface IdReq {
  id: string;
}