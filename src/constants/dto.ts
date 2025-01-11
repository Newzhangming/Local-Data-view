
export interface BaseResp<T> {
  msg: string;
  data: T;
  total?: number;
}

// JSON 对象转 TypeScript 定义 https://app.quicktype.io/?l=ts

export interface MessagesReq {
  id?: string;
  nickname?: string;
  to?: string;
  room_id?: string;
  content?: string;
  note?: string;

  current?: number;
  pageSize?: number;
}

export interface MessageBaseDto {
  id: string;
  nickname: string;
  to: string;
  room_id: string;
  content: string;
  note: string;
}

export interface RoomsReq {
  current?: number;
  pageSize?: number;
}

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

export interface ManagerResp {
  result: boolean;
  msg: string;
}

export interface ProjectReq {
  current?: number;
  pageSize?: number;
}

export interface ProjectDto {
  proj_no: string;
  proj_name: string;
  data_level: string;
  proj_type: string;
  total_area: number;
  updated_at: string,
}
