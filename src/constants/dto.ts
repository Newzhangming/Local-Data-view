export interface BaseResp<T> {
  msg: string;
  data: T;
  total?: number;
}

export interface PageReq {
  current?: number;
  pageSize?: number;
}

export interface IdReq {
  id: string;
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

export type ProjectReq = PageReq;

export interface ProjectDto {
  id: string;
  proj_no: string;
  proj_name: string;
  data_level: string;
  conclusion: string;
  proj_type: string;
  proj_use: string;
  total_area: number;
  date_logic: number;
  proj_units: { id: string }[];
  updated_at: Date;
}

export type CompanyReq = PageReq;
