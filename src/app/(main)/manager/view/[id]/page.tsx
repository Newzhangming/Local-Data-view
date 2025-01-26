'use client';

import { EyeTwoTone, HomeOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Breadcrumb, Descriptions, Divider, message, Space, Table, type TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Experience, ManagerDto } from '@/constants/manager';
import { queryManager } from '@/services/manager';

export default function ManagerEdit() {
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<ManagerDto>();

  useEffect(() => {
    getDetailData();
  }, []);

  const getDetailData = () => {
    setLoading(true);
    queryManager({ id: params.id as string })
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

  const columns: TableColumnsType<Experience> = [
    { title: '公司名称', dataIndex: ['company', 'name'] },
    { title: '注册时间', dataIndex: 'start_date', render: (value: string) => (!value ? '' : dayjs(value).format('YYYY-MM-DD')) },
    { title: '注销时间', dataIndex: 'end_date', render: (value: string) => (!value ? '' : dayjs(value).format('YYYY-MM-DD')) },
    { title: '变更信息', dataIndex: 'desc' },
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
      href: '/manager',
      title: (
        <>
          <UsergroupAddOutlined />
          <span>项目经理</span>
        </>
      ),
    },
    {
      title: (
        <>
          <EyeTwoTone />
          <span>查看</span>
        </>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Space direction={'vertical'} size={'large'}>
        <Breadcrumb items={breadcrumbItems} />
        <Descriptions title="项目经理信息">
          <Descriptions.Item label="经理姓名">{detail?.name || ''}</Descriptions.Item>
          <Descriptions.Item label="身份证">{detail?.id_card || ''}</Descriptions.Item>
          <Descriptions.Item label="性别">{detail?.gender || ''}</Descriptions.Item>
          <Descriptions.Item label="证书名称">{detail?.cert_name || ''}</Descriptions.Item>
          <Descriptions.Item label="证书状态">{detail?.cert_status || ''}</Descriptions.Item>
          <Descriptions.Item label="注册公司">{detail?.lending_to || ''}</Descriptions.Item>
          <Descriptions.Item label="注册编号">{detail?.lending_no || ''}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Table rowKey={'desc'} loading={loading} dataSource={detail?.experiences} columns={columns} pagination={false} />
      </Space>
    </>
  );
}
