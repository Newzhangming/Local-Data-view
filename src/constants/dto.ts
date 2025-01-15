export interface BaseResp<T> {
  msg: string;
  data: T;
  total?: number;
}

export interface PageReq {
  current?: number;
  pageSize?: number;
}

// JSON 对象转 TypeScript 定义 https://app.quicktype.io/?l=ts

export interface MessagesReq extends PageReq {
  id?: string;
  nickname?: string;
  to?: string;
  room_id?: string;
  content?: string;
  note?: string;
}

export interface MessageBaseDto {
  id: string;
  nickname: string;
  to: string;
  room_id: string;
  content: string;
  note: string;
}

export type RoomsReq = PageReq;

export interface RoomBaseDto {
  id: string;
  room_name: string;
}

export interface HumanReq {
  content: string;
}

export interface HumanResp {
  role: string;
  content: string;
}

export type ManagerReq = PageReq;

export interface ManagerResp {
  result: boolean;
  msg: string;
}

export interface Manager2Resp {
  id: string;
  name: string;
  id_card: string;
  cert_name: string;
  created_at: string;
}

export type ProjectReq = PageReq;

export interface ProjectDto {
  proj_no: string;
  proj_name: string;
  data_level: string;
  proj_type: string;
  total_area: number;
  updated_at: string;
}

export type CompanyReq = PageReq;

export interface CompanyDto {
  name: string;

  // 统一社会信用代码
  social_credit_code: string;

  // 企业角色：设计，施工，监理, 勘察
  role_type: string;

  // 资质类别：建筑业企业资质，设计资质
  cert_type: string;
  // 资质编号
  cert_no: string;

  // 资质证书名称：建筑工程施工总承包特级
  cert_name: string;

  // 发证日期
  cert_date: string;

  // 发证有效期
  cert_expire: string;

  // 更新时间
  updated_at: string;
}
