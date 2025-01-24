'use client';

import { EditTwoTone, EyeTwoTone } from '@ant-design/icons';
import type { ActionType, BaseQueryFilterProps, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Divider, theme } from 'antd';
import React, { ReactNode, useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { CompanyDto } from '@/constants/company';
import { CompanyReq } from '@/constants/dto';
import { queryCompanies } from '@/services/company';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const { token } = theme.useToken();
  const columns: ProColumns<CompanyDto>[] = [
    {
      title: '公司名',
      colSize: 1.6,
      dataIndex: 'name',
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
    },
    {
      title: '企业社会信用代码',
      dataIndex: 'social_credit_code',
      colSize: 1.6,
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
      title: '资质证书编号',
      dataIndex: 'cert_no',
      hideInSearch: true,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '发证日期',
      dataIndex: 'cert_date',
      valueType: 'date',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '证书过期于',
      dataIndex: 'cert_expire',
      valueType: 'date',
      hideInSearch: true,
      align: 'center',
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
          <a href={`./company/edit/${record.id}`}>
            编辑
            <EditTwoTone />
          </a>
          <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
          <a href={`./company/view/${record.id}`}>
            查看
            <EyeTwoTone />
          </a>
        </>
      ),
    },
  ];

  const [pageInfo, setPageInfo] = useState({
    current: 1,
    pageSize: Number(getStorage('listPageSize')) || 10,
  });
  const actionRef = useRef<ActionType>(null);
  const { message } = App.useApp();

  const getRequestData = useCallback(async (params: CompanyReq) => {
    const input = { ...params, from: 'list' };
    return queryCompanies(input).then((res) => {
      if (res.msg !== 'success') {
        message.error(res.msg);
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
      <ProTable<CompanyDto>
        columns={columns}
        actionRef={actionRef}
        request={getRequestData}
        rowKey="id"
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
