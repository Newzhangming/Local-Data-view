'use client';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  PlusOutlined,
  RollbackOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { ActionType, type BaseQueryFilterProps, ModalForm, ProColumns, ProFormText, ProTable } from '@ant-design/pro-components';
import { Avatar, Button, Divider, message, Popconfirm, Space, StepProps, Steps, Tag, theme, Upload, UploadProps } from 'antd';
import React, { ReactNode, useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { TaskDto, TaskReq } from '@/constants/task';
import { addTask, queryTasks, updateTask } from '@/services/task';
import { MDHHmmss } from '@/utils/date';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = theme.useToken();

  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: Number(getStorage('listPageSize')) || 10 });
  const [loading, setLoading] = useState(false);

  const actionRef = useRef<ActionType>(null);

  const onUpdate = (id: string, action: 'up' | 'down' | 'reset') => async () => {
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
      copyable: false,
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
      minWidth: 74,
      align: 'center',
      hideInSearch: true,
      copyable: false,
      ellipsis: false,
      render: (_, obj: TaskDto) => {
        return (
          <>
            <Avatar size={20} style={{ backgroundColor: '#ffbf00' }} icon={<ArrowUpOutlined onClick={onUpdate(obj.id, 'up')} />} />
            <Divider type={'vertical'} />
            <Avatar size={20} style={{ backgroundColor: '#00a2ae' }} icon={<ArrowDownOutlined onClick={onUpdate(obj.id, 'down')} />} />
          </>
        );
      },
    },
    {
      title: '采集账号',
      dataIndex: 'rpa_account',
      hideInSearch: true,
      minWidth: 70,
      copyable: false,
      ellipsis: false,
    },
    {
      title: '添加日期',
      dataIndex: 'created_at',
      hideInSearch: true,
      align: 'center',
      renderText: (text: string) => MDHHmmss(text),
    },
    {
      title: '采集日期',
      dataIndex: 'updated_at',
      hideInSearch: true,
      align: 'center',
      renderText: (text: string) => MDHHmmss(text),
    },
    {
      title: '操作',
      dataIndex: 'options',
      hideInSearch: true,
      minWidth: 120,
      align: 'center',
      render: (_, record) => {
        const href = record.proj_no ? `./project/view/${record.proj_no}` : undefined;
        const viewIcon = record.proj_no ? <EyeTwoTone /> : <EyeInvisibleOutlined />;
        const linkClassName = record.proj_no ? 'text-blue-500' : 'text-gray-500 hover:text-gray-500';
        return (
          <>
            <Popconfirm placement="bottomRight" title={'重新采集吗？'} okText="确定" cancelText="取消" onConfirm={onUpdate(record.id, 'reset')}>
              <a>
                重采
                <RollbackOutlined />
              </a>
            </Popconfirm>
            <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
            <a className={linkClassName} href={href}>
              查看{viewIcon}
            </a>
          </>
        );
      },
    },
  ];

  const getRequestData = useCallback(async (params: TaskReq) => {
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
  }, []);

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

  const props: UploadProps = {
    name: 'file',
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        messageApi.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        messageApi.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const toolBarRender = () => [
    <ModalForm
      layout={'horizontal'}
      title="添加项目"
      autoFocusFirstInput
      modalProps={{ destroyOnClose: true }}
      onFinish={onAddTask}
      submitTimeout={5000}
      trigger={
        <Button type="primary" icon={<PlusOutlined />}>
          添加项目
        </Button>
      }
    >
      <ProFormText rules={[{ required: true, message: '项目名长度3~70字符', min: 3, max: 70 }]} name="proj_name" label="项目名称" placeholder="请输入项目名称" />
    </ModalForm>,
    <ModalForm
      layout={'horizontal'}
      title="导入项目"
      autoFocusFirstInput
      modalProps={{ destroyOnClose: true }}
      submitTimeout={5000}
      trigger={
        <Button type="default" icon={<UploadOutlined />}>
          点击上传
        </Button>
      }
    >
      <Upload {...props}>
        <Space>
          <Button type={'dashed'} icon={<DownloadOutlined />}>
            下载模板
          </Button>
          <Button type={'primary'} icon={<UploadOutlined />}>
            导入项目
          </Button>
        </Space>
      </Upload>
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
        rowKey="id"
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
