import { BaseResp, MessageBaseDto, MessagesReq } from "@/constants/dto";
import HttpService from "@/utils/http-service";
import { objectToQueryString } from "@/utils/strings";

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST1!);
const headers = { "Access-Token": process.env.NEXT_PUBLIC_ACCESS_KEY1! };

export const getMessages = (
  input: MessagesReq,
): Promise<BaseResp<MessageBaseDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/messages?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<MessageBaseDto[]>>(url, { headers });
};

