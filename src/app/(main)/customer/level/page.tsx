'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerService } from '@/services/customer';
import { CustomerDto } from '@/constants/customer';
import {
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const customerService = new CustomerService();

const stageDisplayMap: Record<string, { label: string; className: string }> = {
  '潜在客户': { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
  '已联系': { label: '已联系', className: 'bg-blue-100 text-blue-700' },
  '合格意向': { label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
  '已报价': { label: '已报价', className: 'bg-orange-100 text-orange-700' },
  '谈判中': { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
  '成交': { label: '成交', className: 'bg-green-100 text-green-700' },
  '丢失': { label: '丢失', className: 'bg-red-100 text-red-700' },
  'LEAD': { label: '潜在客户', className: 'bg-gray-100 text-gray-700' },
  'CONTACTED': { label: '已联系', className: 'bg-blue-100 text-blue-700' },
  'QUALIFIED': { label: '合格意向', className: 'bg-cyan-100 text-cyan-700' },
  'QUOTED': { label: '已报价', className: 'bg-orange-100 text-orange-700' },
  'NEGOTIATING': { label: '谈判中', className: 'bg-purple-100 text-purple-700' },
  'WON': { label: '成交', className: 'bg-green-100 text-green-700' },
  'LOST': { label: '丢失', className: 'bg-red-100 text-red-700' },
};

const getStageInfo = (stage: string | undefined) => {
  if (!stage) return null;
  return stageDisplayMap[stage] || { label: stage, className: 'bg-gray-100 text-gray-600' };
};

export default function TopLevelCustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [countries, setCountries] = useState<string[]>([]);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    const fetchTopLevel = async () => {
      try {
        const res = await customerService.queryCustomers({ parentId: 'null', pageSize: 100 });
        if (res.msg === 'success') {
          setCustomers(res.data);
          const uniqueCountries = Array.from(
            new Set(res.data.map((c) => c.country).filter(Boolean))
          ) as string[];
          setCountries(uniqueCountries.sort());
        } else {
          console.error('获取大客户失败', res.msg);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopLevel();
  }, []);

  // 过滤客户列表（国家 + 搜索）
  const filteredCustomers = customers.filter((customer) => {
    if (selectedCountry !== 'all' && customer.country !== selectedCountry) return false;
    if (countrySearch.trim() !== '') {
      const keyword = countrySearch.trim().toLowerCase();
      const customerCountry = customer.country?.toLowerCase() || '';
      if (!customerCountry.includes(keyword)) return false;
    }
    return true;
  });

  // 计算总页数
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;

  // 当前页数据
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

  // 当筛选条件变化时重置到第一页
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setCountrySearch(value);
    setCurrentPage(1);
  };

  // 页码跳转
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 如果当前页超出总页数，自动修正
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">大客户</h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="输入国家名称筛选..."
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {countries.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="countryFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  🌍 快速选择
                </label>
                <select
                  id="countryFilter"
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部国家</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(selectedCountry !== 'all' || countrySearch.trim() !== '') && (
            <div className="text-xs text-gray-500">
              当前筛选条件：
              {selectedCountry !== 'all' && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  国家 = {selectedCountry}
                </span>
              )}
              {countrySearch.trim() !== '' && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                  包含 “{countrySearch.trim()}”
                </span>
              )}
              <span className="ml-2 text-gray-400">
                （共 {filteredCustomers.length} 个客户）
              </span>
            </div>
          )}
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-gray-400 text-center py-12">
            {customers.length === 0 ? '暂无大客户' : '没有匹配的客户，请调整筛选条件'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCustomers.map((customer) => {
                const stageInfo = getStageInfo(customer.stage);
                return (
                  <div
                    key={customer.id}
                    onClick={() => {
                      if (customer.country) {
                        router.push(`/customer/tree/country/${encodeURIComponent(customer.country)}`);
                      } else {
                        router.push(`/customer/tree/${customer.id}`);
                      }
                    }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition cursor-pointer flex flex-col"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <BuildingOfficeIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{customer.name}</span>
                        </h3>
                        {customer.contact_person && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <UserIcon className="w-4 h-4 flex-shrink-0" />
                            {customer.contact_person}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">一级</span>
                        {stageInfo && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${stageInfo.className}`}>
                            {stageInfo.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      {customer.phone && (
                        <p className="flex items-center gap-1">
                          <PhoneIcon className="w-4 h-4 flex-shrink-0" /> {customer.phone}
                        </p>
                      )}
                      {customer.email && (
                        <p className="flex items-center gap-1">
                          <EnvelopeIcon className="w-4 h-4 flex-shrink-0" /> {customer.email}
                        </p>
                      )}
                      {customer.country && (
                        <p className="flex items-center gap-1 text-gray-600">
                          <GlobeAltIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                            {customer.country}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400 flex justify-end">
                      查看下级 →
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 分页控件 */}
            {filteredCustomers.length > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-500 hidden sm:block">
                  共 {filteredCustomers.length} 条，第 {currentPage} / {totalPages} 页
                </div>
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    上一页
                  </button>
                  {/* 页码数字（最多显示5个） */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum = i + 1;
                    // 如果总页数大于5，当前页在中间时调整显示
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-8 h-8 rounded-md text-sm transition ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    下一页
                  </button>
                </div>
                <div className="text-sm text-gray-500 hidden sm:block">
                  每页 {pageSize} 条
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}