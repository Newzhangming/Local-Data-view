// src/services/info.service.ts
import { BaseService } from './base-service';
import { BaseResp } from '@/constants/dto';
import {
  Info,
  InfoListQuery,
  InfoListResponse,
  InfoCreateDto,
  InfoUpdateDto,
} from '@/constants/info';

export class InfoService extends BaseService {
  /**
   * 分页查询信息列表
   * 后端返回格式：{ msg: 'success', total: number, data: Info[] }
   * BaseResp 可能包装一层 data，但此处直接使用 any 或根据实际情况调整
   */
  async queryInfos(input: InfoListQuery): Promise<BaseResp<InfoListResponse>> {
    const params = new URLSearchParams();
    params.set('pageIndex', String(input.pageIndex || 1));
    params.set('pageSize', String(input.pageSize || 10));
    if (input.source) params.set('source', input.source);
    if (input.dateFrom) params.set('dateFrom', input.dateFrom);
    if (input.dateTo) params.set('dateTo', input.dateTo);

    return this.http.get(`/v1/info?${params.toString()}`, this.createConfig());
  }

  async createInfo(data: InfoCreateDto): Promise<BaseResp<Info>> {
    return this.http.post('/v1/info', data, this.createConfig());
  }

  async updateInfo(id: string, data: InfoUpdateDto): Promise<BaseResp<Info>> {
    return this.http.put(`/v1/info?id=${id}`, data, this.createConfig());
  }

  async deleteInfo(id: string): Promise<BaseResp<null>> {
    return this.http.delete(`/v1/info?id=${id}`, this.createConfig());
  }
}

// 导出单例
export const infoService = new InfoService();