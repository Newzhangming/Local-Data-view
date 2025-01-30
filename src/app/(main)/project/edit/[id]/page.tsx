'use client';

import { BgColorsOutlined, EditTwoTone, HomeOutlined } from '@ant-design/icons';
import { ProForm, ProFormDigit, ProFormInstance, ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { Breadcrumb, message, Space } from 'antd';
import { useParams } from 'next/navigation';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { IdReq } from '@/constants/dto';
import { ProjectDetailDto } from '@/constants/project';
import { queryProject, upsertProject } from '@/services/project';

export default function ProjectEdit() {
  const [messageApi, contextHolder] = message.useMessage();
  const params: Partial<IdReq> = useParams();
  const formRef = useRef<ProFormInstance>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const getRequestData = (params: IdReq) =>
    useCallback(async () => {
      const result = await queryProject(params);
      setLoading(false);
      return result.data;
    }, []);

  const onFinish = useCallback(async (fromData: ProjectDetailDto) => {
    try {
      setLoading(true);
      console.log('fromData------', fromData);
      const result = await upsertProject(fromData);
      if (result.msg === 'success') {
        messageApi.success('保存成功', 3);
        setLoading(false);
      } else {
        messageApi.error(result.msg, 5);
        setLoading(false);
      }
    } catch {
      messageApi.error('错误', 5);
      setLoading(false);
    }
  }, []);

  const breadcrumbItems = useMemo(
    () => [
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
            <BgColorsOutlined />
            <span>工程项目</span>
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
    ],
    [],
  );

  return (
    <>
      {contextHolder}
      <Space direction={'vertical'} size={'large'}>
        <Breadcrumb items={breadcrumbItems} />
        <ProForm<ProjectDetailDto>
          formRef={formRef}
          loading={loading}
          submitter={{ searchConfig: { submitText: '保存' } }}
          onFinish={onFinish}
          params={params}
          request={getRequestData(params as IdReq)}
        >
          <ProForm.Group>
            <ProFormText name="proj_name" width="lg" label="项目名" rules={[{ required: true, message: '请输入正确的项目名', min: 4, max: 50 }]} placeholder="请输入项目名" />
            <ProFormText name="proj_no" width="sm" rules={[{ required: true, message: '请输入正确的项目编号', min: 10 }]} label="项目编号" placeholder="请输入项目编号" />
            <ProFormRadio.Group name="data_level" label="数据等级" options={['A', 'B', 'C', 'D']} />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText name="proj_type" width="xs" label="项目分类" placeholder="请输入项目分类" />
            <ProFormDigit name="total_area" width="xs" label="总面积(平方米)" placeholder="请输入总面积" />
            <ProFormText name="address" width="lg" label="项目地址" placeholder="请输入地址" />
            <ProFormText name="region" disabled label="项目区划" placeholder="请输入项目区划" />
          </ProForm.Group>
        </ProForm>
      </Space>
    </>
  );
}
