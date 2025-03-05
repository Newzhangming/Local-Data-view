'use client';

import { ModalForm, ProFormText } from '@ant-design/pro-components';
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
      </Skeleton>
    </>
  );
}
