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
   * 查询客户列表（支持分页、搜索、筛选、层级过滤、阶段、WhatsApp）
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
    if (input.stage) {
      params.stage = input.stage;           // 新增：阶段精确筛选
    }
    if (input.whatsapp) {
      params.whatsapp = input.whatsapp;     // 新增：WhatsApp 精确筛选
    }
    if (input.parentId !== undefined) {
      params.parentId = input.parentId;
    }
    if (input.tier !== undefined) {
      params.tier = input.tier;
    }

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

  /**
   * 获取思维导图持久化状态
   */
  async getTreeState(rootId: string): Promise<BaseResp<{
    expandedNodeIds: string[];
    drawingHistory: any[];
    viewState: { translate: { x: number; y: number }; scale: number };
  }>> {
    return this.http.get('/v1/customer/tree-state', {
      ...this.createConfig(),
      params: { rootId },
    });
  }

  /**
   * 保存思维导图持久化状态
   */
  async saveTreeState(input: {
    rootId: string;
    expandedNodeIds: string[];
    drawingHistory: any[];
    viewState: any;
  }): Promise<BaseResp<{ success: boolean }>> {
    return this.http.put('/v1/customer/tree-state', input, this.createConfig());
  }
}