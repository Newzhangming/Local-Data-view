import { BaseResp, RoomBaseDto, RoomsReq } from '@/constants/dto';
import HttpService from '@/utils/http-service';
import { objectToQueryString } from '@/utils/strings';

const httpService = new HttpService(process.env.NEXT_PUBLIC_HOST1!);
const headers = { 'Access-Token': process.env.NEXT_PUBLIC_ACCESS_KEY1! };

export const getRooms = (input: RoomsReq): Promise<BaseResp<RoomBaseDto[]>> => {
  const pageIndex = input.current || 1;
  delete input.current;
  const url = `/v1/rooms?${objectToQueryString({ pageIndex, ...input })}`;
  return httpService.get<BaseResp<RoomBaseDto[]>>(url, { headers });
};

export const getRoomIdNames = (): Promise<BaseResp<RoomBaseDto[]>> => {
  const url = '/v1/room/id_names';
  return httpService.get<BaseResp<RoomBaseDto[]>>(url, { headers });
};
