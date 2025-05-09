'use client';

import { EditTwoTone, EyeTwoTone } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Divider, message, Tag, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';

import { certNames, DataLevel, majors, projTypes, provinces } from './components/const';

import Copyable from '@/components/copyable';
import Ellipsis from '@/components/ellipsis';
import { beforeSearchSubmit, locale, pagination, search } from '@/components/table-props';
import { ManagerReq } from '@/constants/dto';
import { ManagerDto, SigningStatus, signingStatusMapping } from '@/constants/manager';
import { ManagerService } from '@/services/manager';
import { getStorage, setStorage } from '@/utils/storage';

const managerService = new ManagerService();

export default function Page() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = theme.useToken();

  const certNameOptions = async () => certNames.map((value) => ({ label: value, value }));
  const projCountOptions = async () => [2, 3, 5, 8].map((value) => ({ label: `${value}条及以上`, value }));
  const techKpiCountOptions = async () => [1, 2, 3, 5].map((value) => ({ label: `${value}条及以上`, value }));
  const certStatusOptions = async () => ['有效', '注销', '待查'].map((value) => ({ label: value, value }));
  const projTypeOptions = async () => projTypes.map((value) => ({ label: value, value }));
  const majorOptions = async () => majors.map((value) => ({ label: value, value }));

  const provinceOptions = async () => provinces.map((value) => ({ label: value, value }));

  const dataLevelCommon = {
    colSize: 0.9,
    hideInSearch: false,
    hideInTable: true,
    fieldProps: { popupMatchSelectWidth: false },
    request: async () => Object.keys(DataLevel).map((value) => ({ label: value !== 'A' ? `${value}及以上` : value, value })),
  };

  const renderTags = (len: number) => {
    let color = 'default';
    if (len > 5) color = 'green';
    else if (len > 3) color = 'orange';
    else if (len > 0) color = 'magenta';
    return <Tag color={color}>{len}</Tag>;
  };

  const renderStatus = (text: string) => {
    let color = 'default';
    if (text === '有效') color = 'green';
    else if (text === '注销') color = 'magenta';
    else text = '待查';
    return <Tag color={color}>{text}</Tag>;
  };

  const columns: ProColumns<ManagerDto>[] = [
    {
      title: '姓名',
      order: 10,
      dataIndex: 'name',
      fieldProps: { placeholder: '支持模糊搜索' },
      colSize: 0.9,
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
    },
    { title: '性别', dataIndex: 'gender', hideInSearch: true, copyable: false, ellipsis: false, align: 'center' },
    { title: '身份证号', colSize: 1.1, order: 10, dataIndex: 'id_card', hideInSearch: false, copyable: true, ellipsis: false },
    {
      title: '四库状态',
      order: 9,
      colSize: 0.9,
      dataIndex: 'cert_status',
      fieldProps: { placeholder: '有效/注销/待查', popupMatchSelectWidth: false },
      request: certStatusOptions,
      renderText: (_, record: ManagerDto) => renderStatus(record?.cert_status),
    },
    {
      title: '项目分类',
      dataIndex: 'proj_type',
      request: projTypeOptions,
      hideInTable: true,
      valueType: 'select',
      fieldProps: { placeholder: '请选择项目分类', popupMatchSelectWidth: false },
      colSize: 0.9,
      hideInSearch: false,
      copyable: false,
      ellipsis: false,
    },
    {
      title: '注册轨迹',
      align: 'center',
      valueType: 'select',
      dataIndex: 'exp_count',
      fieldProps: { placeholder: '请选择注册轨迹', popupMatchSelectWidth: false },
      order: 8,
      colSize: 0.9,
      request: projCountOptions,
      hideInSearch: false,
      renderText: (_, record: ManagerDto) => {
        const expCount = record.certs.reduce((acc, cert) => acc + cert?.experiences?.length || 0, 0);
        return renderTags(expCount);
      },
    },
    {
      title: '个人业绩',
      dataIndex: 'proj_count',
      fieldProps: { placeholder: '请选择个人业绩', popupMatchSelectWidth: false },
      colSize: 1.1,
      order: 7,
      hideInSearch: false,
      align: 'center',
      request: projCountOptions,
      sorter: (a, b) => a.proj_count - b.proj_count,
      renderText: (_, record: ManagerDto) => renderTags(record?.projects?.length),
    },
    {
      title: '技术指标',
      dataIndex: 'tech_kpi_count',
      fieldProps: { placeholder: '请选择技术指标', popupMatchSelectWidth: false },
      colSize: 0.9,
      order: 6,
      hideInSearch: false,
      align: 'center',
      request: techKpiCountOptions,
      sorter: (a, b) => a.tech_kpi_count - b.tech_kpi_count,
      renderText: (_, record: ManagerDto) => renderTags(record?.mgr_tech_kpis?.length),
    },
    {
      title: '证书名称',
      dataIndex: 'cert_name',
      fieldProps: { placeholder: '请选择资格证书名称', popupMatchSelectWidth: false },
      colSize: 1.1,
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
      // 要遍历把certs下的 cert_name 显示出来
      render: (_, record: ManagerDto) => {
        if (record?.certs?.length) {
          return record?.certs?.map((cert, index) => {
            return <Copyable key={index} content={cert?.cert_name} />;
          });
        } else {
          return <Copyable content={record?.cert_name} />;
        }
      },
      request: certNameOptions,
    },
    {
      title: '注册专业',
      dataIndex: 'major',
      request: majorOptions,
      valueType: 'select',
      fieldProps: { popupMatchSelectWidth: false },
      colSize: 0.9,
      hideInSearch: false,
      copyable: false,
      ellipsis: false,
      render: (_, record: ManagerDto) => {
        if (record?.certs?.length) {
          return record?.certs?.map((cert, index) => {
            const contents = [];
            for (let i = 1; i <= 5; i++) {
              const content = i === 1 ? cert.major : eval(`cert.major_${i}`);
              contents.push(<Copyable key={`${index}-${i}`} content={content} />);
            }
            return contents;
          });
        } else {
          return null;
        }
      },
    },
    {
      title: '注册省份',
      dataIndex: 'lending_province',
      valueType: 'select',
      fieldProps: { placeholder: '选择注册省份', popupMatchSelectWidth: false },
      request: provinceOptions,
      colSize: 0.9,
      hideInSearch: false,
      copyable: false,
      ellipsis: false,
    },
    { title: '注册单位', dataIndex: 'lending_to', hideInSearch: true, copyable: true, ellipsis: false },
    { title: '签约情况', dataIndex: 'signing_status', hideInSearch: true, copyable: false, ellipsis: false, renderText: (text: SigningStatus) => signingStatusMapping[text] },
    { title: '有效期至', dataIndex: 'valid_date', valueType: 'date', hideInSearch: true, copyable: false, ellipsis: false },
    { title: '数据等级', dataIndex: 'data_level', ...dataLevelCommon },
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
      render: (_, record) => (
        <>
          <a href={`/manager/edit/${record.id}`} target={'_blank'}>
            编辑
            <EditTwoTone />
          </a>
          <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
          <a href={`/manager/view/${record.id}`} target={'_blank'}>
            查看
            <EyeTwoTone />
          </a>
        </>
      ),
    },
  ];

  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: Number(getStorage('listPageSize')) || 10 });
  const actionRef = useRef<ActionType>(null);

  const getRequestData = useCallback(async (params: ManagerReq) => {
    const input = { ...params, from: 'list' };
    return managerService.queryManagers(input).then((res) => {
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
      <ProTable<ManagerDto>
        columns={columns}
        actionRef={actionRef}
        locale={locale}
        request={getRequestData}
        rowKey="id"
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
