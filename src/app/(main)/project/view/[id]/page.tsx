'use client';

import { BuildOutlined, HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Descriptions, Divider, message, Space, Table } from 'antd';
import { useParams } from 'next/navigation';
import React, { Fragment, useEffect, useState } from 'react';

import Copyable from '@/components/copyable';
import { locale } from '@/components/table-props';
import { IdReq } from '@/constants/dto';
import { ProjectDetailDto } from '@/constants/project';
import { getProject } from '@/services/project';
import { year2Day, year2Sec } from '@/utils/date';

export default function ManagerView() {
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

  const unitColumns = [
    { title: '单体建（构）筑物名称', dataIndex: 'unit_name', key: 'unit_name' },
    { title: '工程单体造价(万元)', dataIndex: 'unit_cost', key: 'unit_cost' },
    { title: '建筑面积(平方米)', dataIndex: 'unit_area', key: 'unit_area' },
    { title: '高度(米)', dataIndex: 'height', key: 'height' },
  ];

  const unitDataSource = detail?.proj_units?.map((item, index) => ({ key: `unit_${index}`, ...item }));
  const unitCostTotal = Number.parseFloat(detail?.proj_units?.reduce((acc, cur) => acc + (cur.unit_cost || 0), 0).toFixed(2) || '0');
  const unitAreaTotal = Number.parseFloat(detail?.proj_units?.reduce((acc, cur) => acc + (cur.unit_area || 0), 0).toFixed(2) || '0');

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
            <Copyable content={detail?.manager?.name} link={`/manager/view/${detail?.manager?.id}`} />
          </Descriptions.Item>
          <Descriptions.Item label="总面积(平方米)">
            <Copyable content={detail?.total_area} />
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">{year2Sec(detail?.updated_at)}</Descriptions.Item>
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
            return <footer className={'flex justify-start font-bold'}>{`工程总造价(万元)：${unitCostTotal}，工程总面积(平米)：${unitAreaTotal}`}</footer>;
          }}
        />
        <Divider />
        <Descriptions title="招投标信息">
          {detail?.winning_bidder?.map((item) => {
            return (
              <Fragment key={item?.wb_no}>
                <Descriptions.Item label="中标通知书编号">
                  <Copyable content={item?.wb_no} />
                </Descriptions.Item>
                <Descriptions.Item label="数据等级">
                  <Copyable content={item?.data_level} />
                </Descriptions.Item>
                <Descriptions.Item label="中标日期">
                  <Copyable content={year2Day(item?.wb_date)} />
                </Descriptions.Item>
                <Descriptions.Item label="招标类型">{item?.tender_type || ''}</Descriptions.Item>
                <Descriptions.Item label="中标金额(万)">
                  <Copyable content={item?.wb_amount} />
                </Descriptions.Item>
                <Descriptions.Item label="中标单位">
                  <Copyable content={item?.company?.name} link={`/company/view/${item?.company?.id}`} />
                </Descriptions.Item>
                <Descriptions.Item label="项目经理">
                  <Copyable content={item?.manager?.name} link={`/manager/view/${item?.manager?.id}`} />
                </Descriptions.Item>
                <Descriptions.Item label="身份证号码">
                  <Copyable content={item?.manager?.id_card} />
                </Descriptions.Item>
              </Fragment>
            );
          })}
        </Descriptions>
        <div className={'text-base font-medium'}>结论：{wbResultText}</div>
        <Divider />
        <Descriptions title="合同登记信息">
          <Descriptions.Item label="合同编号">
            <Copyable content={detail?.contracts?.[0]?.cont_no} />
          </Descriptions.Item>
          <Descriptions.Item label="数据等级">
            <Copyable content={detail?.contracts?.[0]?.data_level} />
          </Descriptions.Item>
          <Descriptions.Item label="合同签订日期">
            <Copyable content={year2Day(detail?.contracts?.[0]?.sign_date)} />
          </Descriptions.Item>
          <Descriptions.Item label="承包单位">
            <Copyable content={detail?.contracts?.[0]?.company?.name} link={`/company/view/${detail?.contracts?.[0]?.company?.id}`} />
          </Descriptions.Item>
        </Descriptions>
        <div className={'text-base font-medium'}>结论：{wbContractText}</div>
        <Divider />
        <Descriptions title="施工许可">
          {detail?.construction_permits?.map((item) => {
            return (
              <Fragment key={item?.cp_no}>
                <Descriptions.Item label="施工许可编号">
                  <Copyable content={item?.cp_no} />
                </Descriptions.Item>
                <Descriptions.Item label="数据等级">
                  <Copyable content={item?.data_level} />
                </Descriptions.Item>
                <Descriptions.Item label="发证日期">
                  <Copyable content={year2Day(item?.cp_date)} />
                </Descriptions.Item>
                <Descriptions.Item label="面积（平方米）">
                  <Copyable content={item?.cp_area} />
                </Descriptions.Item>
                <Descriptions.Item label="合同金额（万元）">
                  <Copyable content={item?.cp_amount} />
                </Descriptions.Item>
                <Descriptions.Item label="所属单位">
                  <Copyable content={item?.company?.name} link={`/company/view/${item?.company?.id}`} />
                </Descriptions.Item>
                <Descriptions.Item label="项目经理">
                  <Copyable content={item?.manager?.name} link={`/manager/view/${item?.manager?.id}`} />
                </Descriptions.Item>
                <Descriptions.Item label="身份证号码">
                  <Copyable content={item?.manager?.id_card} />
                </Descriptions.Item>
              </Fragment>
            );
          })}
        </Descriptions>
        <div className={'text-base font-medium'}>结论：{wbPermitText}</div>
        <Divider />
        <Descriptions title="竣工验收备案">
          <Descriptions.Item label="竣工验收备案编号">
            <Copyable content={detail?.acceptance_filings?.[0]?.af_no} />
          </Descriptions.Item>
          <Descriptions.Item label="数据等级">
            <Copyable content={detail?.acceptance_filings?.[0]?.data_level} />
          </Descriptions.Item>
          <Descriptions.Item label="实际开工日期">
            <Copyable content={year2Day(detail?.acceptance_filings?.[0]?.proj_start_date)} />
          </Descriptions.Item>
          <Descriptions.Item label="竣工验收备案日期">
            <Copyable content={year2Day(detail?.acceptance_filings?.[0]?.af_date)} />
          </Descriptions.Item>
          <Descriptions.Item label="实际面积(平方米)">
            <Copyable content={actual_area} />
          </Descriptions.Item>
          <Descriptions.Item label="实际造价(万)">
            <Copyable content={actual_cost} />
          </Descriptions.Item>
          <Descriptions.Item label="施工许可证编号">
            <Copyable content={detail?.acceptance_filings?.[0]?.cp_no} />
          </Descriptions.Item>
        </Descriptions>
        <div className={'text-base font-medium'}>结论：{afText}</div>
        <Divider />
      </Space>
    </>
  );
}
