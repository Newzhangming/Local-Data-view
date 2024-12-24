import { BaseResp, RoomBaseDto, RoomsReq } from "@/constants/dto";
import HttpService from "@/utils/http-service";
import { objectToQueryString } from "@/utils/strings";

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST!);

export const getRooms = (
  input: RoomsReq,
): Promise<BaseResp<RoomBaseDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/rooms?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<RoomBaseDto[]>>(url);
};

export const getRoomIdNames = (): Promise<BaseResp<RoomBaseDto[]>> => {
  const url = "/v1/room/id_names";
  return httpService.get<BaseResp<RoomBaseDto[]>>(url);
};

