import { CompanyDto, CompanyUpdateReq } from '@/constants/company';
import { BaseResp, CompanyReq, IdReq } from '@/constants/dto';
import HttpService from '@/utils/http-service';
import { getStorage } from '@/utils/storage';
import { objectToQueryString } from '@/utils/strings';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY! };

export const queryCompanies = (input: CompanyReq): Promise<BaseResp<CompanyDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/companies?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<CompanyDto[]>>(url, { headers: { ...headers, Authorization: getStorage('token') } });
};

export const queryCompany = (input: IdReq): Promise<BaseResp<CompanyDto>> => {
  const url = `/v1/company?id=${input.id}`;
  return httpService.get<BaseResp<CompanyDto>>(url, { headers: { ...headers, Authorization: getStorage('token') } });
};

export const updateCompany = (input: IdReq & CompanyUpdateReq): Promise<BaseResp<CompanyDto>> => {
  const { id, ...data } = input;
  const url = `/v1/company?id=${id}`;
  return httpService.put<BaseResp<CompanyDto>>(url, data, { headers: { ...headers, Authorization: getStorage('token') } });
};
