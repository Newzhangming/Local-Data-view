'use client';

import { EyeOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { TaskDto, TaskReq } from '@/constants/task';
import { addTask, queryTasks } from '@/services/task';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const columns: ProColumns<TaskDto>[] = [
    {
      hideInSearch: true,
      title: '序号',
      render: (text, record, index) => `${index + 1}`,
    },
    {
      title: '项目名称',
      dataIndex: 'proj_name',
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
    },
    {
      title: '采集进度',
      dataIndex: 'status',
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '更新日期',
      dataIndex: 'updated_at',
      hideInSearch: true,
      renderText: (value) => dayjs(value).format('MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'options',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => (
        <a>
          <EyeOutlined />
          查看
        </a>
      ),
    },
  ];

  const [pageInfo, setPageInfo] = useState({
    current: 1,
    pageSize: Number(getStorage('listPageSize')) || 10,
  });
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>(null);
  const actionFormRef = useRef<ProFormInstance>(null);

  const { message } = App.useApp();

  const getRequestData = useCallback(
    async (params: TaskReq) => {
      setLoading(true);
      const input = { ...params, from: 'list' };
      return queryTasks(input).then((res) => {
        setLoading(false);
        if (res.msg !== 'success') {
          message.error(res.msg);
          return { data: [], success: false, total: 0 };
        }
        return { data: res.data, success: true, total: res.total };
      });
    },
    [loading],
  );

  return (
    <>
      <ProTable<TaskDto>
        loading={loading}
        columns={columns}
        actionRef={actionRef}
        request={getRequestData}
        rowKey="id"
        search={false}
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
        onReset={() => {
          actionRef.current?.reload();
        }}
        tooltip={undefined}
      />
      <ProForm
        submitter={{ searchConfig: { submitText: '添加' } }}
        formRef={actionFormRef}
        onFinish={async (values: { proj_name: string }) => {
          const result = await addTask(values);
          if (result.msg === 'success') {
            actionRef.current?.reload();
            actionFormRef.current?.resetFields();
          }
        }}
      >
        <ProFormText rules={[{ required: true, message: '请输入正确的项目名', min: 3, max: 30 }]} name="proj_name" label="项目名称" placeholder="请输入项目名称" />
      </ProForm>
    </>
  );
}
