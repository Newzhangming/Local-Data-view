'use client';

import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { ActionType, type BaseQueryFilterProps, ProColumns, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { message, StepProps, Steps, Tag } from 'antd';
import React, { ReactNode, useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { TaskDto, TaskReq } from '@/constants/task';
import { addTask, queryTasks } from '@/services/task';

export default function Page() {
  const [messageApi, contextHolder] = message.useMessage();
  const columns: ProColumns<TaskDto>[] = [
    {
      title: '项目名称',
      dataIndex: 'proj_name',
      colSize: 2,
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
    },
    {
      title: '采集进度',
      dataIndex: 'processing',
      hideInSearch: true,
      copyable: true,
      ellipsis: false,
      render: (_, obj: TaskDto) => {
        const mapping: { [key: string]: string } = { proj_base: '基本信息', proj_wb: '招投标', proj_contract: '合同', proj_permit: '施工', proj_af: '验收' };
        const items: StepProps[] = Object.entries(obj).reduce((acc, [key, value]) => {
          const title = mapping[key];
          if (title) {
            acc.push({ title, status: value > 0 ? 'finish' : 'wait' });
          }
          return acc;
        }, [] as StepProps[]);
        return <Steps size="small" items={items} />;
      },
    },
    {
      title: '采集状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInSearch: false,
      copyable: false,
      ellipsis: false,
      request: async () => [
        { label: '未开始', value: '未开始' },
        { label: '采集中', value: '采集中' },
        { label: '已采完', value: '已采完' },
      ],
      render: (_, obj: TaskDto) => {
        if (obj.status === '未开始') {
          return (
            <Tag icon={<ClockCircleOutlined />} color="default">
              {obj.status}
            </Tag>
          );
        } else if (obj.status === '采集中') {
          return (
            <Tag icon={<SyncOutlined spin />} color="processing">
              {obj.status}
            </Tag>
          );
        } else if (obj.status === '已采完') {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              {obj.status}
            </Tag>
          );
        }
      },
    },
    {
      title: '更新日期',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      hideInSearch: true,
      align: 'center',
    },
  ];

  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: 6 });
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>(null);
  const actionFormRef = useRef<ProFormInstance>(null);

  const getRequestData = useCallback(
    async (params: TaskReq) => {
      setLoading(true);
      const input = { ...params, from: 'list' };
      return queryTasks(input).then((res) => {
        setLoading(false);
        if (res.msg !== 'success') {
          messageApi.error(res.msg);
          return { data: [], success: false, total: 0 };
        }
        return { data: res.data, success: true, total: res.total };
      });
    },
    [loading],
  );

  const searchOptionRender = (searchConfig: Omit<BaseQueryFilterProps, 'submitter' | 'isForm'>, props: Omit<BaseQueryFilterProps, 'searchConfig'>, dom: ReactNode[]) => {
    const [reset, query] = dom;
    return [query, reset];
  };

  return (
    <>
      {contextHolder}
      <ProTable<TaskDto>
        loading={loading}
        columns={columns}
        actionRef={actionRef}
        request={getRequestData}
        rowKey="proj_name"
        search={{ labelWidth: 'auto', span: 4, optionRender: searchOptionRender }}
        toolBarRender={undefined}
        options={false}
        pagination={{
          pageSizeOptions: [10, 15, 20, 25, 30],
          showQuickJumper: true,
          pageSize: pageInfo.pageSize,
          onShowSizeChange: (_, pageSize) => {
            setPageInfo({ pageSize, current: 1 });
            // setStorage('listPageSize', pageSize);
          },
        }}
        dateFormatter="string"
        onReset={actionRef.current?.reload}
        tooltip={undefined}
      />
      <ProForm
        submitter={{ searchConfig: { submitText: '添加' } }}
        formRef={actionFormRef}
        onFinish={async (values: { proj_name: string }) => {
          const result = await addTask(values);
          if (result?.msg === 'success') {
            messageApi.success('添加成功');
            actionRef.current?.reload();
            actionFormRef.current?.resetFields();
          } else {
            messageApi.error(result?.msg || '添加失败');
          }
        }}
      >
        <ProFormText rules={[{ required: true, message: '项目名长度3~70字符', min: 3, max: 70 }]} name="proj_name" label="项目名称" placeholder="请输入项目名称" />
      </ProForm>
    </>
  );
}
