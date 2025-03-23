import { BaseService } from './base-service';

import { AreaDto, AreaReq, ConditionDto, ConditionReq, ProjectRoleDto, ProjectRoleReq } from '@/constants/condition';
import { BaseResp, IdReq } from '@/constants/dto';

export class ConditionService extends BaseService {
  async queryAreas(input: AreaReq): Promise<BaseResp<AreaDto[]>> {
    const pageIndex = input.current || 1;
    const query = this.objectToQueryString({ pageIndex, ...input });
    return this.http.get(`/v1/areas?${query}`, this.createConfig());
  }

  async queryProjectRoles(input: ProjectRoleReq): Promise<BaseResp<ProjectRoleDto[]>> {
    const pageIndex = input.current || 1;
    const query = this.objectToQueryString({ pageIndex, ...input });
    return this.http.get(`/v1/project-roles?${query}`, this.createConfig());
  }

  async queryConditions(input: ConditionReq): Promise<BaseResp<ConditionDto[]>> {
    const pageIndex = input.current || 1;
    const query = this.objectToQueryString({ pageIndex, ...input });
    return this.http.get(`/v1/conditions?${query}`, this.createConfig());
  }

  async removeCondition(input: IdReq): Promise<BaseResp<ConditionDto>> {
    return this.http.delete(`/v1/condition?id=${input.id}`, this.createConfig());
  }
}
