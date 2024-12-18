export const StatusMap = [
  { value: "unprocessed", label: "未处理" },
  { value: "processing", label: "处理中" },
  { value: "processed", label: "已处理" },
];

export const CaseType = {
  fault: { label: "故障", color: "red" },
  repair: { label: "维修", color: "blue" },
  new_car: { label: "新车", color: "green" },
  illegal_parking: { label: "违停", color: "cyan" },
};

export interface BaseResp<T> {
  msg: string;
  data: T;
  total?: number;
}

// JSON 对象转 TypeScript 定义 https://app.quicktype.io/?l=ts

export interface MessagesReq {
  id?: string;
  nickname?: string;
  at?: string;
  topic?: string;
  content?: string;
  note?: string;
  from?: string; // dashboard/list
  current?: number;
  pageSize?: number;
}

export interface MessageBaseDto {
  id: string;
  nickname: string;
  at: string;
  topic: string;
  content: string;
  note: string;
}

export interface LoginDto {
  name: string;
  password: string;
}

export interface LoginResp {
  name: string;
  id: string;
  token: string;
}
