'use client';

import { ArrowDownOutlined, ArrowUpOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { ActionType, type BaseQueryFilterProps, ModalForm, ProColumns, ProFormText, ProTable } from '@ant-design/pro-components';
import { Avatar, Button, Divider, message, StepProps, Steps, Tag } from 'antd';
import React, { ReactNode, useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { TaskDto, TaskReq } from '@/constants/task';
import { addTask, queryTasks, updateTask } from '@/services/task';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const [messageApi, contextHolder] = message.useMessage();

  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: Number(getStorage('listPageSize')) || 10 });
  const [loading, setLoading] = useState(false);

  const actionRef = useRef<ActionType>(null);

  const onSort = (id: string, action: 'up' | 'down') => async () => {
    await updateTask({ id, action });
    actionRef.current?.reload();
  };

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
      title: '排序',
      dataIndex: 'sort',
      align: 'center',
      hideInSearch: true,
      copyable: false,
      ellipsis: false,
      render: (_, obj: TaskDto) => {
        return (
          <>
            <Avatar size={20} style={{ backgroundColor: '#ffbf00' }} icon={<ArrowUpOutlined onClick={onSort(obj.id, 'up')} />} />
            <Divider type={'vertical'} />
            <Avatar size={20} style={{ backgroundColor: '#00a2ae' }} icon={<ArrowDownOutlined onClick={onSort(obj.id, 'down')} />} />
          </>
        );
      },
    },
    {
      title: '采集账号',
      dataIndex: 'rpa_account',
      hideInSearch: true,
      copyable: false,
      ellipsis: false,
    },
    {
      title: '更新日期',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      hideInSearch: true,
      align: 'center',
    },
  ];

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

  const onAddTask = useCallback(async (params: { proj_name: string }) => {
    const result = await addTask(params);
    if (result?.msg === 'success') {
      messageApi.success('添加成功');
      actionRef.current?.reload();
    } else {
      messageApi.error(result?.msg || '添加失败');
    }
  }, []);

  const searchOptionRender = (searchConfig: Omit<BaseQueryFilterProps, 'submitter' | 'isForm'>, props: Omit<BaseQueryFilterProps, 'searchConfig'>, dom: ReactNode[]) => {
    const [reset, query] = dom;
    return [query, reset];
  };

  const toolBarRender = () => [
    <ModalForm
      layout={'horizontal'}
      title="添加项目"
      autoFocusFirstInput
      modalProps={{ destroyOnClose: true }}
      onFinish={onAddTask}
      submitTimeout={5000}
      trigger={<Button type="primary">添加项目</Button>}
    >
      <ProFormText rules={[{ required: true, message: '项目名长度3~70字符', min: 3, max: 70 }]} name="proj_name" label="项目名称" placeholder="请输入项目名称" />
    </ModalForm>,
  ];

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
        toolbar={{ title: '任务列表', subTitle: '可以使用「排序」来调整采集任务的优先级' }}
        toolBarRender={toolBarRender}
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
      />
    </>
  );
}
