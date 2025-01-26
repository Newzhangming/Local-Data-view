import dayjs from 'dayjs';

export const MDHHmmss = (value: string) => (!value ? '' : dayjs(value).format('M-D HH:mm:ss'));
