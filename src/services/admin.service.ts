import { BaseService } from './base-service';
import { User, AuditLog, DashboardStats, UserListReq, UpdateUserReq } from '@/constants/admin';
import { BaseResp, IdReq } from '@/constants/dto';

export class AdminService extends BaseService {
  // ---------- 用户管理 ----------
  async listUsers(params: UserListReq): Promise<BaseResp<User[]>> {
    // 过滤无效参数
    const filtered: any = {};
    Object.keys(params).forEach(key => {
      const val = params[key as keyof UserListReq];
      if (val !== undefined && val !== null && val !== '') {
        filtered[key] = val;
      }
    });
    const query = this.objectToQueryString({
      ...filtered,
      pageIndex: filtered.current || 1,
      pageSize: filtered.pageSize || 10,
    });
    return this.http.get(`/v1/admin/users?${query}`, this.createConfig());
  }

  async getUser(id: string): Promise<BaseResp<User>> {
    return this.http.get(`/v1/admin/users/${id}`, this.createConfig());
  }

  async updateUser(id: string, data: UpdateUserReq): Promise<BaseResp<User>> {
    return this.http.patch(`/v1/admin/users/${id}`, data, this.createConfig());
  }

  async resetPassword(id: string): Promise<BaseResp<{ newPassword: string }>> {
    return this.http.post(`/v1/admin/users/${id}/reset-password`, {}, this.createConfig());
  }

  async deleteUser(id: string): Promise<BaseResp<void>> {
    return this.http.delete(`/v1/admin/users/${id}`, this.createConfig());
  }

  // ---------- 审计日志 ----------
  async listLogs(params: any): Promise<BaseResp<AuditLog[]>> {
    const filtered: any = {};
    Object.keys(params).forEach(key => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        filtered[key] = val;
      }
    });
    const query = this.objectToQueryString({
      ...filtered,
      pageIndex: filtered.current || 1,
      pageSize: filtered.pageSize || 10,
    });
    return this.http.get(`/v1/admin/logs?${query}`, this.createConfig());
  }

  async getActionTypes(): Promise<BaseResp<string[]>> {
    return this.http.get(`/v1/admin/logs/actions`, this.createConfig());
  }

  // ---------- 仪表板 ----------
  async getDashboard(): Promise<BaseResp<DashboardStats>> {
    return this.http.get(`/v1/admin/dashboard`, this.createConfig());
  }
}