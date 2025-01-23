'use client';

import { ProForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useParams } from 'next/navigation';
import { useCallback } from 'react';

import { CompanyDto } from '@/constants/company';
import { IdReq } from '@/constants/dto';
import { queryCompany, updateCompany } from '@/services/company';

export default function CompanyEdit() {
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();

  const getRequestData = useCallback(async (params: IdReq) => {
    return queryCompany(params).then((res) => res.data);
  }, []);

  const onFinish = useCallback(async (fromData: CompanyDto) => {
    const input = { ...params, ...fromData };
    const result = await updateCompany(input);
    if (result.msg === 'success') {
      messageApi.success('保存成功', 3);
    } else {
      messageApi.error(result.msg, 5);
    }
  }, []);

  return (
    <>
      {contextHolder}
      <ProForm submitter={{ searchConfig: { submitText: '保存' } }} onFinish={onFinish} params={params} request={() => getRequestData({ id: params.id as string })}>
        <ProForm.Group>
          <ProFormText name="name" width="md" label="公司名" rules={[{ required: true, message: '请输入正确的公司名', min: 4, max: 50 }]} placeholder="请输入公司名" />
          <ProFormText name="social_credit_code" rules={[{ required: true, message: '请输入18位社会信用代码', len: 18 }]} width="md" label="企业社会信用代码" placeholder="请输入企业社会信用代码" />
          <ProFormText name="cert_name" width="md" label="证书名称" placeholder="请输入证书名称" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name="role_type" width="md" label="企业角色" tooltip="最长为 24 位" placeholder="请输入企业角色" />
          <ProFormText name="cert_type" width="md" label="资质类别" placeholder="请输入资质类别" />
          <ProFormText name="cert_office" width="md" label="发证机关" placeholder="请输入发证机关" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name="cert_no" width="md" label="资质证书编号" placeholder="请输入资质证书编号" />
          <ProFormDatePicker name="cert_date" width="md" label="发证日期" placeholder="请输入资质证书编号" />
          <ProFormDatePicker name="cert_expire" width="md" label="证书过期于" placeholder="请输入证书过期于" />
        </ProForm.Group>
      </ProForm>
    </>
  );
}
