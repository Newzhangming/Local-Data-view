'use client';

import { EditTwoTone, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Divider, message, Tag, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { beforeSearchSubmit, locale, pagination, search } from '@/components/table-props';
import { ProjectDto, ProjectReq } from '@/constants/dto';
import { getProjects } from '@/services/project';
import { getStorage, setStorage } from '@/utils/storage';

export default function ProjectList() {
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: Number(getStorage('listPageSize')) || 10 });
  const actionRef = useRef<ActionType>(null);

  const DataLevel = { A: 'green', B: 'orange', C: 'magenta', D: 'red' };
  const conclusions = { pass: { text: '通过', color: 'green' }, pending: { text: '待补充材料', color: 'magenta' }, scrap: { text: '废弃', color: 'red' } };
  const conclusionOptions = async () => Object.keys(conclusions).map((value) => ({ label: conclusions[value as keyof typeof conclusions].text, value }));
  const projTypes = ['市政工程', '房屋建筑工程', '其他', '化工石化医药工程', '电力工程', '机电工程', '冶金工程', '煤炭矿山工程', '商物粮工程'];
  const projTypeOptions = async () => projTypes.map((value) => ({ label: value, value }));

  const dateLogics = [
    { label: '合规', value: 1 },
    { label: '错误', value: -1 },
    { label: '待查', value: 0 },
  ];

  const dataLevelCommon = {
    colSize: 0.9,
    hideInSearch: false,
    hideInTable: true,
    fieldProps: { popupMatchSelectWidth: false },
    request: async () => Object.keys(DataLevel).map((value) => ({ label: value !== 'A' ? `${value}及以上` : value, value })),
  };

  const columns: ProColumns<ProjectDto>[] = [
    {
      title: '项目编号',
      order: 9,
      colSize: 1.1,
      dataIndex: 'proj_no',
      fieldProps: { placeholder: '完整项目编号' },
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '项目名称',
      order: 10,
      colSize: 1.9,
      dataIndex: 'proj_name',
      fieldProps: { placeholder: '支持模糊搜索' },
      width: 500,
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} lines={2} />,
      align: 'left',
    },
    {
      title: '项目分类',
      dataIndex: 'proj_type',
      valueType: 'select',
      fieldProps: { popupMatchSelectWidth: false },
      colSize: 0.9,
      request: projTypeOptions,
      hideInSearch: false,
      copyable: false,
      ellipsis: false,
    },
    { title: '工程用途', dataIndex: 'proj_use', valueType: 'text', fieldProps: { placeholder: '支持模糊搜索' }, order: 8, hideInSearch: false, copyable: false, ellipsis: false },
    { title: '总面积(平方米)', dataIndex: 'total_area', hideInSearch: true, copyable: true, ellipsis: false, sorter: (a, b) => a.total_area - b.total_area },
    {
      title: '项目结论',
      dataIndex: 'conclusion',
      hideInSearch: false,
      copyable: false,
      ellipsis: false,
      colSize: 0.9,
      valueType: 'select',
      fieldProps: { popupMatchSelectWidth: false },
      request: conclusionOptions,
      render: (_, record) => {
        const text = conclusions[record.conclusion as keyof typeof conclusions]?.text;
        if (!text) return null;
        const color = conclusions[record.conclusion as keyof typeof conclusions]?.color;
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '单体个数',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => {
        let color = 'default';
        const len = record?.proj_units?.length || 0;
        if (len > 5) color = 'green';
        else if (len > 3) color = 'orange';
        else if (len > 0) color = 'magenta';
        return <Tag color={color}>{len}</Tag>;
      },
    },
    {
      title: '日期逻辑',
      dataIndex: 'date_logic',
      valueType: 'select',
      colSize: 0.9,
      fieldProps: { popupMatchSelectWidth: false },
      hideInSearch: false,
      copyable: false,
      ellipsis: false,
      request: async () => dateLogics,
      render: (_, record) => {
        let color = 'default';
        let text = '待查';
        switch (record?.date_logic) {
          case 1:
            color = 'green';
            text = '合规';
            break;
          case -1:
            color = 'red';
            text = '错误';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '数据等级',
      dataIndex: 'data_level',
      ...dataLevelCommon,
      hideInTable: false,
      render: (_, record) => <Tag color={DataLevel[record.data_level as keyof typeof DataLevel]}>{record.data_level}</Tag>,
    },
    { title: '招投标数据等级', dataIndex: 'wb_data_level', ...dataLevelCommon },
    { title: '合同数据等级', dataIndex: 'contract_data_level', ...dataLevelCommon },
    { title: '施工许可数据等级', dataIndex: 'cp_data_level', ...dataLevelCommon },
    { title: '竣工数据等级', dataIndex: 'af_data_level', ...dataLevelCommon },
    { title: '技术指标数据等级', dataIndex: 'tech_data_level', ...dataLevelCommon },
    { title: '更新日期', dataIndex: 'updated_at', hideInSearch: true, valueType: 'dateTime', align: 'center' },
    {
      title: '操作',
      dataIndex: 'options',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => {
        const href = record.proj_no ? `/project/view/${record.proj_no}` : undefined;
        const viewIcon = record.proj_no ? <EyeTwoTone /> : <EyeInvisibleOutlined />;
        const linkClassName = record.proj_no ? 'text-blue-500' : 'text-gray-500 hover:text-gray-500';
        return (
          <>
            <a href={`/project/edit/${record.proj_no}`} target={'_blank'}>
              编辑
              <EditTwoTone />
            </a>
            <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
            <a className={linkClassName} href={href} target={'_blank'}>
              查看{viewIcon}
            </a>
          </>
        );
      },
    },
  ];

  const getRequestData = useCallback(async (params: ProjectReq) => {
    return getProjects(params).then((res) => {
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
      <ProTable<ProjectDto>
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
