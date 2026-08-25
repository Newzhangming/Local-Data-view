// app/(main)/info/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Pagination,
  Input,
  DatePicker,
  Button,
  Space,
  Popconfirm,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { infoService } from '@/services/info.service';
import type { Info, InfoListQuery } from '@/constants/info';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function InfoPage() {
  // ---------- 状态 ----------
  const [list, setList] = useState<Info[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 分页
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 搜索条件
  const [source, setSource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 表单
  const [formSource, setFormSource] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formContent, setFormContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // ---------- 获取列表 ----------
  const fetchList = async () => {
    setLoading(true);
    try {
      const params: InfoListQuery = {
        pageIndex,
        pageSize,
        source: source || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const res = await infoService.queryInfos(params);

      let listData: Info[] = [];
      let totalCount = 0;

      const maybeData = (res as any).data;
      if (maybeData && typeof maybeData === 'object') {
        if (Array.isArray(maybeData.data)) {
          listData = maybeData.data;
          totalCount = maybeData.total || 0;
        } else if (Array.isArray(maybeData)) {
          listData = maybeData;
          totalCount = (res as any).total || maybeData.length;
        }
      } else if (Array.isArray((res as any).data)) {
        listData = (res as any).data;
        totalCount = (res as any).total || 0;
      }

      setList(listData);
      setTotal(totalCount);
    } catch (error) {
      console.error('获取信息列表失败:', error);
      setList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [pageIndex, pageSize, source, dateFrom, dateTo]);

  // ---------- 搜索/重置 ----------
  const handleSearch = () => setPageIndex(1);
  const handleReset = () => {
    setSource('');
    setDateFrom('');
    setDateTo('');
    setPageIndex(1);
  };

  // ---------- 表单操作 ----------
  const resetForm = () => {
    setFormSource('');
    setFormDate('');
    setFormContent('');
    setEditingId(null);
  };

  const handleEdit = (record: Info) => {
    setFormSource(record.source);
    setFormDate(record.date.slice(0, 10));
    setFormContent(record.content);
    setEditingId(record.id);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSave = async () => {
    if (!formSource.trim() || !formDate || !formContent.trim()) {
      message.warning('请填写完整信息');
      return;
    }
    const isoDate = new Date(formDate).toISOString();
    try {
      if (editingId) {
        await infoService.updateInfo(editingId, {
          source: formSource,
          date: isoDate,
          content: formContent,
        });
        message.success('更新成功');
      } else {
        await infoService.createInfo({
          source: formSource,
          date: isoDate,
          content: formContent,
        });
        message.success('添加成功');
      }
      resetForm();
      fetchList();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // ---------- 删除 ----------
  const handleDelete = async (id: string) => {
    try {
      await infoService.deleteInfo(id);
      message.success('删除成功');
      fetchList();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // ---------- 表格列 ----------
  const columns: ColumnsType<Info> = [
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 200,
      render: (value: string) => value || '-',
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 180,
      render: (value: string) =>
        value ? dayjs(value).format('YYYY-MM-DD') : '-',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (value: string) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {value || '-'}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: unknown, record: Info) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这条信息吗？"
            description="删除后无法恢复"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ---------- 分页 ----------
  const totalPages = Math.ceil(total / pageSize) || 1;

  // ---------- 渲染 ----------
  return (
    <div className="p-6 bg-white min-h-screen">
      {/* 页面标题 —— 移除了“新增信息”按钮 */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">📋 信息管理</h1>
        <p className="text-gray-500 mt-1">记录和管理信息内容</p>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-700">来源：</span>
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="请输入来源关键词"
            allowClear
            style={{ width: 200 }}
          />
          <span className="text-gray-700 ml-2">日期范围：</span>
          <RangePicker
            value={
              dateFrom && dateTo
                ? [dayjs(dateFrom), dayjs(dateTo)]
                : null
            }
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateFrom(dates[0].format('YYYY-MM-DD'));
                setDateTo(dates[1].format('YYYY-MM-DD'));
              } else {
                setDateFrom('');
                setDateTo('');
              }
            }}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </div>
      </div>

      {/* 新增/编辑表单 */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              来源 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formSource}
              onChange={(e) => setFormSource(e.target.value)}
              placeholder="请输入来源"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期 <span className="text-red-500">*</span>
            </label>
            <DatePicker
              style={{ width: '100%' }}
              value={formDate ? dayjs(formDate) : null}
              format="YYYY-MM-DD"
              placeholder="请选择日期"
              onChange={(date) =>
                setFormDate(date ? date.format('YYYY-MM-DD') : '')
              }
            />
          </div>
          <div className="flex-[3] min-w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内容 <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="请输入信息内容（支持多行）"
              autoSize={{ minRows: 3, maxRows: 8 }}
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              {editingId ? '更新' : '添加'}
            </Button>
            {editingId && (
              <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>
                取消
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <span className="text-gray-500">共 {total} 条</span>
          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            pageSizeOptions={['5', '10', '20', '50']}
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, size) => {
              setPageIndex(page);
              setPageSize(size);
            }}
          />
        </div>
      </div>
    </div>
  );
}