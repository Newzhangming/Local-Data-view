import { PageReq } from '@/constants/dto';

export type AreaReq = PageReq;
export interface AreaDto {
  id: string;

  name: string;
}

export type ProjectRoleReq = { area_id: string } & PageReq;
export interface ProjectRoleDto {
  id: string;
  name: string;
  duration: string;
  amount: string;
  area: { id: string; name: string };
}

export type ConditionReq = { role_id: string } & ProjectRoleReq;
export interface ConditionDto {
  id: string;
  content: string;
  desc: string;
  role: { id: string; name: string };
  area: { id: string; name: string };
}
