import { BaseResp, HumanReq, Manager2Resp, ManagerReq, ManagerResp } from '@/constants/dto';
import HttpService from '@/utils/http-service';
import { objectToQueryString } from '@/utils/strings';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST2!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY2! };

export const queryHuman = (input: HumanReq): Promise<BaseResp<ManagerResp[]>> => {
  const url = `/v1/fastgpt`;
  return httpService.post<BaseResp<ManagerResp[]>>(url, input, { headers });
};

export const queryManagers = (input: ManagerReq): Promise<BaseResp<Manager2Resp[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/managers?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<Manager2Resp[]>>(url, { headers });
};
