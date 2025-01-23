import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

import { getStorage } from '@/utils/storage';

class HttpService {
  private instance: AxiosInstance;
  private cancelTokenSources: Map<string, CancelTokenSource>;

  constructor(baseURL: string) {
    this.instance = axios.create({ baseURL, timeout: 30 * 1000 });

    this.cancelTokenSources = new Map();

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = getStorage('token');
        if (token) {
          config.headers.token = token;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else {
          // 处理其他错误
        }
        if (error.status === 401) {
          // removeStorage('token');
          return Promise.resolve({ data: { msg: '鉴权码缺失' } });
        } else if (error.status === 429) {
          return Promise.resolve({ data: { msg: '您请求太快，休息一下再来' } });
        }

        return Promise.reject(error);
      },
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }

  public cancelRequest(url: string): void {
    const source = this.cancelTokenSources.get(url);
    if (source) {
      source.cancel(`Request to ${url} was canceled`);
      this.cancelTokenSources.delete(url);
    }
  }

  public cancelAllRequests(): void {
    this.cancelTokenSources.forEach((source) => {
      source.cancel('All requests were canceled');
    });
    this.cancelTokenSources.clear();
  }

  public request<T>(config: AxiosRequestConfig): Promise<T> {
    const source = axios.CancelToken.source();
    this.cancelTokenSources.set(config.url!, source);

    config.cancelToken = source.token;

    return this.instance.request(config).then(
      (response) => {
        this.cancelTokenSources.delete(config.url!);
        return response.data;
      },
      (error) => {
        this.cancelTokenSources.delete(config.url!);
        throw error;
      },
    );
  }
}

export default HttpService;
