import { BaseResp, HumanReq, HumanResp } from "@/constants/dto";
import HttpService from "@/utils/http-service";

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST!);

export const queryHuman = (
  input: HumanReq,
): Promise<BaseResp<HumanResp>> => {
  const url = `/v1/human`;
  return httpService.post<BaseResp<HumanResp>>(url, input);
};
