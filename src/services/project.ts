import { BaseResp, IdReq, ProjectDto, ProjectReq } from '@/constants/dto';
import { ProjectDetailDto, ProjectReqDto } from '@/constants/project';
import { BaseService } from '@/services/base-service';

export class ProjectService extends BaseService {
  async getProjects(input: ProjectReq): Promise<BaseResp<ProjectDto[]>> {
    const pageIndex = input.current || 1;
    const url = `/v1/project/tiny-list?${this.objectToQueryString({ pageIndex, ...input })}`;
    // Authorization 不能放上面 headers 里，否则验证失败
    return this.http.get<BaseResp<ProjectDto[]>>(url, this.createConfig());
  }

  // 用于 task 跳转
  async getProject(projNo: string): Promise<BaseResp<ProjectDetailDto>> {
    const url = `/v1/project?proj_no=${projNo}`;
    return this.http.get<BaseResp<ProjectDetailDto>>(url, this.createConfig());
  }

  // 输出的参数类型要成为onFinish输入类型，如：这里的ProjectDetailDto要成为fromData: ProjectDetailDto
  async queryProject(projNo: string): Promise<BaseResp<ProjectDetailDto>> {
    const url = `/v1/project?proj_no=${projNo}`;
    return this.http.get<BaseResp<ProjectDetailDto>>(url, this.createConfig());
  }

  // 因为用于RPA，所以没有加Authorization认证
  async upsertProject(input: IdReq & ProjectReqDto): Promise<BaseResp<ProjectDto>> {
    const url = `/v1/project/upsert`;
    return this.http.post<BaseResp<ProjectDto>>(url, input, this.createConfig());
  }

  // 因为用于RPA，所以没有加Authorization认证
  async upsertUnit(input: ProjectDetailDto): Promise<BaseResp<ProjectDto>> {
    const url = `/v1/project/unit/upsert`;
    const data = { ...input, proj_units: input.labels };
    return this.http.post<BaseResp<ProjectDto>>(url, data, this.createConfig());
  }
}
