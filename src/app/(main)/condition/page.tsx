'use client';

import { message, Skeleton, Tabs } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { queryAreas } from '@/services/condition';

export default function ConditionPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const [tabs, setTabs] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => getAreaData(), []);

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
          messageApi.error(res.msg || '服务端错误', 5);
        } else {
          const items = res.data.map((area) => ({ label: area.name, key: area.id }));
          setTabs(items);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const [size, setSize] = useState<'small' | 'middle' | 'large'>('large');

  return (
    <>
      {contextHolder}
      <Skeleton loading={loading} paragraph={{ rows: 1 }}>
        <Tabs defaultActiveKey="1" type="card" size={size} style={{ marginBottom: 32 }} items={tabs} />
      </Skeleton>
    </>
  );
}
