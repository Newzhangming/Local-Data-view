export function setStorage(
  key: string,
  value: string | number | boolean,
  ttl = 15 * 24 * 3600 * 1000, // the half month
): void {
  const item = { value, expiry: Date.now() + ttl };
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(item));
  }
}

export function getStorage(key: string) {
  if (typeof window !== 'undefined') {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return null;

    const item = JSON.parse(rawValue);

    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item?.value || null;
  }
  return null;
}

export function removeStorage(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
}
