'use client';

import { Descriptions, message } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { CompanyDto } from '@/constants/company';
import { queryCompany } from '@/services/company';

export default function CompanyEdit() {
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<CompanyDto>();

  useEffect(() => {
    getDetailData();
  }, []);

  const getDetailData = () => {
    setLoading(true);
    queryCompany({ id: params.id as string })
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

  return (
    <>
      {contextHolder}
      <Descriptions title="施工企业信息">
        <Descriptions.Item label="企业名">{detail?.name || ''}</Descriptions.Item>
        <Descriptions.Item label="企业社会信用代码">{detail?.social_credit_code || ''}</Descriptions.Item>
        <Descriptions.Item label="证书名称">{detail?.cert_name || ''}</Descriptions.Item>
        <Descriptions.Item label="企业角色">{detail?.role_type || ''}</Descriptions.Item>
        <Descriptions.Item label="资质类别">{detail?.cert_type || ''}</Descriptions.Item>
        <Descriptions.Item label="发证机关">{detail?.cert_office || ''}</Descriptions.Item>
        <Descriptions.Item label="资质证书编号">{detail?.cert_no || ''}</Descriptions.Item>
        <Descriptions.Item label="发证日期">{detail?.cert_date ? dayjs(detail?.cert_date).format('YYYY-MM-DD') : ''}</Descriptions.Item>
        <Descriptions.Item label="证书过期于">{detail?.cert_expire ? dayjs(detail?.cert_expire).format('YYYY-MM-DD') : ''}</Descriptions.Item>
      </Descriptions>
    </>
  );
}
