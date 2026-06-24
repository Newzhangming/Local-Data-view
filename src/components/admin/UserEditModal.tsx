'use client';

import { useState, useEffect } from 'react';
import { User, UpdateUserReq } from '@/constants/admin';

export default function UserEditModal({
  visible,
  user,
  onClose,
  onSave,
}: {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (id: string, data: UpdateUserReq) => void;
}) {
  const [role, setRole] = useState<number>(1);
  const [status, setStatus] = useState<string>('active');

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setStatus(user.status);
    }
  }, [user]);

  if (!visible || !user) return null;

  const handleSubmit = () => {
    onSave(user.id, { role, status });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">编辑用户 - {user.name}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">角色</label>
            <select
              value={role}
              onChange={(e) => setRole(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value={1}>普通用户</option>
              <option value={2}>管理员</option>
              <option value={3}>超级管理员</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
              <option value="locked">锁定</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}