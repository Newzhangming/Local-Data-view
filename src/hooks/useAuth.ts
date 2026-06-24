import { useEffect, useState } from 'react';
import { getStorage } from '@/utils/storage';
import { User } from '@/constants/admin';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStorage('token');
    if (token) {
      // 从 token 中解析用户信息（假设 JWT payload 包含 id, name, role）
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          name: payload.name,
          role: payload.role,
          // 其他字段可能缺失，只取必要的
        } as User);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  return { user, loading, isAdmin: user?.role >= 2 };
}