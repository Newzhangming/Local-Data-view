// 客户列表查询参数
export interface CustomerListReq {
  search?: string;
  country?: string;
  level?: 'A' | 'B' | 'C' | 'D';
  status?: string;
  current?: number;   // 当前页码，从1开始
  pageSize?: number;
}

// 客户数据对象
export interface CustomerDto {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  level: 'A' | 'B' | 'C' | 'D';
  status: string;
  source: string;
  remark: string | null;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// 创建客户参数（必填字段）
export interface CustomerCreateReq {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string | null;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  level?: 'A' | 'B' | 'C' | 'D';
  status?: string;
  source?: string;
  remark?: string | null;
  language?: string;
  timezone?: string;
}

// 更新客户参数（所有字段可选）
export type CustomerUpdateReq = Partial<CustomerCreateReq>;

// 通用响应结构（根据后端实际调整）
export interface BaseResp<T> {
  code: number;
  msg: string;
  data: T;
  total?: number;
}

// 通用ID请求
export interface IdReq {
  id: string;
}