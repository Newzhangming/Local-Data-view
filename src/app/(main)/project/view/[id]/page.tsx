'use client';

import { BuildOutlined, HomeOutlined } from '@ant-design/icons';
import { ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { Breadcrumb, Descriptions, Divider, message, RadioChangeEvent, RadioGroupProps, Space, Table, TableProps, Tag } from 'antd';
import { useParams } from 'next/navigation';
import React, { Fragment, useEffect, useState } from 'react';

import Copyable from '@/components/copyable';
import Ellipsis from '@/components/ellipsis';
import { locale } from '@/components/table-props';
import { IdReq } from '@/constants/dto';
import { AcceptanceFiling, ConstructionPermit, ProjectDetailDto, ProjUnit, WinningBidder } from '@/constants/project';
import { getProject, upsertProject } from '@/services/project';
import { year2Day } from '@/utils/date';

export default function ProjectView() {
  const [messageApi, contextHolder] = message.useMessage();
  const params: Partial<IdReq> = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<ProjectDetailDto>();

  useEffect(() => getDetailData(), []);

  const getDetailData = () => {
    setLoading(true);
    getProject(params.id as string)
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
      href: '/project',
      title: (
        <>
          <BuildOutlined />
          <span>工程项目</span>
        </>
      ),
    },
    { title: <Copyable content={detail?.proj_name} /> },
  ];

  const conclusionOptions: RadioGroupProps['options'] = [
    { value: 'pass', label: <Tag color="green">通过</Tag> },
    { value: 'pending', label: <Tag color="orange">待补充材料</Tag> },
    { value: 'scrap', label: <Tag color="red">废弃</Tag> },
  ];
  const unitColumns: TableProps<ProjUnit>['columns'] = [
    { title: '单体建（构）筑物名称', dataIndex: 'unit_name', key: 'unit_name', render: (value: string) => <Copyable content={value} /> },
    { title: '工程单体造价(万元)', dataIndex: 'unit_cost', key: 'unit_cost', render: (value: string) => <Copyable content={value} /> },
    { title: '建筑面积(平方米)', dataIndex: 'unit_area', key: 'unit_area', render: (value: string) => <Copyable content={value} /> },
    { title: '高度(米)', dataIndex: 'height', key: 'height', render: (value: string) => <Copyable content={value} /> },
  ];
  const afColumns: TableProps<AcceptanceFiling>['columns'] = [
    { title: '备案编号', dataIndex: 'af_no', key: 'af_no', render: (value: string) => <Copyable content={value} /> },
    { title: '实际造价(万元)', dataIndex: 'actual_cost', key: 'actual_cost', render: (value: string) => <Copyable content={value} /> },
    { title: '实际面积(平方米)', dataIndex: 'actual_area', key: 'actual_area', render: (value: string) => <Copyable content={value} /> },
    { title: '实际开工日期', dataIndex: 'proj_start_date', key: 'proj_start_date', render: (value: string) => <Copyable content={year2Day(value)} /> },
    { title: '验收备案日期', dataIndex: 'af_date', key: 'af_date', render: (value: string) => <Copyable content={year2Day(value)} /> },
    { title: '体系结构', dataIndex: 'structure', key: 'structure', render: (value: string) => <Copyable content={value} /> },
    { title: '跨度(米)', dataIndex: 'span', key: 'span', render: (value: string) => <Copyable content={value} /> },
    { title: '建设规模', dataIndex: 'scale_desc', key: 'scale_desc', width: 150, render: (value: string) => <Ellipsis text={value} lines={2} /> },
    { title: '信息来源', dataIndex: 'data_from', key: 'data_from', render: (value: string) => <Copyable content={value} /> },
    { title: '数据等级', dataIndex: 'data_level', key: 'data_level', render: (value: string) => <Copyable content={value} /> },
    {
      title: '施工单位',
      key: 'company',
      render: (value: AcceptanceFiling) => <Copyable content={value?.companies?.[0]?.company?.name} link={`/company/view/${value?.companies?.[0]?.company?.id}`} target={'_blank'} />,
    },
    {
      title: '项目经理',
      key: 'managers',
      render: (value: AcceptanceFiling) => {
        if (value.managers?.length) {
          return value?.managers?.map((item, index) => <Copyable key={index} content={item?.manager?.name} link={`/manager/view/${item?.manager?.id}`} target={'_blank'} />);
        }
        const mgrIds = value?.project?.managers?.map((item) => item.manager_id);
        const managers = value?.companies?.[0]?.company?.managers || [];
        for (const mgrId of mgrIds) {
          for (const manager of managers) {
            if (manager?.manager?.id === mgrId) {
              return <Copyable content={manager?.manager?.name} link={`/manager/view/${mgrId}`} target={'_blank'} />;
            }
          }
        }
        return null;
      },
    },
    {
      title: '身份证号',
      key: 'id_card',
      render: (value: AcceptanceFiling) => {
        if (value.managers?.length) {
          return value?.managers?.map((item, index) => <Copyable key={index} content={item?.manager?.id_card} target={'_blank'} />);
        }
        const mgrIds = value?.project?.managers?.map((item) => item.manager_id);
        const managers = value?.companies?.[0]?.company?.managers || [];
        for (const mgrId of mgrIds) {
          for (const manager of managers) {
            if (manager?.manager?.id === mgrId) {
              return <Copyable content={manager?.manager?.id_card} />;
            }
          }
        }
        return null;
      },
    },
  ];
  const cpColumns: TableProps<ConstructionPermit>['columns'] = [
    { title: '施工许可编号', dataIndex: 'cp_no', key: 'cp_no', render: (value: string) => <Copyable content={value} /> },
    { title: '合同金额(万元)', dataIndex: 'cp_amount', key: 'cp_amount', render: (value: string) => <Copyable content={value} /> },
    { title: '面积（平方米）', dataIndex: 'cp_area', key: 'cp_area', render: (value: string) => <Copyable content={value} /> },
    { title: '发证日期', dataIndex: 'cp_date', key: 'cp_date', render: (value: string) => <Copyable content={year2Day(value)} /> },
    { title: '跨度(米)', dataIndex: 'span', key: 'span', render: (value: string) => <Copyable content={value} /> },
    { title: '建设规模', dataIndex: 'scale_desc', key: 'scale_desc', width: 150, render: (value: string) => <Ellipsis text={value} lines={2} /> },
    { title: '信息来源', dataIndex: 'data_from', key: 'data_from', render: (value: string) => <Copyable content={value} /> },
    { title: '数据等级', dataIndex: 'data_level', key: 'data_level', render: (value: string) => <Copyable content={value} /> },
    { title: '所属单位', render: (value: ConstructionPermit) => <Copyable content={value?.company?.name} link={`/company/view/${value?.company?.id}`} target={'_blank'} /> },
    {
      title: '项目经理',
      render: (value: ConstructionPermit) =>
        value.managers?.map((item) => {
          return <Copyable key={item?.manager?.id} content={item?.manager?.name} link={`/manager/view/${item?.manager?.id}`} target={'_blank'} />;
        }),
    },
    {
      title: '身份证号',
      render: (value: ConstructionPermit) =>
        value.managers?.map((item) => {
          return <Copyable key={item?.manager?.id} content={item?.manager?.id_card} />;
        }),
    },
  ];
  const wbColumns: TableProps<WinningBidder>['columns'] = [
    { title: '中标编号', dataIndex: 'wb_no', key: 'wb_no', render: (value: string) => <Copyable content={value} /> },
    { title: '中标日期', dataIndex: 'wb_date', key: 'wb_date', render: (value: string) => <Copyable content={year2Day(value)} /> },
    { title: '招标类型', dataIndex: 'tender_type', key: 'tender_type', render: (value: string) => <Copyable content={value} /> },
    { title: '中标金额(万元)', dataIndex: 'wb_amount', key: 'wb_amount', render: (value: string) => <Copyable content={value} /> },
    { title: '建设规模', dataIndex: 'scale_desc', key: 'scale_desc', width: 150, render: (value: string) => <Ellipsis text={value} lines={2} /> },
    { title: '信息来源', dataIndex: 'data_from', key: 'data_from', render: (value: string) => <Copyable content={value} /> },
    { title: '数据等级', dataIndex: 'data_level', key: 'data_level', render: (value: string) => <Copyable content={value} /> },
    { title: '中标单位', render: (value: WinningBidder) => <Copyable content={value?.company?.name} link={`/company/view/${value?.company?.id}`} target={'_blank'} /> },
    { title: '项目经理', render: (value: WinningBidder) => <Copyable content={value?.manager?.name} link={`/manager/view/${value?.manager?.id}`} target={'_blank'} /> },
    { title: '身份证号', render: (value: WinningBidder) => <Copyable content={value?.manager?.id_card} /> },
  ];

  const unitDataSource = detail?.proj_units?.map((item, index) => ({ key: `unit_${index}`, ...item }));
  const afDataSource = detail?.acceptance_filings?.map((item, index) => ({ key: `af_${index}`, ...item }));
  const cpDataSource = detail?.construction_permits?.map((item, index) => ({ key: `cp_${index}`, ...item }));
  const wbDataSource = detail?.winning_bidder?.map((item, index) => ({ key: `wb_${index}`, ...item }));

  const unitCostTotal = Number.parseFloat(detail?.proj_units?.reduce((acc, cur) => acc + (cur.unit_cost || 0), 0).toFixed(2) || '0');
  const unitAreaTotal = Number.parseFloat(detail?.proj_units?.reduce((acc, cur) => acc + (cur.unit_area || 0), 0).toFixed(2) || '0');
  const afCostTotal = Number.parseFloat(detail?.acceptance_filings?.reduce((acc, cur) => acc + (cur.actual_cost || 0), 0).toFixed(2) || '0');
  const afAreaTotal = Number.parseFloat(detail?.acceptance_filings?.reduce((acc, cur) => acc + (cur.actual_area || 0), 0).toFixed(2) || '0');

  const conclusion = [{ position: 'base', msg: '', value: true }];
  if (detail?.data_level !== 'A' && detail?.data_level !== 'B') {
    conclusion.push({ position: 'base', msg: '基本信息数据等级不达标', value: false });
  }
  if ((detail?.total_area || 0) < 60000) {
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
  if (detail?.contracts?.[0]?.data_level !== 'A' && detail?.contracts?.[0]?.data_level !== 'B') {
    conclusion.push({ position: 'contract', msg: '合同登记数据等级不达标', value: false });
  }
  if (!detail?.contracts?.[0]?.sign_date) {
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

  // 竣工验收备案
  if (detail?.acceptance_filings?.[0]?.data_level !== 'A' && detail?.acceptance_filings?.[0]?.data_level !== 'B') {
    conclusion.push({ position: 'af', msg: '竣工验收备案数据等级不达标', value: false });
  }
  if (!detail?.acceptance_filings?.[0]?.af_date) {
    conclusion.push({ position: 'af', msg: '竣工验收备案可日期不达标', value: false });
  }
  const actual_area = detail?.acceptance_filings?.[0]?.actual_area || 0;
  if (actual_area < 60000) {
    conclusion.push({ position: 'af', msg: '竣工验收备案实际面积小于6万平米', value: false });
  }
  const absolute_area = Math.abs(actual_area - unitAreaTotal).toFixed(2);
  if (actual_area && unitAreaTotal && +absolute_area > 5000) {
    conclusion.push({ position: 'af', msg: `竣工验收备案实际面积与单体信息面积总计相差${absolute_area}平米`, value: false });
  }

  const actual_cost = detail?.acceptance_filings?.[0]?.actual_cost || 0;
  const absolute_cost = Math.abs(actual_cost - unitCostTotal).toFixed(2);
  if (actual_cost && unitCostTotal && +absolute_cost > 50) {
    conclusion.push({ position: 'af', msg: `竣工验收备案实际造价与单体信息造价总计相差${absolute_cost}万`, value: false });
  }

  const onConclusionChange = async (e: RadioChangeEvent) => {
    if (detail) {
      await upsertProject({
        id: detail.id,
        proj_no: detail.proj_no,
        proj_name: detail.proj_name,
        proj_type: detail.proj_type,
        total_area: detail.total_area,
        data_level: detail.data_level,
        conclusion: e.target.value,
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Space direction={'vertical'} size={'small'}>
        <Breadcrumb items={breadcrumbItems} />
        <Descriptions title="工程基本信息">
          <Descriptions.Item label="项目编号">
            <Copyable content={detail?.proj_no} link={!detail?.source_id ? `https://jzsc.mohurd.gov.cn/data/project?complexname=${detail?.proj_no}` : ''} target={'_blank'} />
          </Descriptions.Item>
          <Descriptions.Item label="数据等级">
            <Copyable content={detail?.data_level} />
          </Descriptions.Item>
          <Descriptions.Item label="项目分类">
            <Copyable content={detail?.proj_type} />
          </Descriptions.Item>
          <Descriptions.Item label="四库地址">
            <Copyable content={detail?.source_id} link={`https://jzsc.mohurd.gov.cn/data/project/detail?id=${detail?.source_id}`} target={'_blank'} />
          </Descriptions.Item>
          <Descriptions.Item label="项目地址">
            <Copyable content={detail?.address} />
          </Descriptions.Item>
          <Descriptions.Item label="项目区划">
            <Copyable content={detail?.region} />
          </Descriptions.Item>
          <Descriptions.Item label="项目经理">
            {detail?.managers.map((m) => <Copyable key={m?.manager?.id} content={m?.manager?.name} link={`/manager/view/${m?.manager?.id}`} target={'_blank'} />)}
          </Descriptions.Item>
          <Descriptions.Item label="总面积(平方米)">
            <Copyable content={detail?.total_area} />
          </Descriptions.Item>
          <Descriptions.Item label="数据来源">
            <Copyable content={detail?.data_from} />
          </Descriptions.Item>
          <Descriptions.Item label="建设规模">
            <Copyable content={detail?.scale_desc} />
          </Descriptions.Item>
        </Descriptions>
        <div className={'text-base font-medium'}>结论：{baseResultText}</div>
        <Divider />
        <div className={'text-base font-semibold'}>工程单体信息</div>
        <Table
          loading={loading}
          locale={locale}
          pagination={false}
          dataSource={unitDataSource}
          columns={unitColumns}
          footer={() => {
            if (!unitCostTotal && !unitAreaTotal) {
              return null;
            }
            return <footer className={'flex justify-start font-bold'}>{`工程总造价(万元)：${unitCostTotal}，工程总面积(平米)：${unitAreaTotal}`}</footer>;
          }}
        />
        <Divider />
        <div className={'text-[15px] font-medium'}>招投标信息</div>
        <Table loading={loading} locale={locale} pagination={false} dataSource={wbDataSource} columns={wbColumns} />
        <Divider />
        <Descriptions title="合同登记信息">
          {detail?.contracts?.map((item) => {
            return (
              <Fragment key={item.cont_no}>
                <Descriptions.Item label="合同编号">
                  <Copyable content={item.cont_no} />
                </Descriptions.Item>
                <Descriptions.Item label="数据等级">
                  <Copyable content={item.data_level} />
                </Descriptions.Item>
                <Descriptions.Item label="合同签订日期">
                  <Copyable content={year2Day(item.sign_date)} />
                </Descriptions.Item>
                <Descriptions.Item label="承包单位">
                  <Copyable content={item.company?.name} link={`/company/view/${item.company?.id}`} target={'_blank'} />
                </Descriptions.Item>
                <Descriptions.Item label="数据来源">
                  <Copyable content={item?.data_from} />
                </Descriptions.Item>
                <Descriptions.Item>{''}</Descriptions.Item>
              </Fragment>
            );
          })}
        </Descriptions>
        <div className={'text-base font-medium'}>结论：{wbContractText}</div>
        <Divider />
        <div className={'text-[15px] font-medium'}>施工许可</div>
        <Table loading={loading} locale={locale} pagination={false} dataSource={cpDataSource} columns={cpColumns} />
        <div className={'text-[15px] font-medium'}>竣工验收备案</div>
        <Table
          loading={loading}
          locale={locale}
          pagination={false}
          dataSource={afDataSource}
          columns={afColumns}
          footer={() => {
            if (!afCostTotal && !afAreaTotal) {
              return null;
            }
            return <footer className={'flex justify-start font-bold'}>{`备案总造价(万元)：${afCostTotal}，备案总面积(平米)：${afAreaTotal}`}</footer>;
          }}
        />
        <Divider />
        <Descriptions title="技术业绩指标">
          {detail?.proj_tech_kpis?.map((item) => {
            let manager = detail?.mgr_tech_kpis.find((m) => m.proj_role === '项目经理')?.manager;
            if (!manager && detail?.managers?.length > 1) {
              manager = detail?.managers?.pop()?.manager;
            }

            return (
              <Fragment key={item?.kpi_no}>
                <Descriptions.Item label="业绩记录编号">
                  <Copyable content={item?.kpi_no} />
                </Descriptions.Item>
                <Descriptions.Item label="企业名称">
                  <Copyable content={item?.company?.name} link={`/company/view/${item?.company?.id}`} target={'_blank'} />
                </Descriptions.Item>
                <Descriptions.Item label="统一社会信用代码">
                  <Copyable content={item?.company.social_credit_code} />
                </Descriptions.Item>
                <Descriptions.Item label="业绩类型">
                  <Copyable content={item?.kpi_type} />
                </Descriptions.Item>
                <Descriptions.Item label="开始工作时间">
                  <Copyable content={year2Day(item?.start_date)} />
                </Descriptions.Item>
                <Descriptions.Item label="工作结束时间">
                  <Copyable content={year2Day(item?.end_date)} />
                </Descriptions.Item>
                <Descriptions.Item label="数据等级">
                  <Copyable content={item.data_level} />
                </Descriptions.Item>
                <Descriptions.Item label="项目经理">
                  <Copyable content={manager?.name} link={`/manager/view/${manager?.id}`} target={'_blank'} />
                </Descriptions.Item>
                <Descriptions.Item label="身份证号">
                  <Copyable content={manager?.id_card} />
                </Descriptions.Item>
                <Descriptions.Item label="建设规模">
                  <Copyable content={item.kpi_desc} />
                </Descriptions.Item>
              </Fragment>
            );
          })}
        </Descriptions>
        <Divider />
        <Descriptions title="项目备注">
          <Space>
            <ProFormText>{detail?.remark || '未填写'}</ProFormText>
            <a className={'mx-5'} href={`/project/edit/${detail?.proj_no}`} target={'_blank'}>
              补充备注
            </a>
          </Space>
        </Descriptions>
        <Divider />
        <ProFormRadio.Group
          label={'判定项目可用'}
          colProps={{ defaultValue: detail?.conclusion }}
          fieldProps={{ defaultValue: detail?.conclusion, onChange: onConclusionChange }}
          options={conclusionOptions}
        />
      </Space>
    </>
  );
}
