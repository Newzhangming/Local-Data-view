'use client';

import { BgColorsOutlined, HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Descriptions, message, Space, Table, type TableColumnsType } from 'antd';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import Copyable from '@/components/copyable';
import { locale } from '@/components/table-props';
import { Certificate, CompanyDto, ManagerDto } from '@/constants/company';
import { queryCompany } from '@/services/company';
import { year2Day } from '@/utils/date';

export default function CompanyEdit() {
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<CompanyDto>();

  useEffect(() => getDetailData(), []);

  const getDetailData = () => {
    setLoading(true);
    queryCompany({ id: params.id as string })
      .then((res) => {
        setLoading(false);
        if (res.msg === 'success') {
          setDetail(res.data);
        } else {
          messageApi.error(res.msg || '服务端错误', 5);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const certColumns: TableColumnsType<Certificate> = [
    { title: '序号', render: (text, record, index) => `${index + 1}` },
    { title: '资质类别', dataIndex: 'cert_type', render: (value: string) => <Copyable content={value} /> },
    { title: '资质证书号', dataIndex: 'cert_no', render: (value: string) => <Copyable content={value} /> },
    { title: '资质名称', dataIndex: 'cert_name', render: (value: string) => <Copyable content={value} /> },
    { title: '发证日期', dataIndex: 'cert_date', render: (value: string) => <Copyable content={year2Day(value)} /> },
    { title: '发证有效期', dataIndex: 'cert_expire', render: (value: string) => <Copyable content={year2Day(value)} /> },
    { title: '发证机关', dataIndex: 'cert_office', render: (value: string) => <Copyable content={value} /> },
  ];

  const managerColumns: TableColumnsType<ManagerDto> = [
    { title: '序号', render: (text, record, index) => `${index + 1}` },
    {
      title: '姓名',
      dataIndex: ['manager', 'name'],
      render: (value: string, record: ManagerDto) => <Copyable content={value} link={`/manager/view/${record.manager.id}`} />,
    },
    { title: '身份证', dataIndex: ['manager', 'id_card'], render: (value: string) => <Copyable content={value} /> },
    { title: '执业证书', dataIndex: ['manager', 'cert_name'], render: (value: string) => <Copyable content={value} /> },
  ];

  const breadcrumbItems = [
    {
      href: '/',
      title: (
        <>
          <HomeOutlined />
          <span>首页</span>
        </>
      ),
    },
    {
      href: '/company',
      title: (
        <>
          <BgColorsOutlined />
          <span>施工单位</span>
        </>
      ),
    },
    { title: <Copyable content={detail?.name} /> },
  ];

  const certTitle = () => <span className={'text-lg'}>企业资质资格</span>;
  const managerTitle = () => <span className={'text-lg'}>注册人员</span>;

  return (
    <>
      {contextHolder}
      <Space direction={'vertical'} size={'large'}>
        <Breadcrumb items={breadcrumbItems} />
        <Descriptions title="施工企业信息">
          <Descriptions.Item label="企业名">
            <Copyable content={detail?.name} link={`https://jzsc.mohurd.gov.cn/data/company?complexname=${detail?.name}`} />
          </Descriptions.Item>
          <Descriptions.Item label="企业社会信用代码">
            <Copyable content={detail?.social_credit_code} />
          </Descriptions.Item>
          <Descriptions.Item label="企业角色">
            <Copyable content={detail?.role_type} />
          </Descriptions.Item>
        </Descriptions>
        <Table title={certTitle} rowKey={'cert_no'} locale={locale} loading={loading} dataSource={detail?.certificates} columns={certColumns} pagination={false} />
        <Table title={managerTitle} rowKey={'name'} locale={locale} loading={loading} dataSource={detail?.managers} columns={managerColumns} pagination={false} />
      </Space>
    </>
  );
}
