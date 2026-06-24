'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { DashboardStats } from '@/constants/admin';
import StatCard from '@/components/admin/StatCard';
import { 
  UserOutlined, 
  UserAddOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined,
  ReloadOutlined  // 新增
} from '@ant-design/icons';

const adminService = new AdminService();

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 新增刷新状态

  const fetchDashboard = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await adminService.getDashboard();
      if (res.msg === 'success') {
        setStats(res.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);
  }, []);

  const handleRefresh = () => {
    fetchDashboard(false); // 不显示全屏加载，只显示按钮旋转
  };

  if (loading) {
    return <div className="flex justify-center py-12">加载统计...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">暂无数据</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">仪表板</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <ReloadOutlined className={`${refreshing ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<UserOutlined className="text-blue-500 text-2xl" />}
          title="总用户"
          value={stats.totalUsers}
          change={stats.todayNew > 0 ? `+${stats.todayNew} 今日` : '今日无新增'}
        />
        <StatCard
          icon={<UserAddOutlined className="text-green-500 text-2xl" />}
          title="昨日新增"
          value={stats.yesterdayNew}
        />
        <StatCard
          icon={<FileTextOutlined className="text-purple-500 text-2xl" />}
          title="总操作数"
          value={stats.totalLogs}
        />
        <StatCard
          icon={<ClockCircleOutlined className="text-orange-500 text-2xl" />}
          title="今日操作"
          value={stats.todayLogs}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">最近操作</h2>
        {stats.recentLogs.length === 0 ? (
          <div className="text-gray-400 text-center py-6">暂无操作记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="text-left py-2">用户</th>
                  <th className="text-left py-2">操作</th>
                  <th className="text-left py-2">目标</th>
                  <th className="text-left py-2">时间</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-2">{log.user_name}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2">{log.target || '-'}</td>
                    <td className="py-2 text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}