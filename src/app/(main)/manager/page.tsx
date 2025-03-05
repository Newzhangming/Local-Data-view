'use client';

import { EditTwoTone, EyeTwoTone } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Divider, message, Tag, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { locale, pagination, search } from '@/components/table-props';
import { ManagerReq } from '@/constants/dto';
import { ManagerDto } from '@/constants/manager';
import { queryManagers } from '@/services/manager';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = theme.useToken();

  const certNameOptions = async () =>
    [
      '一级注册建造师',
      '一级注册建筑师',
      '一级注册结构工程师',
      '一级注册造价工程师',
      '二级注册建造师',
      '二级注册结构工程师',
      '二级注册造价工程师',
      '注册监理工程师',
      '注册公用设备工程师',
      '注册土木工程师',
    ].map((value) => ({ label: value, value }));
  const projCountOptions = async () => [2, 3, 5, 8].map((value) => ({ label: `${value}及以上`, value }));

  const renderTags = (len: number) => {
    let color = 'default';
    if (len > 5) color = 'green';
    else if (len > 3) color = 'orange';
    else if (len > 0) color = 'magenta';
    return <Tag color={color}>{len}</Tag>;
  };

  const renderStatus = (text: string) => {
    let color = 'default';
    if (text === '有效') color = 'green';
    else if (text === '注销') color = 'magenta';
    else text = '待查';
    return <Tag color={color}>{text}</Tag>;
  };

  const columns: ProColumns<ManagerDto>[] = [
    {
      title: '用人省份',
      dataIndex: 'province',
      hideInTable: true,
      order: 5,
      fieldProps: { popupMatchSelectWidth: false },
      request: async () => ['山东', '浙江', '北京', '湖南', '江西'].map((value) => ({ label: value, value })),
    },
    {
      title: '数据等级',
      dataIndex: 'data_level',
      hideInTable: true,
      order: 4,
      fieldProps: { popupMatchSelectWidth: false },
      request: async () => ['A', 'B', 'C', 'D'].map((value) => ({ label: value !== 'A' ? `${value}及以上` : value, value })),
    },
    {
      title: '注册专业',
      dataIndex: 'major',
      hideInTable: true,
      order: 4,
      fieldProps: { popupMatchSelectWidth: false },
      request: async () => ['建筑工程', '市政公用工程'].map((value) => ({ label: value, value })),
    },
    {
      title: '姓名',
      order: 10,
      dataIndex: 'name',
      fieldProps: { placeholder: '支持模糊搜索' },
      colSize: 0.9,
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      hideInSearch: true,
      copyable: false,
      ellipsis: false,
      align: 'center',
    },
    {
      title: '身份证号',
      colSize: 1.1,
      order: 9,
      dataIndex: 'id_card',
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '四库状态',
      order: 8,
      dataIndex: 'cert_status',
      renderText: (_, record: ManagerDto) => renderStatus(record?.cert_status),
    },
    {
      title: '注册轨迹',
      hideInSearch: true,
      align: 'center',
      renderText: (_, record: ManagerDto) => renderTags(record?.experiences?.length),
    },
    {
      title: '个人业绩',
      dataIndex: 'proj_count',
      fieldProps: { placeholder: '请选择个人业绩', popupMatchSelectWidth: false },
      colSize: 1.1,
      order: 7,
      hideInSearch: false,
      align: 'center',
      request: projCountOptions,
      sorter: (a, b) => a.proj_count - b.proj_count,
      renderText: (_, record: ManagerDto) => renderTags(record?.projects?.length),
    },
    {
      title: '证书名称',
      dataIndex: 'cert_name',
      fieldProps: { placeholder: '请选择资格证书名称' },
      // fieldProps: { popupMatchSelectWidth: false },
      colSize: 1.1,
      order: 6,
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
      request: certNameOptions,
    },
    {
      title: '注册编号',
      dataIndex: 'lending_no',
      hideInSearch: true,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '有效期至',
      dataIndex: 'valid_date',
      valueType: 'date',
      hideInSearch: true,
      copyable: false,
      ellipsis: false,
    },
    {
      title: '注册单位',
      dataIndex: 'lending_to',
      hideInSearch: true,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '更新日期',
      dataIndex: 'updated_at',
      hideInSearch: true,
      valueType: 'dateTime',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'options',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => (
        <>
          <a href={`/manager/edit/${record.id}`} target={'_blank'}>
            编辑
            <EditTwoTone />
          </a>
          <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
          <a href={`/manager/view/${record.id}`} target={'_blank'}>
            查看
            <EyeTwoTone />
          </a>
        </>
      ),
    },
  ];

  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: Number(getStorage('listPageSize')) || 10 });
  const actionRef = useRef<ActionType>(null);

  const getRequestData = useCallback(async (params: ManagerReq) => {
    const input = { ...params, from: 'list' };
    return queryManagers(input).then((res) => {
      if (res.msg === '鉴权码缺失') {
        messageApi.error(res.msg).then(() => {
          router.replace('/auth', { scroll: false });
        });
      } else if (res.msg !== 'success') {
        messageApi.error(res.msg);
        return { data: [], success: false, total: 0 };
      }
      return { data: res.data, success: true, total: res.total };
    });
  }, []);

  return (
    <>
      {contextHolder}
      <ProTable<ManagerDto>
        columns={columns}
        actionRef={actionRef}
        locale={locale}
        request={getRequestData}
        rowKey="name"
        search={search}
        toolBarRender={undefined}
        options={false}
        pagination={{
          ...pagination,
          pageSize: pageInfo.pageSize,
          onShowSizeChange: (_, pageSize) => {
            setPageInfo({ pageSize, current: 1 });
            setStorage('listPageSize', pageSize);
          },
        }}
        dateFormatter="string"
        onReset={actionRef.current?.reload}
        tooltip={undefined}
      />
    </>
  );
}
