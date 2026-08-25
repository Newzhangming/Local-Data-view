// constants/info.ts

// ---------- Info 实体类型 ----------
export interface Info {
    id: string;
    source: string;
    date: string; // ISO 日期字符串，如 "2026-08-24T10:00:00.000Z"
    content: string;
  }
  
  // ---------- 列表查询参数 ----------
  export interface InfoListQuery {
    source?: string;       // 来源（模糊搜索）
    dateFrom?: string;     // ISO 日期起始
    dateTo?: string;       // ISO 日期结束
    pageIndex?: number;    // 页码，默认 1
    pageSize?: number;     // 每页条数，默认 10
  }
  
  // ---------- 创建请求体 ----------
  export interface InfoCreateDto {
    source: string;
    date: string; // ISO 日期字符串
    content: string;
  }
  
  // ---------- 更新请求体 ----------
  export interface InfoUpdateDto extends Partial<InfoCreateDto> {
    id: string; // 更新的记录 ID（通过 URL 参数传递，但为了类型完整性也保留）
  }
  
  // ---------- 列表响应 ----------
  export interface InfoListResponse {
    msg: string;
    total: number;
    data: Info[];
  }
  
  // ---------- 单条响应 ----------
  export interface InfoDetailResponse {
    msg: string;
    data: Info;
  }