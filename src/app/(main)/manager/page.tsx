'use client';

import { EyeOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Descriptions, Divider, Drawer, Table } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { Manager2Resp, ManagerReq, ProjectDto } from '@/constants/dto';
import { ProjectDetailDto } from '@/constants/project';
import { queryManagers } from '@/services/manager';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentItem, setCurrentItem] = useState<ProjectDto>();
  const [detail, setDetail] = useState<ProjectDetailDto>();

  const columns: ProColumns<Manager2Resp>[] = [
    {
      hideInSearch: true,
      title: '序号',
      render: (text, record, index) => `${index + 1}`,
    },
    {
      title: '经理姓名',
      dataIndex: 'name',
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
    },
    {
      title: '身份证号',
      dataIndex: 'id_card',
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '证书名称',
      dataIndex: 'cert_name',
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

  const unitColumns = [
    { title: '单体建（构）筑物名称', dataIndex: 'unit_name', key: 'unit_name' },
    { title: '工程总造价(万元)', dataIndex: 'unit_cost', key: 'unit_cost' },
    { title: '建筑面积(平方米)', dataIndex: 'unit_area', key: 'unit_area' },
  ];
  const unitDataSource = detail?.proj_units?.map((item, index) => {
    return { key: `${index}`, ...item };
  });

  const [pageInfo, setPageInfo] = useState({
    current: 1,
    pageSize: Number(getStorage('listPageSize')) || 10,
  });
  const actionRef = useRef<ActionType>(null);
  const { message } = App.useApp();

  const getRequestData = useCallback(async (params: ManagerReq) => {
    const input = { ...params, from: 'list' };
    return queryManagers(input).then((res) => {
      if (res.msg !== 'success') {
        message.error(res.msg);
        return { data: [], success: false, total: 0 };
      }
      return { data: res.data, success: true, total: res.total };
    });
  }, []);

  return (
    <>
      <ProTable<Manager2Resp>
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
      <Drawer closable destroyOnClose title={<p>{currentItem?.proj_name || '项目名称'}</p>} placement="right" open={open} loading={loading} width={'70%'} onClose={() => setOpen(false)}>
        <Descriptions title="工程基本信息">
          <Descriptions.Item label="项目编号">{currentItem?.proj_no || ''}</Descriptions.Item>
          <Descriptions.Item label="数据等级">{currentItem?.data_level || ''}</Descriptions.Item>
          <Descriptions.Item label="项目分类">{currentItem?.proj_type || ''}</Descriptions.Item>
          <Descriptions.Item label="总面积(平方米)">{currentItem?.total_area || ''}</Descriptions.Item>
          <Descriptions.Item label="项目地址">{detail?.address || ''}</Descriptions.Item>
          <Descriptions.Item label="项目用途">{detail?.proj_use || ''}</Descriptions.Item>
          <Descriptions.Item label="建设规模">{detail?.scale_desc || ''}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <div className={'text-base font-semibold my-5'}>工程单体信息</div>
        <Table pagination={false} dataSource={unitDataSource} columns={unitColumns} />
        <Divider />
        <Descriptions title="招投标信息">
          <Descriptions.Item label="中标通知书编号">{detail?.winning_bidder?.[0]?.wb_no || ''}</Descriptions.Item>
          <Descriptions.Item label="数据等级">{detail?.winning_bidder?.[0]?.data_level || ''}</Descriptions.Item>
          <Descriptions.Item label="中标日期">{dayjs(detail?.winning_bidder?.[0]?.wb_date).format('YYYY-MM-DD') || ''}</Descriptions.Item>
          <Descriptions.Item label="招标类型">{detail?.winning_bidder?.[0]?.tender_type || ''}</Descriptions.Item>
          <Descriptions.Item label="中标金额(万)">{detail?.winning_bidder?.[0]?.wb_amount || 0}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions title="合同登记信息">
          <Descriptions.Item label="项目编号">{currentItem?.proj_no || ''}</Descriptions.Item>
          <Descriptions.Item label="数据等级">{currentItem?.data_level || ''}</Descriptions.Item>
          <Descriptions.Item label="发证日期">{dayjs(detail?.construction_permits?.[0]?.cp_date).format('YYYY-MM-DD') || ''}</Descriptions.Item>
          <Descriptions.Item label="项目分类">{currentItem?.proj_type || ''}</Descriptions.Item>
          <Descriptions.Item label="总面积(平方米)">{currentItem?.total_area || ''}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions title="施工许可">
          <Descriptions.Item label="施工许可编号">{detail?.construction_permits?.[0]?.cp_no || ''}</Descriptions.Item>
          <Descriptions.Item label="数据等级">{detail?.construction_permits?.[0]?.data_level || ''}</Descriptions.Item>
          <Descriptions.Item label="发证日期">{dayjs(detail?.construction_permits?.[0]?.cp_date).format('YYYY-MM-DD') || ''}</Descriptions.Item>
          <Descriptions.Item label="项目分类">{currentItem?.proj_type || ''}</Descriptions.Item>
          <Descriptions.Item label="总面积(平方米)">{detail?.construction_permits?.[0]?.cp_area || 0}</Descriptions.Item>
          <Descriptions.Item label="金额(万)">{detail?.construction_permits?.[0]?.cp_amount || 0}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions title="竣工验收备案">
          <Descriptions.Item label="竣工验收备案编号">{detail?.acceptance_filings?.[0]?.af_no || ''}</Descriptions.Item>
          <Descriptions.Item label="数据等级">{detail?.acceptance_filings?.[0]?.data_level || ''}</Descriptions.Item>
          <Descriptions.Item label="实际开工日期">{dayjs(detail?.acceptance_filings?.[0]?.proj_start_date).format('YYYY-MM-DD') || ''}</Descriptions.Item>
          <Descriptions.Item label="竣工验收备案日期">{dayjs(detail?.acceptance_filings?.[0]?.af_date).format('YYYY-MM-DD') || ''}</Descriptions.Item>
          <Descriptions.Item label="实际面积(平方米)">{currentItem?.total_area || ''}</Descriptions.Item>
          <Descriptions.Item label="实际造价(万)">{detail?.acceptance_filings?.[0]?.actual_cost || ''}</Descriptions.Item>
          <Descriptions.Item label="施工许可证编号">{detail?.acceptance_filings?.[0]?.cp_no || ''}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions title="竣工验收">
          <Descriptions.Item label="竣工验收编号">{detail?.completion_acceptances?.[0]?.id || ''}</Descriptions.Item>
          <Descriptions.Item label="数据等级">{detail?.completion_acceptances?.[0]?.data_level || ''}</Descriptions.Item>
          <Descriptions.Item label="实际开工日期">{dayjs(detail?.completion_acceptances?.[0]?.proj_start_date).format('YYYY-MM-DD') || ''}</Descriptions.Item>
          <Descriptions.Item label="竣工验收日期">{dayjs(detail?.completion_acceptances?.[0]?.ca_date).format('YYYY-MM-DD') || ''}</Descriptions.Item>
          <Descriptions.Item label="实际面积(平方米)">{detail?.completion_acceptances?.[0]?.actual_area || ''}</Descriptions.Item>
          <Descriptions.Item label="实际造价(万)">{detail?.completion_acceptances?.[0]?.actual_cost || ''}</Descriptions.Item>
          <Descriptions.Item label="施工许可证编号">{detail?.completion_acceptances?.[0]?.cp_no || ''}</Descriptions.Item>
        </Descriptions>
      </Drawer>
    </>
  );
}
