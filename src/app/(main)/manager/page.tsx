'use client';

import { EditTwoTone, EyeTwoTone } from '@ant-design/icons';
import type { ActionType, BaseQueryFilterProps, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Divider, message, theme } from 'antd';
import React, { ReactNode, useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { Manager2Resp, ManagerReq } from '@/constants/dto';
import { queryManagers } from '@/services/manager';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = theme.useToken();
  const columns: ProColumns<Manager2Resp>[] = [
    {
      title: '姓名',
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
      copyable: true,
      ellipsis: false,
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
        <div>
          <a href={`./manager/edit/${record.id}`}>
            编辑
            <EditTwoTone />
          </a>
          <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
          <a href={`./manager/edit/${record.id}`}>
            查看
            <EyeTwoTone />
          </a>
        </div>
      ),
    },
  ];

  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: Number(getStorage('listPageSize')) || 10 });
  const actionRef = useRef<ActionType>(null);

  const getRequestData = useCallback(async (params: ManagerReq) => {
    const input = { ...params, from: 'list' };
    return queryManagers(input).then((res) => {
      if (res.msg !== 'success') {
        messageApi.error(res.msg);
        return { data: [], success: false, total: 0 };
      }
      return { data: res.data, success: true, total: res.total };
    });
  }, []);

  const searchOptionRender = (searchConfig: Omit<BaseQueryFilterProps, 'submitter' | 'isForm'>, props: Omit<BaseQueryFilterProps, 'searchConfig'>, dom: ReactNode[]) => {
    const [reset, query] = dom;
    return [query, reset];
  };

  return (
    <>
      {contextHolder}
      <ProTable<Manager2Resp>
        columns={columns}
        actionRef={actionRef}
        request={getRequestData}
        rowKey="name"
        search={{ labelWidth: 'auto', span: 4, optionRender: searchOptionRender }}
        toolBarRender={undefined}
        options={false}
        pagination={{
          pageSizeOptions: [10, 15, 20, 25, 30],
          showQuickJumper: true,
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
