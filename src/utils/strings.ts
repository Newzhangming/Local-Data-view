export function objectToQueryString(obj: { [key: string]: string | number | boolean }): string {
  delete obj.current;
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}
