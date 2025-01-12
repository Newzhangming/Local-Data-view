export const getSkip = (index: string | number, size: number) => (getTake(index) - 1) * size;

export const getTake = (size: string | number) => {
  const result = parseInt(`${size}`, 10);
  return !result ? 10 : result;
};

export const getRandom = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomPhone = () => getRandom(13000000000, 19999999999);
export const getRandomSmsCode = () => getRandom(100000, 999999);

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const radLat1 = (lat1 * Math.PI) / 180.0;
  const radLat2 = (lat2 * Math.PI) / 180.0;
  const a = radLat1 - radLat2;
  const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10) / 10;
  return s;
};
