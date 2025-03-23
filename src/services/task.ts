import { BaseService } from './base-service';

import { BaseResp } from '@/constants/dto';
import { TaskDto, TaskReq } from '@/constants/task';

export class TaskService extends BaseService {
  async queryTasks(input: TaskReq): Promise<BaseResp<TaskDto[]>> {
    const pageIndex = input.current || 1;
    const query = this.objectToQueryString({ pageIndex, ...input });
    return this.http.get(`/v1/tasks?${query}`, this.createConfig());
  }

  async addTasks(input: { proj_name: string[] }): Promise<BaseResp<TaskDto>> {
    return this.http.post(`/v1/tasks`, { proj_name: input.proj_name }, this.createConfig());
  }

  async updateTask(input: Partial<TaskDto & { action: string }>): Promise<BaseResp<TaskDto>> {
    return this.http.put(`/v1/task?=id${input.id}`, input, this.createConfig());
  }
}
