'use client';

import { ModalForm, ProCard, ProForm, ProFormCheckbox, ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { Button, Divider, List, message, Popconfirm, Skeleton, Table, TableColumnsType, Tabs, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { ConditionDto, ProjectRoleDto } from '@/constants/condition';
import { queryAreas, queryConditions, queryProjectRoles, removeCondition } from '@/services/condition';

export default function ConditionPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = theme.useToken();

  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState<{ key: string; label: string }[]>([]);
  const [projRoles, setProjRoles] = useState<ProjectRoleDto[]>([]);
  const [projConditions, setProjConditions] = useState<ConditionDto[]>([]);

  const [areaId, setAreaId] = useState<string>();
  const [projRoleId, setProjRoleId] = useState<string>();

  useEffect(() => getAreaData(), []);
  useEffect(() => getProjectRolesData(), [areaId]);
  useEffect(() => getConditionsData(), [projRoleId]);

  const getAreaData = () => {
    setLoading(true);
    queryAreas({})
      .then((res) => {
        setLoading(false);
        if (res.msg === '鉴权码缺失') {
          messageApi.error(res.msg).then(() => {
            router.replace('/auth', { scroll: false });
          });
        } else if (res.msg !== 'success') {
          messageApi.error(res.msg || '服务端错误', 5).then(() => {});
        } else {
          const items = res.data.map((area) => ({ label: area.name, key: area.id }));
          setTabs(items);
          setAreaId(res?.data?.[0]?.id);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getProjectRolesData = () => {
    if (!areaId) return;
    queryProjectRoles({ area_id: areaId }).then((res) => {
      if (res.msg !== 'success') {
        messageApi.error(res.msg || '服务端错误', 5).then(() => {});
      } else {
        setProjRoles(res.data);
        setAreaId(res?.data?.[0]?.area?.id);
        setProjRoleId(res?.data?.[0]?.id);
      }
    });
  };

  const getConditionsData = () => {
    if (!areaId || !projRoleId) return;
    queryConditions({ area_id: areaId, role_id: projRoleId }).then((res) => {
      if (res.msg !== 'success') {
        messageApi.error(res.msg || '服务端错误', 5).then(() => {});
      } else {
        setProjConditions(res.data);
      }
    });
  };

  const onNotReady = () => {
    messageApi.warning('暂未开放').then(() => {});
  };

  const onDelete = (type: string, id: string) => async () => {
    if (type === 'condition') {
      await removeCondition({ id });
      getConditionsData();
    }
  };

  const handleTabChange = (activeKey: string) => setAreaId(activeKey);
  const onSetProjRoleId = (item: ProjectRoleDto) => () => setProjRoleId(item.id);

  const projRolePrefix = projRoles.length ? `${projRoles?.[0]?.area?.name} - ` : '';
  const conditionPrefix = projConditions.length ? `${projConditions?.[0]?.area?.name} - ${projConditions?.[0]?.role?.name} - ` : '';

  const columns: TableColumnsType<ProjectRoleDto> = [
    { title: '序号', key: 'id', render: (text, record, index) => `${index + 1}` },
    { title: '业绩类别', dataIndex: 'name', key: 'name' },
    { title: '时间', dataIndex: 'duration', key: 'duration', render: (_, record) => `${record.duration}个月` },
    { title: '价格', dataIndex: 'amount', key: 'amount', render: (_, record) => `${record.amount}万+` },
    {
      title: '操作',
      key: 'options',
      render: (_, record) => (
        <>
          <a onClick={onSetProjRoleId(record)}>查看</a>
          <Divider type="vertical" style={{ borderColor: token.colorPrimaryBorder }} />
          <a onClick={onNotReady}>编辑</a>
        </>
      ),
    },
  ];

  const tableTitle = () => (
    <div className={'flex justify-between'}>
      <span />
      <h3>{projRolePrefix}业绩类别</h3>
      <Button type={'primary'} onClick={onNotReady}>
        添加
      </Button>
    </div>
  );

  const listHeader = (
    <div className={'flex justify-between'}>
      <span />
      <h5>{conditionPrefix}用人要求</h5>
      <Button type={'primary'} onClick={onNotReady}>
        添加
      </Button>
    </div>
  );

  return (
    <>
      {contextHolder}
      <Skeleton loading={loading} paragraph={{ rows: 1 }}>
        <Tabs defaultActiveKey="1" type="card" size={'large'} style={{ marginBottom: 32 }} items={tabs} onChange={handleTabChange} />
        <div className="flex w-4/5 border">
          <div className="w-1/2 pr-4">
            <Table rowKey={'id'} title={tableTitle} columns={columns} dataSource={projRoles} pagination={false} />
          </div>
          <div className="w-1/2 pl-4">
            <List
              dataSource={projConditions}
              header={listHeader}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <ModalForm key="right-del" title="编辑采集任务" clearOnDestroy={true} trigger={<a className={'text-blue-500'}>编辑</a>}>
                      <ProFormText width="xl" name="id" label="项目ID" initialValue={item.id} disabled={true} />
                      <ProFormText rules={[{ required: true, message: '请输入用人要求' }]} width="xl" name="content" label="用人要求" initialValue={item.content} />
                    </ModalForm>,
                    <Popconfirm title="您确认删除吗？" onConfirm={onDelete('condition', item.id)} okText="确认" cancelText="取消">
                      <a>删除</a>
                    </Popconfirm>,
                  ]}
                >
                  {item.content}
                </List.Item>
              )}
            />
          </div>
        </div>
        <ProForm layout={'horizontal'} onFinish={onNotReady}>
          <ProCard split="vertical">
            <ProCard title="工程项目要求" subTitle={'根据不同省份对工程项目要求，选择下列一项或多项'} headerBordered tooltip={'选错了可以重置'}>
              <ProFormCheckbox.Group name="date_logic" layout="horizontal" label="时间逻辑" options={['要符合']} />
              <ProFormCheckbox.Group name="data_level" layout="horizontal" label="数据等级" options={['A', 'B', 'C', 'D']} />
              <ProFormCheckbox.Group name="build_order" layout="horizontal" label="批建要求" options={['不能未批先建']} />
              <ProFormCheckbox.Group name="proj_5parties" layout="horizontal" label="五方要求" options={['建设单位', '监理企业', '勘察企业', '设计企业', '施工企业']} />
              <ProFormRadio.Group name="record_item" layout="horizontal" label="项数要求" options={['项目6项齐全', '项目7项齐全']} />
            </ProCard>
            <ProCard title="项目经理要求" subTitle={'根据不同省份用人要求，选择下列选择一项或多项'} headerBordered tooltip={'选错了可以重置'}>
              <ProFormCheckbox.Group name="reg_track" layout="horizontal" label="注册轨迹" options={['1年不超3条']} />
              <ProFormRadio.Group name="major" layout="horizontal" label="注册专业" options={['建筑工程', '市政公用工程']} />
              <ProFormRadio.Group name="kpi_count" layout="horizontal" label="业绩条数" options={['全B', '双B', '单B', '双C']} />
              <ProFormRadio.Group name="kpi_period" layout="horizontal" label="业绩有效期" options={['1年内', '3年内', ' 5年内']} />
            </ProCard>
          </ProCard>
        </ProForm>
      </Skeleton>
    </>
  );
}
