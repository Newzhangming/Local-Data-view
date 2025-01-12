import { BaseResp, ProjectDto, ProjectReq } from '@/constants/dto';
import { ProjectDetailDto } from '@/constants/project';
import HttpService from '@/utils/http-service';
import { objectToQueryString } from '@/utils/strings';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST2!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY2! };

export const getProjects = (input: ProjectReq): Promise<BaseResp<ProjectDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/project/tiny-list?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<ProjectDto[]>>(url, { headers });
};

export const getProject = (projNo: string): Promise<BaseResp<ProjectDetailDto>> => {
  const url = `/v1/project?proj_no=${projNo}`;
  return httpService.get<BaseResp<ProjectDetailDto>>(url, { headers });
};
