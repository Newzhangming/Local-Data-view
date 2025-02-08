'use client';

import { EditTwoTone, HomeOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { Breadcrumb, message, Space } from 'antd';
import { useParams } from 'next/navigation';
import { useCallback } from 'react';

import { IdReq } from '@/constants/dto';
import { ManagerDto } from '@/constants/manager';
import { queryManager, updateManager } from '@/services/manager';

export default function ManagerEdit() {
  const [messageApi, contextHolder] = message.useMessage();
  const params: Partial<IdReq> = useParams();

  const getRequestData = (params: IdReq) => useCallback(async () => queryManager(params).then((res) => res.data), []);

  const onFinish = useCallback(async (fromData: ManagerDto) => {
    const input = { ...params, ...fromData };
    const result = await updateManager(input);
    if (result.msg === 'success') {
      messageApi.success('保存成功', 3);
    } else {
      messageApi.error(result.msg, 5);
    }
  }, []);

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
      href: '/manager',
      title: (
        <>
          <UsergroupAddOutlined />
          <span>项目经理</span>
        </>
      ),
    },
    {
      title: (
        <>
          <EditTwoTone />
          <span>编辑</span>
        </>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Space direction={'vertical'} size={'large'}>
        <Breadcrumb items={breadcrumbItems} />
        <ProForm submitter={{ searchConfig: { submitText: '保存' } }} onFinish={onFinish} params={params} request={getRequestData(params as IdReq)}>
          <ProForm.Group>
            <ProFormText width="sm" name="name" label="姓名" rules={[{ required: true, message: '请输入正确的姓名', min: 2, max: 24 }]} placeholder="请输入姓名" />
            <ProFormText width="sm" name="id_card" label="身份证" rules={[{ required: true, message: '请输入正确的身份证', len: 18 }]} placeholder="请输入身份证" />
            <ProFormText name="cert_name" width="sm" label="证书名称" placeholder="请输入证书名称" />
            <ProFormRadio.Group label="证书状态" name="cert_status" radioType="radio" options={['有效', '注销']} />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText width="md" name="lending_to" label="注册单位" rules={[{ required: true, message: '请输入正确的注册单位', min: 6, max: 54 }]} placeholder="请输入正确的注册单位" />
            <ProFormText width="md" name="lending_no" label="注册编号" rules={[{ required: true, message: '请输入正确的注册编号', min: 10 }]} placeholder="请输入正确的注册编号" />
            <ProFormRadio.Group label="性别" name="gender" radioType="radio" options={['男', '女']} />
          </ProForm.Group>
        </ProForm>
      </Space>
    </>
  );
}
