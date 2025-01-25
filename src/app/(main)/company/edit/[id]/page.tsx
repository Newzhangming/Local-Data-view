'use client';

import { ProForm, ProFormText } from '@ant-design/pro-components';
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
          <ProFormText name="role_type" width="md" label="企业角色" tooltip="最长为24位" placeholder="请输入企业角色" />
        </ProForm.Group>
      </ProForm>
    </>
  );
}
