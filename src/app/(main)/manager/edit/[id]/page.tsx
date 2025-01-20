'use client';

import { ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Id() {
  const params = useParams();
  const [type, setType] = useState('注销');
  const { id } = params;

  useEffect(() => {
    //
  }, []);

  return (
    <ProForm>
      <ProForm.Group>
        <ProFormText width="md" name="name" label="经理姓名" tooltip="最长为 24 位" placeholder="请输入姓名" />
        <ProFormText width="md" name="id_card" label="身份证" placeholder="请输入身份证" />
        <ProFormText name={['cert_name']} width="md" label="证书名称" placeholder="请输入证书名称" />
        <ProFormRadio.Group
          label="证书状态"
          name={'cert_status'}
          radioType="radio"
          fieldProps={{
            value: type,
            onChange: (e) => setType(e.target.value),
          }}
          options={['有效', '注销']}
        />
      </ProForm.Group>
    </ProForm>
  );
}
