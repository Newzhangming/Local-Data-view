'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { AuditLog } from '@/constants/admin';
import { ReloadOutlined } from '@ant-design/icons';

const adminService = new AdminService();

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [actions, setActions] = useState<string[]>([]);

  const fetchLogs = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await adminService.listLogs({ userId, action, startDate, endDate, current, pageSize });
      if (res.msg === 'success') {
        setLogs(res.data);
        setTotal(res.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchActions = async () => {
    try {
      const res = await adminService.getActionTypes();
      if (res.msg === 'success') {
        setActions(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLogs(true);
    fetchActions();
  }, [current]);

  const handleFilter = () => {
    setCurrent(1);
    fetchLogs(false);
  };

  const handleRefresh = () => {
    fetchLogs(false);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">操作日志</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <ReloadOutlined className={`${refreshing ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="用户ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">所有操作</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            筛选
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3 text-left">时间</th>
                <th className="px-4 py-3 text-left">用户</th>
                <th className="px-4 py-3 text-left">操作</th>
                <th className="px-4 py-3 text-left">目标</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">详情</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">加载中...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">暂无日志</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{log.user_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">{log.target || '-'}</td>
                    <td className="px-4 py-3">{log.ip || '-'}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{log.detail || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}