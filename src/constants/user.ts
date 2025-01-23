export interface UserDto {
  id: string;

  name: string;

  token: string;
}

export interface UserReq {
  name: string;

  password: string;
}
