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
   * 查询客户列表（支持分页、搜索、筛选、层级过滤）
   */
   async queryCustomers(input: CustomerListReq): Promise<BaseResp<CustomerDto[]>> {
    const params: any = {
      pageIndex: input.current || 1,
      pageSize: input.pageSize || 10,
    };
    if (input.search?.trim()) {
      params.search = input.search.trim();
    }
    if (input.country) {
      params.country = input.country;
    }
    if (input.level) {
      params.level = input.level;
    }
    if (input.parentId !== undefined) {
      // 直接传递 null，axios 会将其序列化为 'null'（但需确认 paramsSerializer）
      params.parentId = input.parentId; // 直接赋值 null
    }
    if (input.tier !== undefined) {
      params.tier = input.tier;
    }
  
    // 使用 axios 的 params 配置，而不是手动拼接
    return this.http.get(`/v1/customers`, { ...this.createConfig(), params });
  }

  /**
   * 获取单个客户详情（支持 id / name / email / phone）
   */
  async queryCustomer(input: IdReq): Promise<BaseResp<CustomerDto>> {
    return this.http.get(`/v1/customer?id=${input.id}`, this.createConfig());
  }

  async queryCustomerByName(input: { name: string }): Promise<BaseResp<CustomerDto>> {
    return this.http.get(`/v1/customer?name=${encodeURIComponent(input.name)}`, this.createConfig());
  }

  /**
   * 创建客户（自动计算 tier）
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
   * 支持修改 parent_id 以调整层级关系
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