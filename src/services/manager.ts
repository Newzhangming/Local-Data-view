import { BaseResp, HumanReq, IdReq, ManagerReq, ManagerResp } from '@/constants/dto';
import { ManagerDto, ManagerUpdateReq } from '@/constants/manager';
import HttpService from '@/utils/http-service';
import { getStorage } from '@/utils/storage';
import { objectToQueryString } from '@/utils/strings';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST2!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY! };

export const queryHuman = (input: HumanReq): Promise<BaseResp<ManagerResp[]>> => {
  const url = `/v1/fastgpt`;
  return httpService.post<BaseResp<ManagerResp[]>>(url, input, { headers: { ...headers, Authorization: getStorage('token') } });
};

export const queryManagers = (input: ManagerReq): Promise<BaseResp<ManagerDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/managers?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<ManagerDto[]>>(url, { headers: { ...headers, Authorization: getStorage('token') } });
};

export const queryManager = (input: IdReq): Promise<BaseResp<ManagerDto>> => {
  const url = `/v1/manager?id=${input.id}`;
  return httpService.get<BaseResp<ManagerDto>>(url, { headers: { ...headers, Authorization: getStorage('token') } });
};

export const updateManager = (input: IdReq & ManagerUpdateReq): Promise<BaseResp<ManagerDto>> => {
  const { id, ...data } = input;
  const url = `/v1/manager?id=${id}`;
  return httpService.put<BaseResp<ManagerDto>>(url, data, { headers: { ...headers, Authorization: getStorage('token') } });
};
