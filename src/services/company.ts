import { BaseService } from './base-service';

import { CompanyDto, CompanyUpdateReq } from '@/constants/company';
import { BaseResp, CompanyReq, IdReq } from '@/constants/dto';

export class CompanyService extends BaseService {
  async queryCompanies(input: CompanyReq): Promise<BaseResp<CompanyDto[]>> {
    const pageIndex = input.current || 1;
    const query = this.objectToQueryString({ pageIndex, ...input });
    return this.http.get(`/v1/companies?${query}`, this.createConfig());
  }

  async queryCompany(input: IdReq): Promise<BaseResp<CompanyDto>> {
    return this.http.get(`/v1/company?id=${input.id}`, this.createConfig());
  }

  async updateCompany(input: IdReq & CompanyUpdateReq): Promise<BaseResp<CompanyDto>> {
    const { id, ...data } = input;
    return this.http.put(`/v1/company?id=${id}`, data, this.createConfig());
  }
}
