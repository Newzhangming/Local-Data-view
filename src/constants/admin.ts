// 用户信息（前端使用）
export interface User {
    id: string;
    name: string;
    phone: string;
    role: number;          // 1:普通, 2:管理员, 3:超级管理员
    status: 'active' | 'inactive' | 'locked';
    desc: string;
    last_login: string | null;
    created_at: string;
    updated_at: string;
  }
  
  // 审计日志
  export interface AuditLog {
    id: string;
    user_id: string;
    user_name: string;
    action: string;
    target: string | null;
    target_type: string | null;
    detail: string | null;
    ip: string | null;
    user_agent: string | null;
    created_at: string;
  }
  
  // 仪表板统计
  export interface DashboardStats {
    totalUsers: number;
    todayNew: number;
    yesterdayNew: number;
    totalLogs: number;
    todayLogs: number;
    recentLogs: AuditLog[];
  }
  
  // 用户列表查询参数
  export interface UserListReq {
    search?: string;
    role?: number;
    status?: string;
    current?: number;
    pageSize?: number;
  }
  
  // 更新用户请求
  export interface UpdateUserReq {
    role?: number;
    status?: string;
  }