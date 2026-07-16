import { BaseService } from './base-service';
import {
  CustomerDto,
  CustomerCreateReq,
  CustomerUpdateReq,
  CustomerListReq,
  CustomerContact,
  CustomerContactCreateReq,
  CustomerContactUpdateReq,
} from '@/constants/customer';
import { BaseResp, IdReq } from '@/constants/dto';

export class CustomerService extends BaseService {
  /**
   * 查询客户列表（支持分页、搜索、筛选、层级过滤、阶段、WhatsApp、回复状态、时间范围、业务员）
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
      params.stage = input.stage;
    }
    if (input.whatsapp) {
      params.whatsapp = input.whatsapp;
    }
    if (input.parentId !== undefined) {
      params.parentId = input.parentId;
    }
    if (input.tier !== undefined) {
      params.tier = input.tier;
    }
    if (input.reply_status) {
      params.reply_status = input.reply_status;
    }
    // 新增时间范围和业务员筛选
    if (input.createdAtFrom) {
      params.createdAtFrom = input.createdAtFrom;
    }
    if (input.createdAtTo) {
      params.createdAtTo = input.createdAtTo;
    }
    if (input.updatedAtFrom) {
      params.updatedAtFrom = input.updatedAtFrom;
    }
    if (input.updatedAtTo) {
      params.updatedAtTo = input.updatedAtTo;
    }
    if (input.salesperson) {
      params.salesperson = input.salesperson;
    }

    return this.http.get(`/v1/customers`, { ...this.createConfig(), params });
  }

  /**
   * 获取单个客户详情（支持 id / name / email / phone，可选是否包含联系人）
   */
  async queryCustomer(input: IdReq & { includeContacts?: boolean }): Promise<BaseResp<CustomerDto>> {
    const params: any = { id: input.id };
    if (input.includeContacts) {
      params.includeContacts = 'true';
    }
    return this.http.get(`/v1/customer`, { ...this.createConfig(), params });
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

  // ---------- 多对多上级关系管理 ----------

  async getParents(id: string): Promise<BaseResp<CustomerDto[]>> {
    return this.http.get('/v1/customer/parents', {
      ...this.createConfig(),
      params: { id },
    });
  }

  async getChildren(id: string): Promise<BaseResp<CustomerDto[]>> {
    return this.http.get('/v1/customer/children', {
      ...this.createConfig(),
      params: { id },
    });
  }

  async addRelation(parentId: string, childId: string): Promise<BaseResp<any>> {
    return this.http.post('/v1/customer/relation', { parentId, childId }, this.createConfig());
  }

  async removeRelation(relationId: string): Promise<BaseResp<any>> {
    return this.http.delete(`/v1/customer/relation?id=${relationId}`, this.createConfig());
  }

  // ---------- 联系人管理 ----------

  async getContacts(customerId: string): Promise<BaseResp<CustomerContact[]>> {
    return this.http.get('/v1/customer/contacts', {
      ...this.createConfig(),
      params: { customerId },
    });
  }

  async createContact(input: CustomerContactCreateReq): Promise<BaseResp<CustomerContact>> {
    return this.http.post('/v1/customer/contact', input, this.createConfig());
  }

  async updateContact(id: string, data: CustomerContactUpdateReq): Promise<BaseResp<CustomerContact>> {
    return this.http.patch(`/v1/customer/contact?id=${id}`, data, this.createConfig());
  }

  async deleteContact(id: string): Promise<BaseResp<void>> {
    return this.http.delete(`/v1/customer/contact?id=${id}`, this.createConfig());
  }

  // ---------- 思维导图状态持久化 ----------

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

  async saveTreeState(input: {
    rootId: string;
    expandedNodeIds: string[];
    drawingHistory: any[];
    viewState: any;
  }): Promise<BaseResp<{ success: boolean }>> {
    return this.http.put('/v1/customer/tree-state', input, this.createConfig());
  }
}