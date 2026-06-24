'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { User, UpdateUserReq } from '@/constants/admin';
import UserEditModal from '@/components/admin/UserEditModal';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const adminService = new AdminService();

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await adminService.listUsers({ search, current, pageSize });
      if (res.msg === 'success') {
        setUsers(res.data);
        setTotal(res.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, [search, current]);

  const handleRefresh = () => {
    fetchUsers(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleSave = async (id: string, data: UpdateUserReq) => {
    try {
      await adminService.updateUser(id, data);
      await fetchUsers(false);
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      alert('更新失败');
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!confirm(`确认重置用户“${name}”的密码？`)) return;
    try {
      const res = await adminService.resetPassword(id);
      alert(`新密码：${res.data.newPassword}`);
    } catch (error) {
      console.error(error);
      alert('重置失败');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确认删除用户“${name}”？`)) return;
    try {
      await adminService.deleteUser(id);
      await fetchUsers(false);
    } catch (error) {
      console.error(error);
      alert('删除失败');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <ReloadOutlined className={`${refreshing ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="搜索用户名或手机号..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrent(1);
            }}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="px-6 py-3 text-left">用户名</th>
                <th className="px-6 py-3 text-left">手机号</th>
                <th className="px-6 py-3 text-left">角色</th>
                <th className="px-6 py-3 text-left">状态</th>
                <th className="px-6 py-3 text-left">最后登录</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">加载中...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">暂无用户</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{user.name}</td>
                    <td className="px-6 py-3">{user.phone || '-'}</td>
                    <td className="px-6 py-3">
                      {user.role === 1 && '普通'}
                      {user.role === 2 && '管理员'}
                      {user.role === 3 && '超级管理员'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        user.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'active' ? '启用' : user.status === 'inactive' ? '禁用' : '锁定'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.name)}
                        className="text-orange-600 hover:text-orange-800 mr-3"
                      >
                        重置密码
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500">共 {total} 条</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrent(p => Math.max(1, p - 1))}
                disabled={current === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-3 py-1">第 {current} / {totalPages} 页</span>
              <button
                onClick={() => setCurrent(p => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      <UserEditModal
        visible={modalVisible}
        user={editingUser}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
}