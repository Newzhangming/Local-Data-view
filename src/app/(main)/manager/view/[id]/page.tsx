'use client';

import { EyeTwoTone, HomeOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Breadcrumb, Descriptions, Divider, message, Space, Table, type TableColumnsType, Typography } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const { Paragraph } = Typography;

import { locale } from '@/components/table-props';
import { Experience, ManagerDto } from '@/constants/manager';
import { queryManager } from '@/services/manager';
import { year2Sec } from '@/utils/date';

export default function ManagerView() {
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
    { title: '公司名称', dataIndex: ['company', 'name'], render: (value: string) => <Paragraph copyable>{value || ''}</Paragraph> },
    { title: '注册时间', dataIndex: 'start_date', render: (value: string) => (!value ? '' : dayjs(value).format('YYYY-MM-DD')) },
    { title: '注销时间', dataIndex: 'end_date', render: (value: string) => (!value ? '' : dayjs(value).format('YYYY-MM-DD')) },
    { title: '变更信息', dataIndex: 'desc', render: (value: string) => <Paragraph copyable>{value || ''}</Paragraph> },
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
          <span>{detail?.name || '查看'}</span>
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
          <Descriptions.Item label="经理姓名">
            <Paragraph copyable={{ text: detail?.name }}>
              <a href={`https://jzsc.mohurd.gov.cn/data/person?complexname=${detail?.name}`} target={'_blank'} title={'跳转至四库一平台'}>
                {detail?.name || ''}
              </a>
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="身份证">
            <Paragraph copyable>{detail?.id_card || ''}</Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="性别">{detail?.gender || ''}</Descriptions.Item>
          <Descriptions.Item label="证书名称">
            <Paragraph copyable>{detail?.cert_name || ''}</Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="证书状态">{detail?.cert_status || ''}</Descriptions.Item>
          <Descriptions.Item label="注册公司">
            <Paragraph copyable>{detail?.lending_to || ''}</Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="注册编号">
            <Paragraph copyable>{detail?.lending_no || ''}</Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">{year2Sec(detail?.updated_at)}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Table bordered rowKey={'desc'} locale={locale} loading={loading} dataSource={detail?.experiences} columns={columns} pagination={false} />
      </Space>
    </>
  );
}
