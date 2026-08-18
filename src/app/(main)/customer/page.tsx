'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerService } from '@/services/customer';
import { CustomerDto, CustomerListReq } from '@/constants/customer';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const customerService = new CustomerService();

export default function CustomerListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [total, setTotal] = useState(0);

  // ---------- 搜索 & 筛选状态 ----------
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterSalesperson, setFilterSalesperson] = useState('');
  const [filterReplyStatus, setFilterReplyStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [followUpFrom, setFollowUpFrom] = useState('');
  const [followUpTo, setFollowUpTo] = useState('');
  const [createdAtFrom, setCreatedAtFrom] = useState('');
  const [createdAtTo, setCreatedAtTo] = useState('');

  // ---------- 分页 ----------
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);

  // ---------- 下拉选项状态 ----------
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [salespersonOptions, setSalespersonOptions] = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  // ---------- 获取筛选下拉选项 ----------
  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        const res = await customerService.getFilterOptions();
        if (res.msg === 'success') {
          setCountryOptions(res.data.countries || []);
          setSalespersonOptions(res.data.salespersons || []);
        }
      } catch (error) {
        console.error('获取筛选选项失败', error);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  // ---------- 获取客户列表 ----------
  const fetchCustomers = async (params: CustomerListReq) => {
    setLoading(true);
    try {
      const res = await customerService.queryCustomers(params);
      if (res.msg === 'success') {
        setCustomers(res.data);
        setTotal(res.total || 0);
      } else {
        console.error('获取列表失败', res.msg);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ---------- 当任何筛选条件变化时重新加载 ----------
  useEffect(() => {
    fetchCustomers({
      current,
      pageSize,
      search: search.trim() || undefined,
      country: filterCountry || undefined,
      salesperson: filterSalesperson || undefined,
      reply_status: filterReplyStatus || undefined,
      level: filterLevel || undefined,
      follow_up_date_from: followUpFrom || undefined,
      follow_up_date_to: followUpTo || undefined,
      createdAtFrom: createdAtFrom || undefined,
      createdAtTo: createdAtTo || undefined,
    });
  }, [current, search, filterCountry, filterSalesperson, filterReplyStatus, filterLevel, followUpFrom, followUpTo, createdAtFrom, createdAtTo]);

  // ---------- 删除 ----------
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除客户“${name}”吗？`)) return;
    try {
      const res = await customerService.deleteCustomer({ id });
      if (res.msg === 'success') {
        if (customers.length === 1 && current > 1) setCurrent(current - 1);
        else fetchCustomers({ current, pageSize, search: search.trim() || undefined });
      } else {
        alert(res.msg);
      }
    } catch (error) {
      console.error(error);
      alert('删除失败');
    }
  };

  // ---------- 导出 ----------
  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { blob, filename } = await customerService.exportCustomers({
        search: search.trim() || undefined,
        country: filterCountry || undefined,
        salesperson: filterSalesperson || undefined,
        reply_status: filterReplyStatus || undefined,
        level: filterLevel || undefined,
        follow_up_date_from: followUpFrom || undefined,
        follow_up_date_to: followUpTo || undefined,
        createdAtFrom: createdAtFrom || undefined,
        createdAtTo: createdAtTo || undefined,
      });
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('导出数据格式异常');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 150);
    } catch (error) {
      console.error('导出失败', error);
      alert(error instanceof Error ? error.message : '导出失败，请检查网络或联系管理员');
    } finally {
      setExporting(false);
    }
  };

  // ---------- 映射 ----------
  const tierMap: Record<number, string> = {
    1: '一级',
    2: '二级',
    3: '三级',
    4: '四级',
    5: '五级',
    6: '六级',
    7: '七级',
    8: '八级',
    9: '九级',
    10: '十级',
  };

  const levelDisplay: Record<string, { label: string; className: string }> = {
    ONE:   { label: '⭐',   className: 'bg-gray-100 text-gray-600' },  
    TWO:   { label: '⭐⭐',  className: 'bg-cyan-100 text-cyan-700' },
    THREE: { label: '⭐⭐⭐', className: 'bg-yellow-100 text-yellow-800' },
    FOUR: { label: '⭐⭐⭐⭐', className: 'bg-blue-100 text-blue-800' },
    FIVE: { label: '⭐⭐⭐⭐⭐', className: 'bg-green-100 text-green-800' },
  };

  const stageDisplayMap: Record<string, { label: string; className: string }> = {
    '潜在客户': { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
    '已联系': { label: '已联系', className: 'bg-blue-100 text-blue-700' },
    '合格意向': { label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
    '已报价': { label: '已报价', className: 'bg-orange-100 text-orange-700' },
    '谈判中': { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
    '成交': { label: '成交', className: 'bg-green-100 text-green-700' },
    '丢失': { label: '丢失', className: 'bg-red-100 text-red-700' },
    '开发': { label: '开发', className: 'bg-indigo-100 text-indigo-700' },
    '询盘': { label: '询盘', className: 'bg-pink-100 text-pink-700' },
    '深度联系': { label: '深度联系', className: 'bg-amber-100 text-amber-700' },
    '成单': { label: '成单', className: 'bg-green-100 text-green-700' },
    'LEAD': { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
    'CONTACTED': { label: '已联系', className: 'bg-blue-100 text-blue-700' },
    'QUALIFIED': { label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
    'QUOTED': { label: '已报价', className: 'bg-orange-100 text-orange-700' },
    'NEGOTIATING': { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
    'WON': { label: '成交', className: 'bg-green-100 text-green-700' },
    'LOST': { label: '丢失', className: 'bg-red-100 text-red-700' },
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatFollowUp = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toISOString().split('T')[0];
  };

  const clearAllFilters = () => {
    setSearch('');
    setFilterCountry('');
    setFilterSalesperson('');
    setFilterReplyStatus('');
    setFilterLevel('');
    setFollowUpFrom('');
    setFollowUpTo('');
    setCreatedAtFrom('');
    setCreatedAtTo('');
    setCurrent(1);
  };

  // 等级选项（固定值）
  const levelOptions = [
    { value: 'ONE', label: '⭐' },
    { value: 'TWO',  label: '⭐⭐' },
    { value: 'THREE', label: '⭐⭐⭐' },
    { value: 'FOUR', label: '⭐⭐⭐⭐' },
    { value: 'FIVE', label: '⭐⭐⭐⭐⭐' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">客户管理</h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition shadow-sm"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {exporting ? '导出中...' : '导出'}
            </button>
            <button
              onClick={() => router.push('/customer/edit')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              新增客户
            </button>
          </div>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col gap-3">
            {/* 第一行：文本搜索 + 清除按钮 */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索客户名称、联系人、电话、邮箱、客户来源或备注..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrent(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
              >
                清除全部筛选
              </button>
            </div>

            {/* 第二行：下拉筛选器 + 时间范围 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 国家 */}
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-600 whitespace-nowrap">国家：</label>
                <select
                  value={filterCountry}
                  onChange={(e) => {
                    setFilterCountry(e.target.value);
                    setCurrent(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white min-w-[100px]"
                >
                  <option value="">全部</option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 业务员 */}
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-600 whitespace-nowrap">业务员：</label>
                <select
                  value={filterSalesperson}
                  onChange={(e) => {
                    setFilterSalesperson(e.target.value);
                    setCurrent(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white min-w-[100px]"
                >
                  <option value="">全部</option>
                  {salespersonOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* 回复状态 */}
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-600 whitespace-nowrap">回复状态：</label>
                <select
                  value={filterReplyStatus}
                  onChange={(e) => {
                    setFilterReplyStatus(e.target.value);
                    setCurrent(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white min-w-[100px]"
                >
                  <option value="">全部</option>
                  <option value="REPLIED">有回复</option>
                  <option value="NO_REPLY">无回复</option>
                </select>
              </div>

              {/* 等级 */}
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-600 whitespace-nowrap">等级：</label>
                <select
                  value={filterLevel}
                  onChange={(e) => {
                    setFilterLevel(e.target.value);
                    setCurrent(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white min-w-[100px]"
                >
                  <option value="">全部</option>
                  {levelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 跟进时间 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">跟进时间：</label>
                <input
                  type="date"
                  value={followUpFrom}
                  onChange={(e) => {
                    setFollowUpFrom(e.target.value);
                    setCurrent(1);
                  }}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onKeyDown={(e) => e.preventDefault()}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm cursor-pointer"
                />
                <span className="text-gray-400">至</span>
                <input
                  type="date"
                  value={followUpTo}
                  onChange={(e) => {
                    setFollowUpTo(e.target.value);
                    setCurrent(1);
                  }}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onKeyDown={(e) => e.preventDefault()}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm cursor-pointer"
                />
              </div>

              {/* 创建时间 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">创建时间：</label>
                <input
                  type="date"
                  value={createdAtFrom}
                  onChange={(e) => {
                    setCreatedAtFrom(e.target.value);
                    setCurrent(1);
                  }}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onKeyDown={(e) => e.preventDefault()}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm cursor-pointer"
                />
                <span className="text-gray-400">至</span>
                <input
                  type="date"
                  value={createdAtTo}
                  onChange={(e) => {
                    setCreatedAtTo(e.target.value);
                    setCurrent(1);
                  }}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onKeyDown={(e) => e.preventDefault()}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm cursor-pointer"
                />
              </div>

              {/* 快捷清除 */}
              {(filterCountry || filterSalesperson || filterReplyStatus || filterLevel || followUpFrom || followUpTo || createdAtFrom || createdAtTo || search) && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  清除所有
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 表格部分 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系人</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">业务员</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">国家</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">跟进时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">等级</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">阶段</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">层级</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-400">加载中...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const levelInfo = levelDisplay[c.level] || levelDisplay.THREE;
                    const stageInfo = c.stage
                      ? stageDisplayMap[c.stage] || { label: c.stage, className: 'bg-gray-100 text-gray-600' }
                      : null;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800 max-w-[150px] truncate">{c.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[100px] truncate">{c.contact_person || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[100px] truncate">{c.salesperson_name || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[120px] truncate">{c.email || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[100px] truncate">{c.country || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 whitespace-nowrap">{formatFollowUp(c.follow_up_date)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelInfo.className}`}>
                            {levelInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {stageInfo ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageInfo.className}`}>
                              {stageInfo.label}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tierMap[c.tier] || `第${c.tier}级`}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {/* ★★★ 查看按钮：新窗口打开 ★★★ */}
                            <button
                              onClick={() => window.open(`/customer/view/${c.id}`, '_blank')}
                              className="text-gray-400 hover:text-blue-600 transition"
                              title="查看"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => window.open(`/customer/edit/${c.id}`)}
                              className="text-gray-400 hover:text-amber-600 transition"
                              title="编辑"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id, c.name)}
                              className="text-gray-400 hover:text-red-600 transition"
                              title="删除"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                共 <span className="font-medium">{total}</span> 条记录
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrent(1)}
                  disabled={current === 1}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  首页
                </button>
                <button
                  onClick={() => setCurrent((p) => Math.max(1, p - 1))}
                  disabled={current === 1}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  上一页
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  第 {current} / {totalPages} 页
                </span>
                <button
                  onClick={() => setCurrent((p) => Math.min(totalPages, p + 1))}
                  disabled={current === totalPages}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  下一页
                </button>
                <button
                  onClick={() => setCurrent(totalPages)}
                  disabled={current === totalPages}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  末页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}