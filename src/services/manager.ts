import { BaseService } from './base-service';

import { BaseResp, IdReq, ManagerReq } from '@/constants/dto';
import { ManagerDto, ManagerUpdateReq } from '@/constants/manager';

export class ManagerService extends BaseService {
  async queryManagers(input: ManagerReq): Promise<BaseResp<ManagerDto[]>> {
    const pageIndex = input.current || 1;
    const query = this.objectToQueryString({ pageIndex, ...input });
    return this.http.get(`/v1/managers?${query}`, this.createConfig());
  }

  async queryManager(input: IdReq): Promise<BaseResp<ManagerDto>> {
    return this.http.get(`/v1/manager?id=${input.id}`, this.createConfig());
  }

  async updateManager(input: IdReq & ManagerUpdateReq): Promise<BaseResp<ManagerDto>> {
    const { id, ...data } = input;
    return this.http.put(`/v1/manager?id=${id}`, data, this.createConfig());
  }
}
