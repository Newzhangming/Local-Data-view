'use client';

import { EyeTwoTone } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { message, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { beforeSearchSubmit, locale, pagination } from '@/components/table-props';
import { PerformanceReq, PerformanceType } from '@/constants/project';
import { ProjectService } from '@/services/project';
import { validateProjectData } from '@/utils/performance';
import { getStorage, setStorage } from '@/utils/storage';

const service = new ProjectService();

export default function Page2() {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: Number(getStorage('listPageSize')) || 10 });
  const actionRef = useRef<ActionType>(null);

  const DataLevel = { A: 'green', B: 'orange', C: 'magenta', D: 'red' };

  const dataLevelCommon = {
    hideInSearch: false,
    hideInTable: true,
    fieldProps: { popupMatchSelectWidth: false },
    request: async () => Object.keys(DataLevel).map((value) => ({ label: value !== 'A' ? `${value}及以上` : value, value })),
  };

  const columns: ProColumns<PerformanceType>[] = [
    {
      title: '项目编号',
      dataIndex: 'proj_no',
      fieldProps: { placeholder: '完整项目编号' },
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '项目名称',
      dataIndex: 'proj_name',
      fieldProps: { placeholder: '支持模糊搜索' },
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} lines={2} />,
      align: 'left',
    },
    { title: '总面积(平方米)', dataIndex: 'total_area', hideInSearch: true, copyable: true, ellipsis: false, sorter: (a, b) => a.total_area - b.total_area },
    {
      title: '数据等级',
      dataIndex: 'data_level',
      ...dataLevelCommon,
      hideInTable: false,
      render: (_, record) => <Tag color={DataLevel[record.data_level as keyof typeof DataLevel]}>{record.data_level}</Tag>,
    },
    {
      title: '初步结论',
      hideInTable: false,
      render: (_, record) => {
        const data = validateProjectData(record);
        let color = data.isValid ? 'green' : 'red';
        if (data.message.includes('未批先建')) {
          color = 'orange';
        }
        return (
          <div>
            <Tag color={color}>{data.message}</Tag>
          </div>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'options',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => {
        return (
          <a className={'text-blue-500'} href={`/project/view/${record.proj_no}`} target={'_blank'}>
            查看
            <EyeTwoTone />
          </a>
        );
      },
    },
  ];

  const getRequestData = useCallback(async (params: PerformanceReq) => {
    const input = { ...params, keyword: params?.keyword || 'double_condition' };
    return service.performance(input).then((res) => {
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

  const titleElement = () => (
    <div className="text-lg font-normal">{`①基本信息和竣工等级B级以上；②两条业绩开工-竣工时间不重叠；③其中一条面积60000以上；④开工-竣工时间在施工单位注册轨迹内；⑤提示未批先建时间`}</div>
  );

  return (
    <>
      {contextHolder}
      <ProTable<PerformanceType>
        columns={columns}
        actionRef={actionRef}
        request={getRequestData}
        rowKey="id"
        title={titleElement}
        locale={locale}
        search={false}
        beforeSearchSubmit={beforeSearchSubmit}
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
