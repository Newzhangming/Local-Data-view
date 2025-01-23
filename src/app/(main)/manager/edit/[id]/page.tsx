'use client';

import { ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { useParams } from 'next/navigation';
import { useCallback } from 'react';

import { IdReq } from '@/constants/dto';
import { ManagerDto } from '@/constants/manager';
import { queryManager, updateManager } from '@/services/manager';

export default function ManagerEdit() {
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();

  const getRequestData = useCallback(async (params: IdReq) => {
    return queryManager(params).then((res) => res.data);
  }, []);

  const onFinish = useCallback(async (fromData: ManagerDto) => {
    const input = { ...params, ...fromData };
    const result = await updateManager(input);
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
          <ProFormText width="md" name="name" label="经理姓名" rules={[{ required: true, message: '请输入正确的姓名', min: 2, max: 24 }]} placeholder="请输入姓名" />
          <ProFormText width="md" name="id_card" label="身份证" rules={[{ required: true, message: '请输入正确的身份证', len: 18 }]} placeholder="请输入身份证" />
          <ProFormText name="cert_name" width="md" label="证书名称" placeholder="请输入证书名称" />
          <ProFormRadio.Group label="证书状态" name="cert_status" radioType="radio" options={['有效', '注销']} />
        </ProForm.Group>
      </ProForm>
    </>
  );
}
