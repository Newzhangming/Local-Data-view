'use client';

import { EditTwoTone, HomeOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { Breadcrumb, message, Space } from 'antd';
import { useParams } from 'next/navigation';
import React, { useCallback } from 'react';

import { IdReq } from '@/constants/dto';
import { ManagerDto } from '@/constants/manager';
import { queryManager, updateManager } from '@/services/manager';
import { closeWindow } from '@/utils/close-window';

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
        <ProForm submitter={{ searchConfig: { submitText: '保存', resetText: '关闭' }, onReset: closeWindow }} onFinish={onFinish} params={params} request={getRequestData(params as IdReq)}>
          <ProForm.Group>
            <ProFormText width="sm" name="name" label="姓名" rules={[{ required: true, message: '请输入正确的姓名', min: 2, max: 24 }]} placeholder="请输入姓名" />
            <ProFormText width="sm" name="id_card" label="身份证" rules={[{ required: true, message: '请输入正确的身份证', len: 18 }]} placeholder="请输入身份证" />
            <ProFormText name="cert_name" width="sm" label="证书名称" placeholder="请输入证书名称" />
            <ProFormRadio.Group label="证书状态" name="cert_status" radioType="radio" options={['有效', '注销']} />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText
              width="md"
              name="lending_no"
              label="注册编号"
              tooltip={'如：鄂1422017201828198'}
              rules={[{ required: true, message: '请输入正确的注册编号', min: 10, max: 80 }]}
              placeholder="注册编号必须是10~20个汉字"
            />
            <ProFormText width="md" name="lending_to" label="注册单位" rules={[{ required: false, message: '请输入正确的注册单位', min: 6, max: 54 }]} placeholder="注册单位必须是6~40个汉字" />
            <ProFormRadio.Group label="性别" name="gender" radioType="radio" options={['男', '女']} />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText
              name={['source_id']}
              rules={[
                () => ({
                  validator(_, value: string) {
                    if (!value || (value.length >= 15 && value.length <= 20)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('输入长度必须在15到20个字符之间'));
                  },
                }),
              ]}
              width="sm"
              label="四库ID"
              placeholder="请输入四库ID"
              tooltip={'请确认后再填写'}
            />
          </ProForm.Group>
        </ProForm>
      </Space>
    </>
  );
}
