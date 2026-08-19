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
   * 查询客户列表（支持分页、搜索、筛选、层级过滤、阶段、WhatsApp、回复状态、时间范围、业务员、社交媒体、跟进时间）
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
    if (input.stage !== undefined) {
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
    // ---------- 新增社交媒体及跟进时间筛选 ----------
    if (input.instagram) {
      params.instagram = input.instagram;
    }
    if (input.tiktok) {
      params.tiktok = input.tiktok;
    }
    if (input.youtube) {
      params.youtube = input.youtube;
    }
    if (input.follow_up_date_from) {
      params.follow_up_date_from = input.follow_up_date_from;
    }
    if (input.follow_up_date_to) {
      params.follow_up_date_to = input.follow_up_date_to;
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


/**
 * 获取筛选下拉选项（国家、业务员、客户来源）
 */
 async getFilterOptions(): Promise<BaseResp<{ countries: string[]; salespersons: string[]; sources: string[] }>> {
  return this.http.get('/v1/customer/filter-options', this.createConfig());
}

  // ========== 导出客户数据（CSV） ==========
  async exportCustomers(params?: Omit<CustomerListReq, 'current' | 'pageSize'>): Promise<{ blob: Blob; filename: string }> {
    const queryParams: any = {};
    if (params?.search?.trim()) queryParams.search = params.search.trim();
    if (params?.country) queryParams.country = params.country;
    if (params?.level) queryParams.level = params.level;
    if (params?.stage) queryParams.stage = params.stage;
    if (params?.whatsapp) queryParams.whatsapp = params.whatsapp;
    if (params?.parentId !== undefined) queryParams.parentId = params.parentId;
    if (params?.tier !== undefined) queryParams.tier = params.tier;
    if (params?.reply_status) queryParams.reply_status = params.reply_status;
    if (params?.createdAtFrom) queryParams.createdAtFrom = params.createdAtFrom;
    if (params?.createdAtTo) queryParams.createdAtTo = params.createdAtTo;
    if (params?.updatedAtFrom) queryParams.updatedAtFrom = params.updatedAtFrom;
    if (params?.updatedAtTo) queryParams.updatedAtTo = params.updatedAtTo;
    if (params?.salesperson) queryParams.salesperson = params.salesperson;
    // ---------- 新增社交媒体及跟进时间导出 ----------
    if (params?.instagram) queryParams.instagram = params.instagram;
    if (params?.tiktok) queryParams.tiktok = params.tiktok;
    if (params?.youtube) queryParams.youtube = params.youtube;
    if (params?.follow_up_date_from) queryParams.follow_up_date_from = params.follow_up_date_from;
    if (params?.follow_up_date_to) queryParams.follow_up_date_to = params.follow_up_date_to;

    queryParams._t = Date.now();

    let baseUrl = (process.env.NEXT_PUBLIC_HOST || '').trim();
    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const queryString = new URLSearchParams(queryParams).toString();
    const url = baseUrl
      ? `${baseUrl}/v1/customer/export?${queryString}`
      : `/v1/customer/export?${queryString}`;

    const config = this.createConfig();
    let authHeader = config.headers?.Authorization || '';
    if (authHeader && !authHeader.startsWith('Bearer ')) {
      authHeader = `Bearer ${authHeader}`;
    }
    const headers = {
      ...config.headers,
      Authorization: authHeader,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const errorObj = JSON.parse(text);
        throw new Error(errorObj.msg || errorObj.message || `导出失败 (HTTP ${response.status})`);
      } catch {
        throw new Error(`导出请求失败 (HTTP ${response.status})`);
      }
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const text = await response.text();
      try {
        const errorObj = JSON.parse(text);
        throw new Error(errorObj.msg || errorObj.message || '导出失败');
      } catch {
        throw new Error('导出失败，服务器返回了错误格式');
      }
    }

    const blob = await response.blob();

    let filename = `客户数据_${new Date().toISOString().slice(0, 10)}.csv`;
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
      if (match) {
        filename = decodeURIComponent(match[1]);
      } else {
        const simpleMatch = contentDisposition.match(/filename=([^;]+)/);
        if (simpleMatch) filename = simpleMatch[1].replace(/['"]/g, '');
      }
    }

    return { blob, filename };
  }
}