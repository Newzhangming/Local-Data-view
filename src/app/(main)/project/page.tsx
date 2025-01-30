'use client';

import { EditTwoTone, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Descriptions, Divider, Drawer, message, Table, Tag, theme } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import React, { Fragment, useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { locale, pagination, search } from '@/components/table-props';
import { ProjectDto, ProjectReq } from '@/constants/dto';
import { ProjectDetailDto } from '@/constants/project';
import { getProject, getProjects } from '@/services/project';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentItem, setCurrentItem] = useState<ProjectDto>();
  const [detail, setDetail] = useState<ProjectDetailDto>();

  const DataLevel = { A: 'green', B: 'orange', C: 'magenta', D: 'red' };

  const showDrawer = (data: ProjectDto) => () => {
    setOpen(true);
    setCurrentItem(data);
    getDetailData(data);
  };

  const getDetailData = (data: ProjectDto) => {
    setLoading(true);
    getProject(data.proj_no)
      .then((res) => {
        setLoading(false);
        if (res.msg === 'success') {
          setDetail(res.data);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const refreshDetail = () => {
    if (currentItem) {
      getDetailData(currentItem);
    }
  };

  const columns: ProColumns<ProjectDto>[] = [
    {
      title: '项目编号',
      order: 10,
      colSize: 1.1,
      dataIndex: 'proj_no',
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '项目名称',
      order: 9,
      colSize: 2,
      dataIndex: 'proj_name',
      hideInSearch: false,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
    },
    {
      title: '项目分类',
      dataIndex: 'proj_type',
      hideInSearch: true,
      copyable: false,
      ellipsis: false,
    },
    {
      title: '总面积(万平方米)',
      dataIndex: 'total_area',
      hideInSearch: true,
      copyable: false,
      ellipsis: false,
      renderText: (text: number) => (text ? `${(text / 10000).toFixed(2)}` : 0),
    },
    {
      title: '数据等级',
      dataIndex: 'data_level',
      colSize: 1,
      valueType: 'select',
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
      request: async () => Object.keys(DataLevel).map((value) => ({ label: value, value })),
      render: (_, record) => {
        const color = DataLevel[record.data_level as keyof typeof DataLevel];
        return <Tag color={color}>{record.data_level}</Tag>;
      },
    },
    {
      title: '更新日期',
      dataIndex: 'updated_at',
      hideInSearch: true,
      valueType: 'dateTime',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'options',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => {
        const href = record.proj_no ? `./project/view/${record.proj_no}` : undefined;
        const viewIcon = record.proj_no ? <EyeTwoTone /> : <EyeInvisibleOutlined />;
        const linkClassName = record.proj_no ? 'text-blue-500' : 'text-gray-500 hover:text-gray-500';
        return (
          <>
            <a href={`./project/edit/${record.id}`}>
              编辑
              <EditTwoTone />
            </a>
            <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
            <a className={linkClassName} href={href}>
              查看{viewIcon}
            </a>
          </>
        );
      },
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

  const conclusion = [{ position: 'base', msg: '', value: true }];
  if (currentItem?.data_level !== 'A' && currentItem?.data_level !== 'B') {
    conclusion.push({ position: 'base', msg: '基本信息数据等级不达标', value: false });
  }
  if ((currentItem?.total_area || 0) < 60000) {
    conclusion.push({ position: 'base', msg: '基本信息总面积小于6万平米', value: false });
  }
  const address = detail?.address || '';
  if (!address || address.length < 5) {
    conclusion.push({ position: 'base', msg: '项目地址不详细', value: true });
  }
  let baseResultText = conclusion
    .filter((item) => !item.value && item.position === 'base')
    .map((item) => item.msg)
    .join('，');
  if (!baseResultText) {
    baseResultText = '项目基本信息达标';
  }

  // 招投标信息
  if (detail?.winning_bidder?.[0]?.data_level !== 'A' && detail?.winning_bidder?.[0]?.data_level !== 'B') {
    conclusion.push({ position: 'wb', msg: '招投标数据等级不达标', value: false });
  }
  if (!detail?.winning_bidder?.[0]?.wb_date) {
    conclusion.push({ position: 'wb', msg: '招投标日期不达标', value: false });
  }
  let wbResultText = conclusion
    .filter((item) => !item.value && item.position === 'wb')
    .map((item) => item.msg)
    .join('，');
  if (!wbResultText) {
    wbResultText = '招投标信息达标';
  }

  // 合同登记
  if (detail?.contract?.data_level !== 'A' && detail?.contract?.data_level !== 'B') {
    conclusion.push({ position: 'contract', msg: '合同登记数据等级不达标', value: false });
  }
  if (!detail?.contract?.sign_date) {
    conclusion.push({ position: 'contract', msg: '合同登记日期不达标', value: false });
  }
  let wbContractText = conclusion
    .filter((item) => !item.value && item.position === 'contract')
    .map((item) => item.msg)
    .join('，');
  if (!wbContractText) {
    wbContractText = '合同登记信息达标';
  }

  // 施工许可
  if (detail?.construction_permits?.[0]?.data_level !== 'A' && detail?.construction_permits?.[0]?.data_level !== 'B') {
    conclusion.push({ position: 'permit', msg: '施工许可数据等级不达标', value: false });
  }
  if (!detail?.construction_permits?.[0]?.cp_date) {
    conclusion.push({ position: 'permit', msg: '施工许可日期不达标', value: false });
  }
  let wbPermitText = conclusion
    .filter((item) => !item.value && item.position === 'permit')
    .map((item) => item.msg)
    .join('，');
  if (!wbPermitText) {
    wbPermitText = '施工许可信息达标';
  }

  // 竣工验收备案
  if (detail?.acceptance_filings?.[0]?.data_level !== 'A' && detail?.acceptance_filings?.[0]?.data_level !== 'B') {
    conclusion.push({ position: 'af', msg: '竣工验收备案数据等级不达标', value: false });
  }
  if (!detail?.acceptance_filings?.[0]?.af_date) {
    conclusion.push({ position: 'af', msg: '竣工验收备案可日期不达标', value: false });
  }
  if ((detail?.acceptance_filings?.[0]?.actual_area || 0) < 60000) {
    conclusion.push({ position: 'af', msg: '竣工验收备案实际面积小于6万平米', value: false });
  }
  let afText = conclusion
    .filter((item) => !item.value && item.position === 'af')
    .map((item) => item.msg)
    .join('，');
  if (!afText) {
    afText = '竣工验收备案达标';
  }

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
      <Drawer
        closable
        destroyOnClose
        title={<p>{currentItem?.proj_name || '项目名称'}</p>}
        placement="right"
        open={open}
        loading={loading}
        width={'70%'}
        onClose={() => setOpen(false)}
        extra={
          <div className={'cursor-pointer rounded bg-antd-blue px-5 py-1 text-white'} onClick={refreshDetail}>
            刷新
          </div>
        }
      >
        <Descriptions title="工程基本信息">
          <Descriptions.Item label="项目编号">{currentItem?.proj_no || ''}</Descriptions.Item>
          <Descriptions.Item label="数据等级">{currentItem?.data_level || ''}</Descriptions.Item>
          <Descriptions.Item label="项目分类">{currentItem?.proj_type || ''}</Descriptions.Item>
          <Descriptions.Item label="总面积(平方米)">{currentItem?.total_area || ''}</Descriptions.Item>
          <Descriptions.Item label="项目地址">{detail?.address || ''}</Descriptions.Item>
          <Descriptions.Item label="项目区划">{detail?.region || ''}</Descriptions.Item>
          <Descriptions.Item label="建设规模">{detail?.scale_desc || ''}</Descriptions.Item>
        </Descriptions>
        <div className={'text-base font-medium my-4'}>结论：{baseResultText}</div>
        <Divider />
        <div className={'text-base font-semibold my-5'}>工程单体信息</div>
        <Table locale={locale} pagination={false} dataSource={unitDataSource} columns={unitColumns} />
        <Divider />
        <Descriptions title="招投标信息">
          {detail?.winning_bidder?.map((item) => {
            return (
              <Fragment key={item?.wb_no}>
                <Descriptions.Item label="中标通知书编号">{item?.wb_no || ''}</Descriptions.Item>
                <Descriptions.Item label="数据等级">{item?.data_level || ''}</Descriptions.Item>
                <Descriptions.Item label="中标日期">{item?.wb_date ? dayjs(item?.wb_date).format('YYYY-MM-DD') : ''}</Descriptions.Item>
                <Descriptions.Item label="招标类型">{item?.tender_type || ''}</Descriptions.Item>
                <Descriptions.Item label="中标金额(万)">{item?.wb_amount || ''}</Descriptions.Item>
                <Descriptions.Item label="中标单位">
                  <a href={`./company/view/${item?.company?.id}`}>{item?.company?.name || ''}</a>
                </Descriptions.Item>
                <Descriptions.Item label="项目经理">
                  <a href={`./manager/view/${item?.manager?.id}`}>{item?.manager?.name || ''}</a>
                </Descriptions.Item>
                <Descriptions.Item label="身份证号码">{item?.manager?.id_card || ''}</Descriptions.Item>
              </Fragment>
            );
          })}
        </Descriptions>
        <div className={'text-base font-medium my-4'}>结论：{wbResultText}</div>
        <Divider />
        <Descriptions title="合同登记信息">
          <Descriptions.Item label="合同编号">{detail?.contract?.cont_no || ''}</Descriptions.Item>
          <Descriptions.Item label="数据等级">{detail?.contract?.data_level || ''}</Descriptions.Item>
          <Descriptions.Item label="合同签订日期">{detail?.contract?.sign_date ? dayjs(detail?.contract?.sign_date).format('YYYY-MM-DD') : ''}</Descriptions.Item>
          <Descriptions.Item label="承包单位">
            <a href={`./company/view/${detail?.contract?.company?.id}`}>{detail?.contract?.company?.name || ''}</a>
          </Descriptions.Item>
        </Descriptions>
        <div className={'text-base font-medium my-4'}>结论：{wbContractText}</div>
        <Divider />
        <Descriptions title="施工许可">
          {detail?.construction_permits?.map((item) => {
            return (
              <Fragment key={item?.cp_no}>
                <Descriptions.Item label="施工许可编号">{item?.cp_no || ''}</Descriptions.Item>
                <Descriptions.Item label="数据等级">{item?.data_level || ''}</Descriptions.Item>
                <Descriptions.Item label="发证日期">{item?.cp_date ? dayjs(item?.cp_date).format('YYYY-MM-DD') : ''}</Descriptions.Item>
                <Descriptions.Item label="所属单位">
                  <a href={`./company/view/${item?.company?.id}`}>{item?.company?.name || ''}</a>
                </Descriptions.Item>
                <Descriptions.Item label="项目经理">
                  <a href={`./manager/view/${item?.manager?.id}`}>{item?.manager?.name || ''}</a>
                </Descriptions.Item>
                <Descriptions.Item label="身份证号码">{item?.manager?.id_card || ''}</Descriptions.Item>
              </Fragment>
            );
          })}
        </Descriptions>
        <div className={'text-base font-medium my-4'}>结论：{wbPermitText}</div>
        <Divider />
        <Descriptions title="竣工验收备案">
          <Descriptions.Item label="竣工验收备案编号">{detail?.acceptance_filings?.[0]?.af_no || ''}</Descriptions.Item>
          <Descriptions.Item label="数据等级">{detail?.acceptance_filings?.[0]?.data_level || ''}</Descriptions.Item>
          <Descriptions.Item label="实际开工日期">
            {detail?.acceptance_filings?.[0]?.proj_start_date ? dayjs(detail?.acceptance_filings?.[0]?.proj_start_date).format('YYYY-MM-DD') : ''}
          </Descriptions.Item>
          <Descriptions.Item label="竣工验收备案日期">{detail?.acceptance_filings?.[0]?.af_date ? dayjs(detail?.acceptance_filings?.[0]?.af_date).format('YYYY-MM-DD') : ''}</Descriptions.Item>
          <Descriptions.Item label="实际面积(平方米)">{detail?.acceptance_filings?.[0]?.actual_area || ''}</Descriptions.Item>
          <Descriptions.Item label="实际造价(万)">{detail?.acceptance_filings?.[0]?.actual_cost || ''}</Descriptions.Item>
          <Descriptions.Item label="施工许可证编号">{detail?.acceptance_filings?.[0]?.cp_no || ''}</Descriptions.Item>
        </Descriptions>
        <div className={'text-base font-medium my-4'}>结论：{afText}</div>
        <Divider />
        {/*<Descriptions title="竣工验收">*/}
        {/*  <Descriptions.Item label="竣工验收编号">{detail?.completion_acceptances?.[0]?.id || ''}</Descriptions.Item>*/}
        {/*  <Descriptions.Item label="数据等级">{detail?.completion_acceptances?.[0]?.data_level || ''}</Descriptions.Item>*/}
        {/*  <Descriptions.Item label="实际开工日期">*/}
        {/*    {detail?.completion_acceptances?.[0]?.proj_start_date ? dayjs(detail?.completion_acceptances?.[0]?.proj_start_date).format('YYYY-MM-DD') : ''}*/}
        {/*  </Descriptions.Item>*/}
        {/*  <Descriptions.Item label="竣工验收日期">{detail?.completion_acceptances?.[0]?.ca_date ? dayjs(detail?.completion_acceptances?.[0]?.ca_date).format('YYYY-MM-DD') : ''}</Descriptions.Item>*/}
        {/*  <Descriptions.Item label="实际面积(平方米)">{detail?.completion_acceptances?.[0]?.actual_area || ''}</Descriptions.Item>*/}
        {/*  <Descriptions.Item label="实际造价(万)">{detail?.completion_acceptances?.[0]?.actual_cost || ''}</Descriptions.Item>*/}
        {/*  <Descriptions.Item label="施工许可证编号">{detail?.completion_acceptances?.[0]?.cp_no || ''}</Descriptions.Item>*/}
        {/*</Descriptions>*/}
        {/*<div className={'text-base font-medium my-4'}>结论：{baseResultText}</div>*/}
        {/*<Divider />*/}
      </Drawer>
    </>
  );
}
