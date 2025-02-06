'use client';

import { EditTwoTone, EyeTwoTone } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Divider, message, theme } from 'antd';
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
  const columns: ProColumns<ManagerDto>[] = [
    {
      title: '经理姓名',
      order: 10,
      dataIndex: 'name',
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
      title: '证书名称',
      dataIndex: 'cert_name',
      hideInSearch: true,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '注册单位',
      dataIndex: 'lending_to',
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '注册编号',
      dataIndex: 'lending_no',
      hideInSearch: false,
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
          <a href={`/manager/edit/${record.id}`}>
            编辑
            <EditTwoTone />
          </a>
          <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
          <a href={`/manager/view/${record.id}`}>
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
