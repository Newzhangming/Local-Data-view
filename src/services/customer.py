import { BaseService } from './base-service';
import {
  CustomerDto,
  CustomerCreateReq,
  CustomerUpdateReq,
  CustomerListReq,
} from '@/constants/customer';
import { BaseResp, IdReq } from '@/constants/dto';

export class CustomerService extends BaseService {
  /**
   * 查询客户列表（支持分页、搜索、筛选）
   */
  async queryCustomers(input: CustomerListReq): Promise<BaseResp<CustomerDto[]>> {
    const pageIndex = input.current || 1;
    const pageSize = input.pageSize || 10;
    const query = this.objectToQueryString({
      pageIndex,
      pageSize,
      search: input.search,
      country: input.country,
      level: input.level,
      status: input.status,
    });
    return this.http.get(`/v1/customers?${query}`, this.createConfig());
  }

  /**
   * 获取单个客户详情
   */
  async queryCustomer(input: IdReq): Promise<BaseResp<CustomerDto>> {
    return this.http.get(`/v1/customer?id=${input.id}`, this.createConfig());
  }

  /**
   * 创建客户
   */
  async createCustomer(input: CustomerCreateReq): Promise<BaseResp<CustomerDto>> {
    return this.http.post(`/v1/customer`, input, this.createConfig());
  }

  /**
   * 全量更新客户（PUT）
   */
  async updateCustomer(input: IdReq & CustomerUpdateReq): Promise<BaseResp<CustomerDto>> {
    const { id, ...data } = input;
    return this.http.put(`/v1/customer?id=${id}`, data, this.createConfig());
  }

  /**
   * 部分更新客户（PATCH）
   * 若后端实现了 PATCH 接口，可使用此方法
   */
  async patchCustomer(input: IdReq & CustomerUpdateReq): Promise<BaseResp<CustomerDto>> {
    const { id, ...data } = input;
    return this.http.patch(`/v1/customer?id=${id}`, data, this.createConfig());
  }

  /**
   * 删除客户（软删除）
   */
  async deleteCustomer(input: IdReq): Promise<BaseResp<{ id: string }>> {
    return this.http.delete(`/v1/customer?id=${input.id}`, this.createConfig());
  }
}