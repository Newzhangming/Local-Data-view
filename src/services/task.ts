import { BaseResp } from '@/constants/dto';
import { TaskDto, TaskReq } from '@/constants/task';
import HttpService from '@/utils/http-service';
import { objectToQueryString } from '@/utils/strings';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST2!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY2! };

export const queryTasks = (input: TaskReq): Promise<BaseResp<TaskDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/tasks?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<TaskDto[]>>(url, { headers });
};

export const addTask = (input: { proj_name: string }): Promise<BaseResp<TaskDto>> => {
  const url = `/v1/task`;
  const data = { proj_name: input.proj_name };
  return httpService.post<BaseResp<TaskDto>>(url, data, { headers });
};
