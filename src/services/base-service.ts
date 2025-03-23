import { AxiosRequestConfig } from 'axios';

import HttpService from '@/utils/http-service';
import { getStorage } from '@/utils/storage';

export abstract class BaseService {
  protected readonly http: HttpService;
  protected readonly baseHeaders: Record<string, string>;

  constructor() {
    this.http = new HttpService(process.env.NEXT_PUBLIC_HOST!);
    this.baseHeaders = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY! };
  }

  protected createConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
    return { ...config, headers: { Authorization: getStorage('token'), ...this.baseHeaders, ...config?.headers } };
  }

  protected objectToQueryString(obj: { [key: string]: string | number | boolean }): string {
    delete obj.current;
    return Object.keys(obj)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  }
}
