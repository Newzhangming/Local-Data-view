'use client';

import { type ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Divider, List, message, Skeleton, Tabs, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { ConditionDto, ProjectRoleDto } from '@/constants/condition';
import { queryAreas, queryConditions, queryProjectRoles } from '@/services/condition';

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

  const handleTabChange = (activeKey: string) => setAreaId(activeKey);
  const onSetProjRoleId = (item: ProjectRoleDto) => () => setProjRoleId(item.id);

  const projRolePrefix = projRoles.length ? `${projRoles?.[0]?.area?.name} - ` : '';
  const conditionPrefix = projConditions.length ? `${projConditions?.[0]?.area?.name} - ${projConditions?.[0]?.role?.name} - ` : '';

  const columns: ProColumns<ProjectRoleDto>[] = [
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

  return (
    <>
      {contextHolder}
      <Skeleton loading={loading} paragraph={{ rows: 1 }}>
        <Tabs defaultActiveKey="1" type="card" size={'large'} style={{ marginBottom: 32 }} items={tabs} onChange={handleTabChange} />
        <div className="flex w-4/5 border">
          <div className="w-1/2 pr-4">
            <ProTable<ProjectRoleDto>
              title={() => (
                <div className={'flex justify-between'}>
                  <span />
                  <h3>{projRolePrefix}业绩类别</h3>
                  <Button type={'primary'} onClick={onNotReady}>
                    添加
                  </Button>
                </div>
              )}
              dataSource={projRoles}
              search={false}
              columns={columns}
              toolBarRender={false}
              pagination={false}
            />
          </div>
          <div className="w-1/2 pl-4">
            <List
              dataSource={projConditions}
              header={
                <div className={'flex justify-between'}>
                  <span />
                  <h5>{conditionPrefix}用人要求</h5>
                  <Button type={'primary'} onClick={onNotReady}>
                    添加
                  </Button>
                </div>
              }
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a key="right-edit" onClick={onNotReady}>
                      编辑
                    </a>,
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
