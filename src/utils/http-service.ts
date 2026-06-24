import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getStorage } from '@/utils/storage';

class HttpService {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 30 * 1000,
      headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // ----- 请求拦截器 -----
    this.instance.interceptors.request.use(
      (config) => {
        const url = config.url || '';

        // 1. 登录接口移除 Authorization
        if (url.includes('/login')) {
          delete config.headers.Authorization;
        } else {
          // 2. 非登录接口添加 JWT
          const token = getStorage('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            delete config.headers.Authorization;
          }
        }

        // 3. 所有请求添加 Access-Token
        const accessToken = process.env.NEXT_PUBLIC_ACCESS_KEY || '';
        if (accessToken) {
          config.headers['Access-Token'] = accessToken;
        } else {
          delete config.headers['Access-Token'];
        }

        // 4. 清理可能遗留的自定义头
        delete config.headers.token;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // ----- 响应拦截器（关键：确保错误正确抛出） -----
    this.instance.interceptors.response.use(
      (response) => {
        // 直接返回响应对象，供后续处理
        return response;
      },
      (error) => {
        // 直接抛出错误，保留完整的 error 对象（包含 response）
        return Promise.reject(error);
      }
    );
  }

  // ----- 核心请求方法（统一处理） -----
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.request(config);
      // 假设后端返回结构为 { msg, data, total? }
      // 直接返回 response.data（即整个业务数据）
      return response.data;
    } catch (error) {
      // 如果是 axios 错误，直接抛出，外部可以通过 error.response 访问
      // 如果不是 axios 错误（如网络超时），也抛出
      throw error;
    }
  }

  // ----- 公开方法 -----
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // 过滤无效查询参数
    if (config?.params) {
      const cleanedParams = Object.fromEntries(
        Object.entries(config.params).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ''
        )
      );
      config.params = cleanedParams;
    }
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

export default HttpService;