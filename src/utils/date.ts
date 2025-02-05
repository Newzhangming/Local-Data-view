import dayjs from 'dayjs';

export const MDHHmmss = (value: string) => (!value ? '' : dayjs(value).format('M-D HH:mm:ss'));
export const year2Sec = (value: string | Date | undefined) => (!value ? '' : dayjs(value).format('YYYY-MM-DD HH:mm:ss'));
