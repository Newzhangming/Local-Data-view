// utils/http-service.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getStorage, removeStorage } from '@/utils/storage';

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
    // 请求拦截器（保持不变）
    this.instance.interceptors.request.use(
      (config) => {
        const url = config.url || '';
        if (url.includes('/login')) {
          delete config.headers.Authorization;
        } else {
          const token = getStorage('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            delete config.headers.Authorization;
          }
        }
        const accessToken = process.env.NEXT_PUBLIC_ACCESS_KEY || '';
        if (accessToken) {
          config.headers['Access-Token'] = accessToken;
        } else {
          delete config.headers['Access-Token'];
        }
        delete config.headers.token;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器（关键修改）
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as any;

          if (status === 401) {
            const msg = data?.msg || '';
            const isKicked = msg.includes('其他地方登录');
            console.log('[HttpService] 401 捕获，isKicked:', isKicked, 'msg:', msg);

            // 清除本地凭证
            if (typeof window !== 'undefined') {
              removeStorage('token');
              document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
            }

            // 跳转到登录页，携带 reason 参数
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              const reason = isKicked ? 'kicked' : 'expired';
              console.log('[HttpService] 跳转到:', `/login?reason=${reason}`);
              window.location.replace(`/login?reason=${reason}`);
            }

            // 返回一个永不 resolve 的 Promise，阻止上层 catch 继续执行
            // 这样上层代码中的 .catch() 不会被触发，避免覆盖跳转
            return new Promise(() => {});
          }
        }
        // 非 401 错误正常抛出，让上层处理
        return Promise.reject(error);
      }
    );
  }

  // ----- 核心请求方法（不变） -----
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
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