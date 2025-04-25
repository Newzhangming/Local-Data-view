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

export type ManagerReq = PageReq;

export type ProjectReq = PageReq;

export type PerformanceReq = PageReq & { keyword?: string };

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
