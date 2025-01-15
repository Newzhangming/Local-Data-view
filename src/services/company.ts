import { BaseResp, CompanyDto, CompanyReq } from '@/constants/dto';
import HttpService from '@/utils/http-service';
import { objectToQueryString } from '@/utils/strings';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST2!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY2! };

export const queryCompanies = (input: CompanyReq): Promise<BaseResp<CompanyDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/companies?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<CompanyDto[]>>(url, { headers });
};
