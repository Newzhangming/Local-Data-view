'use client';

import { EditTwoTone, EyeTwoTone } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Divider, message, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { beforeSearchSubmit, locale, pagination, search } from '@/components/table-props';
import { CompanyDto } from '@/constants/company';
import { CompanyReq } from '@/constants/dto';
import { queryCompanies } from '@/services/company';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = theme.useToken();
  const columns: ProColumns<CompanyDto>[] = [
    {
      title: '公司名',
      colSize: 1.6,
      dataIndex: 'name',
      fieldProps: { placeholder: '支持模糊搜索' },
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
    },
    {
      title: '企业社会信用代码',
      dataIndex: 'social_credit_code',
      fieldProps: { placeholder: '输入完整代码' },
      colSize: 1.6,
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '证书名称',
      dataIndex: ['cert_name'],
      hideInSearch: true,
      copyable: true,
      ellipsis: false,
      renderText: (_, record: CompanyDto) => record.certificates?.[0]?.cert_name,
    },
    {
      title: '资质证书编号',
      dataIndex: ['cert_no'],
      hideInSearch: true,
      copyable: true,
      ellipsis: false,
      renderText: (_, record: CompanyDto) => record.certificates?.[0]?.cert_no,
    },
    {
      title: '发证日期',
      dataIndex: ['cert_date'],
      valueType: 'date',
      hideInSearch: true,
      align: 'center',
      renderText: (_, record: CompanyDto) => record.certificates?.[0]?.cert_date,
    },
    {
      title: '证书过期于',
      dataIndex: ['cert_expire'],
      valueType: 'date',
      hideInSearch: true,
      align: 'center',
      renderText: (_, record: CompanyDto) => record.certificates?.[0]?.cert_expire,
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
          <a href={`/company/edit/${record.id}`} target={'_blank'}>
            编辑
            <EditTwoTone />
          </a>
          <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
          <a href={`/company/view/${record.id}`} target={'_blank'}>
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

  const getRequestData = useCallback(async (params: CompanyReq) => {
    const input = { ...params, from: 'list' };
    return queryCompanies(input).then((res) => {
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
      <ProTable<CompanyDto>
        columns={columns}
        actionRef={actionRef}
        request={getRequestData}
        rowKey="id"
        locale={locale}
        search={search}
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
