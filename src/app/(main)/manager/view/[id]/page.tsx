'use client';

import { HomeOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Breadcrumb, Descriptions, message, Space, Table, TableColumnsType, TableProps } from 'antd';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import Copyable from '@/components/copyable';
import Ellipsis from '@/components/ellipsis';
import { locale } from '@/components/table-props';
import { Experience, ManagerDto, Project } from '@/constants/manager';
import { queryManager } from '@/services/manager';
import { year2Day, year2Sec } from '@/utils/date';

export default function ManagerView() {
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<ManagerDto>();

  useEffect(() => getDetailData(), []);

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

  const experienceColumns: TableProps<Experience>['columns'] = [
    { title: '序号', render: (text, record, index) => `${index + 1}` },
    {
      title: '公司名称',
      render: (_, record: Experience) => <Copyable content={record.company.name} link={`/manager/view/${record.company.id}`} />,
    },
    { title: '注册时间', dataIndex: 'start_date', render: (value: string) => year2Day(value) },
    { title: '注销时间', dataIndex: 'end_date', render: (value: string) => year2Day(value) },
    { title: '变更信息', dataIndex: 'desc', render: (value: string) => <Copyable content={value} /> },
  ];

  const projectColumns: TableColumnsType<Project> = [
    { title: '序号', render: (text, record, index) => `${index + 1}` },
    {
      title: '项目名称',
      dataIndex: ['proj_name'],
      render: (_, record: Project) => <Copyable content={record.proj_name} link={`/project/view/${record.proj_no}`} />,
    },
    {
      title: '项目编号',
      render: (_, record: Project) => <Copyable content={record.proj_no} link={`/project/view/${record.proj_no}`} target={'_blank'} />,
    },
    { title: '项目属地', dataIndex: 'region', render: (value: string) => <Copyable content={value} /> },
    {
      title: '开工日期',
      render: (_, record: Project) => year2Day(record?.acceptance_filings?.[0]?.proj_start_date),
    },
    {
      title: '竣工日期',
      render: (_, record: Project) => year2Day(record?.acceptance_filings?.[0]?.af_date),
    },
    { title: '建设规模', dataIndex: 'scale_desc', width: 400, render: (value: string) => <Ellipsis text={value} /> },
    { title: '数据等级', dataIndex: 'data_level', render: (value: string) => <Copyable content={value} /> },
    { title: '技术指标', render: (_, record: Project) => (record?.proj_tech_kpis?.length ? '有' : '无') },
    {
      title: '操作',
      render: (_, record: Project) => (
        <a href={`/project/edit/${record.proj_no}`} target={'_blank'}>
          添加项目备注
        </a>
      ),
    },
  ];

  const dataSource: Project[] = detail?.projects?.filter((item) => item.project)?.map((item) => item.project) ?? [];

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
    { title: <Copyable content={detail?.name} /> },
  ];

  return (
    <>
      {contextHolder}
      <Space direction={'vertical'} size={'large'}>
        <Breadcrumb items={breadcrumbItems} />
        <Descriptions title="项目经理信息">
          <Descriptions.Item label="姓名">
            <Copyable content={detail?.name} link={!detail?.source_id ? `https://jzsc.mohurd.gov.cn/data/person?complexname=${detail?.name}` : ''} target={'_blank'} />
          </Descriptions.Item>
          <Descriptions.Item label="身份证">
            <Copyable content={detail?.id_card} />
          </Descriptions.Item>
          <Descriptions.Item label="性别">
            <Copyable content={detail?.gender} />
          </Descriptions.Item>
          <Descriptions.Item label="四库地址">
            <Copyable content={detail?.source_id} link={`https://jzsc.mohurd.gov.cn/data/person/detail?id=${detail?.source_id}`} target={'_blank'} />
          </Descriptions.Item>
          <Descriptions.Item label="证书名称">
            <Copyable content={detail?.cert_name} />
          </Descriptions.Item>
          <Descriptions.Item label="证书状态">
            <Copyable content={detail?.cert_status} />
          </Descriptions.Item>
          <Descriptions.Item label="注册公司">
            <Copyable content={detail?.lending_to} />
          </Descriptions.Item>
          <Descriptions.Item label="注册编号">
            <Copyable content={detail?.lending_no} />
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">{year2Sec(detail?.updated_at)}</Descriptions.Item>
        </Descriptions>
        <Table
          title={() => <span className={'text-lg'}>执业注册信息</span>}
          bordered
          rowKey={'desc'}
          locale={locale}
          loading={loading}
          dataSource={detail?.experiences}
          columns={experienceColumns}
          pagination={false}
        />
        <Table
          title={() => <span className={'text-lg'}>个人工程业绩</span>}
          bordered
          rowKey={'id'}
          locale={locale}
          loading={loading}
          dataSource={dataSource}
          columns={projectColumns}
          pagination={false}
        />
      </Space>
    </>
  );
}
