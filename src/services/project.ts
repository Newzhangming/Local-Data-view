import { BaseResp, IdReq, ProjectDto, ProjectReq } from '@/constants/dto';
import { ProjectDetailDto, ProjectReqDto } from '@/constants/project';
import HttpService from '@/utils/http-service';
import { getStorage } from '@/utils/storage';
import { objectToQueryString } from '@/utils/strings';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST2!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY2! };

export const getProjects = (input: ProjectReq): Promise<BaseResp<ProjectDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/project/tiny-list?${objectToQueryString({ pageIndex, ...input })}`;

  // Authorization 不能放上面 headers 里，否则验证失败
  return httpService.get<BaseResp<ProjectDto[]>>(url, { headers: { ...headers, Authorization: getStorage('token') } });
};

// 用于 task 跳转
export const getProject = (projNo: string): Promise<BaseResp<ProjectDetailDto>> => {
  const url = `/v1/project?proj_no=${projNo}`;
  return httpService.get<BaseResp<ProjectDetailDto>>(url, { headers: { ...headers, Authorization: getStorage('token') } });
};

// 输出的参数类型要成为onFinish输入类型，如：这里的ProjectDetailDto要成为fromData: ProjectDetailDto
export const queryProject = (projNo: string): Promise<BaseResp<ProjectDetailDto>> => {
  const url = `/v1/project?proj_no=${projNo}`;
  return httpService.get<BaseResp<ProjectDetailDto>>(url, { headers: { ...headers, Authorization: getStorage('token') } });
};

// 因为用于RPA，所以没有加Authorization认证
export const upsertProject = (input: IdReq & ProjectReqDto): Promise<BaseResp<ProjectDto>> => {
  const url = `/v1/project/upsert`;
  return httpService.post<BaseResp<ProjectDto>>(url, input, { headers: { ...headers, Authorization: getStorage('token') } });
};
// 因为用于RPA，所以没有加Authorization认证
export const upsertUnit = (input: ProjectDetailDto): Promise<BaseResp<ProjectDto>> => {
  const url = `/v1/project/unit/upsert`;
  const data = { ...input, proj_units: input.labels };
  return httpService.post<BaseResp<ProjectDto>>(url, data, { headers: { ...headers, Authorization: getStorage('token') } });
};
