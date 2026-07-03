// app/(main)/customer/top-level/page.tsx
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

// 阶段显示映射（支持中文和英文，自由文本）
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
  // 筛选相关状态
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    const fetchTopLevel = async () => {
      try {
        const res = await customerService.queryCustomers({ parentId: 'null', pageSize: 100 });
        if (res.msg === 'success') {
          setCustomers(res.data);
          // 提取唯一国家列表
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

  // 过滤客户：先按选中国家精确匹配，再按输入框模糊匹配（国家包含关键字，不区分大小写）
  const filteredCustomers = customers.filter((customer) => {
    // 1. 下拉选中国家过滤
    if (selectedCountry !== 'all' && customer.country !== selectedCountry) {
      return false;
    }
    // 2. 输入框关键字过滤（若为空则跳过）
    if (countrySearch.trim() !== '') {
      const keyword = countrySearch.trim().toLowerCase();
      const customerCountry = customer.country?.toLowerCase() || '';
      if (!customerCountry.includes(keyword)) {
        return false;
      }
    }
    return true;
  });

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
        {/* 标题 + 筛选区域 */}
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">大客户</h1>
          
          {/* 筛选器：输入框 + 下拉框 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* 手动输入框 */}
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="输入国家名称筛选..."
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 下拉选择框 */}
            {countries.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="countryFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  🌍 快速选择
                </label>
                <select
                  id="countryFilter"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
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

          {/* 显示当前筛选状态（可选） */}
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

        {/* 客户卡片列表 */}
        {filteredCustomers.length === 0 ? (
          <div className="text-gray-400 text-center py-12">
            {customers.length === 0
              ? '暂无大客户'
              : `没有匹配的客户，请调整筛选条件`}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => {
              const stageInfo = getStageInfo(customer.stage);
              return (
                <div
                  key={customer.id}
                  onClick={() => router.push(`/customer/tree/${customer.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition cursor-pointer flex flex-col"
                >
                  {/* 顶部：名称 + 标签 */}
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

                  {/* 联系方式 + 国家 */}
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
        )}
      </div>
    </div>
  );
}