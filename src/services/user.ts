import { BaseService } from './base-service';

import { BaseResp } from '@/constants/dto';
import { UserDto, UserReq } from '@/constants/user';

export class UserService extends BaseService {
  async login(input: UserReq): Promise<BaseResp<UserDto>> {
    return this.http.post(`/v1/user/login`, input, this.createConfig());
  }
}
