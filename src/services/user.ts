import { BaseResp } from '@/constants/dto';
import { UserDto, UserReq } from '@/constants/user';
import HttpService from '@/utils/http-service';
import { getStorage } from '@/utils/storage';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST2!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY2! };

export const login = (input: UserReq): Promise<BaseResp<UserDto>> => {
  const url = `/v1/user/login`;
  return httpService.post<BaseResp<UserDto>>(url, input, { headers: { ...headers, Authorization: getStorage('token') } });
};
