'use client';

import { Descriptions, Divider, message, Table, type TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Certificate, CompanyDto, ManagerDto } from '@/constants/company';
import { queryCompany } from '@/services/company';

export default function CompanyEdit() {
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<CompanyDto>();

  useEffect(() => {
    getDetailData();
  }, []);

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
    { title: '资质类别', dataIndex: 'cert_type' },
    { title: '资质证书号', dataIndex: 'cert_no' },
    { title: '资质名称', dataIndex: 'cert_name' },
    { title: '发证日期', dataIndex: 'cert_date', render: (value: string) => (!value ? '' : dayjs(value).format('YYYY-MM-DD')) },
    { title: '发证有效期', dataIndex: 'cert_expire', render: (value: string) => (!value ? '' : dayjs(value).format('YYYY-MM-DD')) },
    { title: '发证机关', dataIndex: 'cert_office' },
  ];

  const managerColumns: TableColumnsType<ManagerDto> = [
    { title: '项目姓名', dataIndex: ['manager', 'name'] },
    { title: '身份证', dataIndex: ['manager', 'id_card'] },
    { title: '执业证书', dataIndex: ['manager', 'cert_name'] },
  ];

  return (
    <>
      {contextHolder}
      <Descriptions title="施工企业信息">
        <Descriptions.Item label="企业名">{detail?.name || ''}</Descriptions.Item>
        <Descriptions.Item label="企业社会信用代码">{detail?.social_credit_code || ''}</Descriptions.Item>
        <Descriptions.Item label="企业角色">{detail?.role_type || ''}</Descriptions.Item>
      </Descriptions>
      <Divider />
      <Table rowKey={'cert_no'} loading={loading} dataSource={detail?.certificates} columns={certColumns} pagination={false} />
      <Divider />
      <Table rowKey={'name'} loading={loading} dataSource={detail?.managers} columns={managerColumns} pagination={false} />
    </>
  );
}
