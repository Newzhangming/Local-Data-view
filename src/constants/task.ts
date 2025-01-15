import { PageReq } from './dto';

export type TaskReq = PageReq;

export interface TaskDto {
  name: string;

  proj_name: string;

  proj_base: number;

  proj_wb: number;

  proj_contract: number;

  proj_permit: number;

  proj_af: number;

  status: string;

  // 更新时间
  updated_at: string;
}
