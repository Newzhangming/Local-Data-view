import { PageReq } from './dto';

export type TaskReq = PageReq;

export interface TaskDto {
  id: string;

  proj_no?: string;

  proj_name: string;

  proj_base: number;

  proj_wb: number;

  proj_contract: number;

  proj_permit: number;

  proj_af: number;

  status: string;

  rpa_account?: string;

  sort: number;

  created_at: Date;

  updated_at: Date;
}
