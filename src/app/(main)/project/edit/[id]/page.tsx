'use client';

import { BgColorsOutlined, CopyOutlined, DeleteOutlined, EditTwoTone, HomeOutlined } from '@ant-design/icons';
import { ProForm, ProFormDigit, ProFormGroup, ProFormInstance, ProFormList, ProFormRadio, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Breadcrumb, message, Space, Tag } from 'antd';
import { useParams } from 'next/navigation';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { IdReq } from '@/constants/dto';
import { ProjectDetailDto, ProjUnit } from '@/constants/project';
import { queryProject, upsertProject, upsertUnit } from '@/services/project';
import { closeWindow } from '@/utils/close-window';

export default function ProjectEdit() {
  const [messageApi, contextHolder] = message.useMessage();
  const params: Partial<IdReq> = useParams();
  const formRef = useRef<ProFormInstance>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [projUnits, setProjUnits] = useState<ProjUnit[]>([]);

  const getRequestData = () =>
    useCallback(async () => {
      const result = await queryProject(params.id as string);
      setLoading(false);
      setProjUnits(result.data?.proj_units || []);
      return result.data;
    }, []);

  const onFinish = useCallback(async (fromData: ProjectDetailDto) => {
    try {
      setLoading(true);
      const [result] = await Promise.all([upsertProject(fromData), upsertUnit(fromData)]);
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

  const conclusionOptions = [
    { value: 'pass', label: <Tag color="green">通过</Tag> },
    { value: 'pending', label: <Tag color="orange">待补充材料</Tag> },
    { value: 'scrap', label: <Tag color="red">废弃</Tag> },
  ];

  const dataLevelOptions = [
    { value: 'A', label: <Tag color="green">A</Tag> },
    { value: 'B', label: <Tag color="orange">B</Tag> },
    { value: 'C', label: <Tag color="magenta">C</Tag> },
    { value: 'D', label: <Tag color="red">D</Tag> },
  ];

  // 'xs' | 'sm' | 'md' | 'xl' | 'lg';
  return (
    <>
      {contextHolder}
      <Space direction={'vertical'} size={'large'}>
        <Breadcrumb items={breadcrumbItems} />
        <ProForm<ProjectDetailDto>
          formRef={formRef}
          loading={loading}
          submitter={{ searchConfig: { submitText: '保存', resetText: '关闭' }, onReset: closeWindow }}
          onFinish={onFinish}
          params={params}
          request={getRequestData()}
        >
          <ProForm.Group>
            <ProFormText name="proj_name" width="lg" label="项目名" rules={[{ required: true, message: '请输入正确的项目名', min: 2, max: 300 }]} placeholder="请输入项目名" />
            <ProFormText name="proj_no" width="sm" rules={[{ required: true, message: '请输入正确的项目编号', min: 10 }]} label="项目编号" placeholder="请输入项目编号" />
            <ProFormRadio.Group name="data_level" label="数据等级" options={dataLevelOptions} />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText name="proj_type" width="xs" label="项目分类" placeholder="请输入项目分类" />
            <ProFormDigit name="total_area" width="xs" label="总面积(平方米)" placeholder="请输入总面积" />
            <ProFormText name="address" width="lg" label="项目地址" placeholder="请输入地址" />
            <ProFormText name="region" disabled label="项目区划" placeholder="请输入项目区划" />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText name={['managers', 'name']} width="xs" label="项目经理" placeholder="请输入项目经理" disabled />
            <ProFormText
              name={['source_id']}
              rules={[
                () => ({
                  validator(_, value: string) {
                    if (!value || (value.length >= 5 && value.length <= 10)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('输入长度必须在5到10个字符之间'));
                  },
                }),
              ]}
              width="sm"
              label="四库ID"
              placeholder="请输入四库ID"
              tooltip={'请确认后再填写'}
            />
            <ProFormText name={['scale_desc']} width="xl" label="建设规模" />
          </ProForm.Group>
          <ProFormList
            name="labels"
            label="单体信息"
            initialValue={projUnits}
            copyIconProps={{ Icon: CopyOutlined, tooltipText: '复制此项到末尾' }}
            deleteIconProps={{ Icon: DeleteOutlined, tooltipText: '不需要这行了' }}
          >
            <ProFormGroup key="proj_units">
              <ProFormText
                name="unit_no"
                label="单体编号"
                width="sm"
                rules={[{ required: true, message: '请输入单体编号', pattern: new RegExp('^\\d{16}-\\d{2,}$') }]}
                placeholder={'4510022311020001-001'}
              />
              <ProFormText name="unit_name" label="单体建（构）筑物名称" placeholder={'单体建（构）筑物名称'} rules={[{ required: true, message: '单体名称长度2~100汉字', min: 2, max: 100 }]} />
              <ProFormDigit name="unit_cost" label="造价(万元)" width="xs" placeholder={'造价'} fieldProps={{ precision: 2 }} />
              <ProFormDigit name="unit_area" label="面积(平方米)" width="xs" placeholder={'面积'} fieldProps={{ precision: 2 }} />
              <ProFormDigit name="height" label="高度(米)" width="xs" placeholder={'高度'} fieldProps={{ precision: 2 }} />
            </ProFormGroup>
          </ProFormList>
          <ProFormRadio.Group name="conclusion" label={'判定项目可用'} options={conclusionOptions} />
          <ProFormTextArea
            name="remark"
            label="项目备注"
            rules={[{ required: false, message: '项目备注内容不能超过300个汉字', max: 300 }]}
            placeholder="请输入项目备注"
            fieldProps={{ showCount: true, maxLength: 300 }}
          />
        </ProForm>
      </Space>
    </>
  );
}
