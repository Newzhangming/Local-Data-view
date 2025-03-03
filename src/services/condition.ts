import { AreaDto, AreaReq } from '@/constants/condition';
import { BaseResp } from '@/constants/dto';
import HttpService from '@/utils/http-service';
import { getStorage } from '@/utils/storage';
import { objectToQueryString } from '@/utils/strings';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST2!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY! };

export const queryAreas = (input: AreaReq): Promise<BaseResp<AreaDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/areas?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<AreaDto[]>>(url, { headers: { ...headers, Authorization: getStorage('token') } });
};
